import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from lib.auth import current_user
from lib.dates import today_iso
from lib.db import db

router = APIRouter(tags=["followups"])


class FollowUpBase(BaseModel):
    relationship_id: str
    title: str = Field(min_length=1, max_length=160)
    kind: str = Field(default="Task", max_length=40)
    due_date: str = Field(min_length=8, max_length=20)
    notes: str = Field(default="", max_length=1000)
    status: str = Field(default="Pending", pattern="^(Pending|In Progress|Completed)$")


class FollowUp(FollowUpBase):
    id: str
    contact_name: str = ""
    contact_company: str = ""
    overdue: bool = False


class FollowUpStatus(BaseModel):
    status: str = Field(pattern="^(Pending|In Progress|Completed)$")


async def decorate(docs: list[dict], user_id: str) -> list[FollowUp]:
    rel_ids = list({d["relationship_id"] for d in docs})
    rels = await db.relationships.find({"id": {"$in": rel_ids}, "user_id": user_id}).to_list(500)
    by_id = {r["id"]: r for r in rels}
    today = today_iso()
    out = []
    for d in docs:
        rel = by_id.get(d["relationship_id"], {})
        out.append(
            FollowUp(
                id=d["id"],
                relationship_id=d["relationship_id"],
                title=d["title"],
                kind=d.get("kind", "Task"),
                due_date=d["due_date"],
                notes=d.get("notes", ""),
                status=d.get("status", "Pending"),
                contact_name=rel.get("name", "Unknown contact"),
                contact_company=rel.get("company", ""),
                overdue=d.get("status") != "Completed" and d["due_date"] < today,
            )
        )
    return out


@router.get("/followups", response_model=list[FollowUp])
async def list_followups(status: str = "", user: dict = Depends(current_user)):
    query: dict = {"user_id": user["id"]}
    if status:
        query["status"] = status
    docs = await db.followups.find(query).sort("due_date", 1).to_list(500)
    return await decorate(docs, user["id"])


@router.post("/followups", response_model=FollowUp)
async def create_followup(body: FollowUpBase, user: dict = Depends(current_user)):
    rel = await db.relationships.find_one({"id": body.relationship_id, "user_id": user["id"]})
    if not rel:
        raise HTTPException(status_code=404, detail="Relationship not found")
    doc = body.model_dump()
    doc.update({"id": str(uuid.uuid4()), "user_id": user["id"], "created_at": datetime.now(timezone.utc)})
    await db.followups.insert_one(doc)
    return (await decorate([doc], user["id"]))[0]


@router.patch("/followups/{followup_id}", response_model=FollowUp)
async def set_status(followup_id: str, body: FollowUpStatus, user: dict = Depends(current_user)):
    doc = await db.followups.find_one({"id": followup_id, "user_id": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    now = datetime.now(timezone.utc)
    await db.followups.update_one(
        {"id": followup_id}, {"$set": {"status": body.status, "updated_at": now}}
    )
    doc["status"] = body.status
    if body.status == "Completed":
        await db.interactions.insert_one(
            {"id": str(uuid.uuid4()), "relationship_id": doc["relationship_id"], "user_id": user["id"],
             "kind": "Follow-up completed", "summary": doc["title"], "created_at": now}
        )
        await db.relationships.update_one(
            {"id": doc["relationship_id"]}, {"$set": {"last_interaction": now}}
        )
    return (await decorate([doc], user["id"]))[0]


@router.delete("/followups/{followup_id}")
async def delete_followup(followup_id: str, user: dict = Depends(current_user)):
    result = await db.followups.delete_one({"id": followup_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    return {"ok": True}
