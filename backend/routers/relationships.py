import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from lib.auth import current_user
from lib.db import db

router = APIRouter(tags=["relationships"])

STATUSES = [
    "New",
    "Connected",
    "Qualified",
    "Follow Up",
    "In Progress",
    "Active",
    "Partner",
    "Customer",
    "Prospect",
    "Opportunity",
    "Dormant",
]


class RelationshipBase(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    company: str = Field(default="", max_length=120)
    position: str = Field(default="", max_length=120)
    email: str = Field(default="", max_length=120)
    phone: str = Field(default="", max_length=40)
    website: str = Field(default="", max_length=200)
    avatar_url: str = Field(default="", max_length=500)
    met_at: str = Field(default="", max_length=160)
    event: str = Field(default="", max_length=160)
    date_met: str = Field(default="", max_length=20)
    category: str = Field(default="Contact", max_length=60)
    tags: list[str] = Field(default_factory=list)
    interest: str = Field(default="", max_length=160)
    status: str = Field(default="New", max_length=30)
    notes: str = Field(default="", max_length=4000)
    opportunity_value: float = 0.0
    health: int = Field(default=70, ge=0, le=100)


class Relationship(RelationshipBase):
    id: str
    source: str = "manual"
    last_interaction: Optional[str] = None
    next_action: Optional[str] = None
    next_action_due: Optional[str] = None


class Interaction(BaseModel):
    id: str
    relationship_id: str
    kind: str
    summary: str
    created_at: str


class InteractionCreate(BaseModel):
    kind: str = Field(min_length=1, max_length=60)
    summary: str = Field(min_length=1, max_length=1000)


def iso(value) -> Optional[str]:
    if not value:
        return None
    if isinstance(value, str):
        return value
    return value.replace(tzinfo=timezone.utc).isoformat() if value.tzinfo is None else value.isoformat()


def to_rel(doc: dict) -> Relationship:
    data = {k: doc[k] for k in RelationshipBase.model_fields if doc.get(k) is not None}
    base = RelationshipBase(**data)
    return Relationship(
        **base.model_dump(),
        id=doc["id"],
        source=doc.get("source", "manual"),
        last_interaction=iso(doc.get("last_interaction")),
        next_action=doc.get("next_action"),
        next_action_due=doc.get("next_action_due"),
    )


@router.get("/relationships", response_model=list[Relationship])
async def list_relationships(
    q: str = "", status: str = "", tag: str = "", user: dict = Depends(current_user)
):
    query: dict = {"user_id": user["id"]}
    if status:
        query["status"] = status
    if tag:
        query["tags"] = tag
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"company": {"$regex": q, "$options": "i"}},
            {"event": {"$regex": q, "$options": "i"}},
        ]
    docs = await db.relationships.find(query).sort("created_at", -1).to_list(500)
    rels = [to_rel(d) for d in docs]
    pending = await db.followups.find(
        {"user_id": user["id"], "status": {"$ne": "Completed"}}
    ).sort("due_date", 1).to_list(1000)
    by_rel: dict[str, dict] = {}
    for f in pending:
        by_rel.setdefault(f["relationship_id"], f)
    for r in rels:
        f = by_rel.get(r.id)
        if f:
            r.next_action = f["title"]
            r.next_action_due = f["due_date"]
    return rels


@router.post("/relationships", response_model=Relationship)
async def create_relationship(body: RelationshipBase, user: dict = Depends(current_user)):
    now = datetime.now(timezone.utc)
    doc = body.model_dump()
    doc.update(
        {"id": str(uuid.uuid4()), "user_id": user["id"], "source": "manual",
         "last_interaction": now, "created_at": now}
    )
    await db.relationships.insert_one(doc)
    await db.interactions.insert_one(
        {"id": str(uuid.uuid4()), "relationship_id": doc["id"], "user_id": user["id"],
         "kind": "Added to network", "summary": f"Met at {body.met_at or 'an event'}.", "created_at": now}
    )
    return to_rel(doc)


@router.get("/relationships/{rel_id}", response_model=Relationship)
async def get_relationship(rel_id: str, user: dict = Depends(current_user)):
    doc = await db.relationships.find_one({"id": rel_id, "user_id": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Relationship not found")
    rel = to_rel(doc)
    f = await db.followups.find_one(
        {"relationship_id": rel_id, "status": {"$ne": "Completed"}}, sort=[("due_date", 1)]
    )
    if f:
        rel.next_action = f["title"]
        rel.next_action_due = f["due_date"]
    return rel


@router.put("/relationships/{rel_id}", response_model=Relationship)
async def update_relationship(rel_id: str, body: RelationshipBase, user: dict = Depends(current_user)):
    doc = await db.relationships.find_one({"id": rel_id, "user_id": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Relationship not found")
    updates = body.model_dump()
    await db.relationships.update_one({"id": rel_id}, {"$set": updates})
    doc.update(updates)
    return to_rel(doc)


@router.delete("/relationships/{rel_id}")
async def delete_relationship(rel_id: str, user: dict = Depends(current_user)):
    result = await db.relationships.delete_one({"id": rel_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Relationship not found")
    await db.interactions.delete_many({"relationship_id": rel_id})
    await db.followups.delete_many({"relationship_id": rel_id})
    return {"ok": True}


@router.get("/relationships/{rel_id}/interactions", response_model=list[Interaction])
async def list_interactions(rel_id: str, user: dict = Depends(current_user)):
    docs = await db.interactions.find({"relationship_id": rel_id, "user_id": user["id"]}).sort(
        "created_at", -1
    ).to_list(200)
    return [
        Interaction(id=d["id"], relationship_id=d["relationship_id"], kind=d["kind"],
                    summary=d["summary"], created_at=iso(d["created_at"]) or "")
        for d in docs
    ]


@router.post("/relationships/{rel_id}/interactions", response_model=Interaction)
async def add_interaction(rel_id: str, body: InteractionCreate, user: dict = Depends(current_user)):
    rel = await db.relationships.find_one({"id": rel_id, "user_id": user["id"]})
    if not rel:
        raise HTTPException(status_code=404, detail="Relationship not found")
    now = datetime.now(timezone.utc)
    doc = {"id": str(uuid.uuid4()), "relationship_id": rel_id, "user_id": user["id"],
           "kind": body.kind, "summary": body.summary, "created_at": now}
    await db.interactions.insert_one(doc)
    await db.relationships.update_one({"id": rel_id}, {"$set": {"last_interaction": now}})
    return Interaction(id=doc["id"], relationship_id=rel_id, kind=body.kind,
                       summary=body.summary, created_at=iso(now) or "")
