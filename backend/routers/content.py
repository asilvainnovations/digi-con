import re
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from lib.auth import current_admin, current_user, public_user
from lib.db import db

router = APIRouter(tags=["blog"])
admin_router = APIRouter(prefix="/admin", tags=["admin"])


class PostBase(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    excerpt: str = Field(default="", max_length=400)
    body: str = Field(default="", max_length=20000)
    category: str = Field(default="Networking", max_length=60)
    tags: list[str] = Field(default_factory=list)
    cover_url: str = Field(default="", max_length=500)
    seo_title: str = Field(default="", max_length=160)
    seo_description: str = Field(default="", max_length=300)
    published: bool = False


class Post(PostBase):
    id: str
    slug: str
    created_at: str


def to_post(d: dict) -> Post:
    data = {k: d[k] for k in PostBase.model_fields if d.get(k) is not None}
    created = d.get("created_at")
    if created and getattr(created, "tzinfo", None) is None:
        created = created.replace(tzinfo=timezone.utc)
    return Post(**PostBase(**data).model_dump(), id=d["id"], slug=d["slug"],
                created_at=created.isoformat() if created else "")


@router.get("/posts", response_model=list[Post])
async def list_posts(category: str = ""):
    query: dict = {"published": True}
    if category:
        query["category"] = category
    docs = await db.blog_posts.find(query).sort("created_at", -1).to_list(100)
    return [to_post(d) for d in docs]


@router.get("/posts/{slug}", response_model=Post)
async def get_post(slug: str):
    doc = await db.blog_posts.find_one({"slug": slug, "published": True})
    if not doc:
        raise HTTPException(status_code=404, detail="Article not found")
    return to_post(doc)


# ---------- admin ----------

class AdminUser(BaseModel):
    id: str
    email: str
    name: str
    role: str
    plan: str
    onboarded: bool
    connections: int


class PlanChange(BaseModel):
    plan: str = Field(pattern="^(free|pro)$")


class AdminStats(BaseModel):
    users: int
    paid_users: int
    cards: int
    relationships: int
    followups: int
    posts: int
    published_posts: int


@admin_router.get("/stats", response_model=AdminStats)
async def admin_stats(_: dict = Depends(current_admin)):
    return AdminStats(
        users=await db.users.count_documents({}),
        paid_users=await db.users.count_documents({"plan": {"$in": ["pro", "business"]}}),
        cards=await db.cards.count_documents({}),
        relationships=await db.relationships.count_documents({}),
        followups=await db.followups.count_documents({}),
        posts=await db.blog_posts.count_documents({}),
        published_posts=await db.blog_posts.count_documents({"published": True}),
    )


@admin_router.get("/users", response_model=list[AdminUser])
async def admin_users(_: dict = Depends(current_admin)):
    docs = await db.users.find().sort("created_at", -1).to_list(500)
    out = []
    for d in docs:
        pu = public_user(d)
        out.append(
            AdminUser(
                id=pu["id"], email=pu["email"], name=pu["name"], role=pu["role"], plan=pu["plan"],
                onboarded=pu["onboarded"],
                connections=await db.relationships.count_documents({"user_id": d["id"]}),
            )
        )
    return out


@admin_router.patch("/users/{user_id}/plan", response_model=AdminUser)
async def change_plan(user_id: str, body: PlanChange, _: dict = Depends(current_admin)):
    doc = await db.users.find_one({"id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    await db.users.update_one({"id": user_id}, {"$set": {"plan": body.plan}})
    doc["plan"] = body.plan
    pu = public_user(doc)
    return AdminUser(
        id=pu["id"], email=pu["email"], name=pu["name"], role=pu["role"], plan=pu["plan"],
        onboarded=pu["onboarded"],
        connections=await db.relationships.count_documents({"user_id": user_id}),
    )


@admin_router.get("/posts", response_model=list[Post])
async def admin_posts(_: dict = Depends(current_admin)):
    docs = await db.blog_posts.find().sort("created_at", -1).to_list(200)
    return [to_post(d) for d in docs]


@admin_router.post("/posts", response_model=Post)
async def create_post(body: PostBase, _: dict = Depends(current_admin)):
    slug = re.sub(r"[^a-z0-9]+", "-", body.title.lower()).strip("-")[:60] or str(uuid.uuid4())[:8]
    if await db.blog_posts.find_one({"slug": slug}):
        slug = f"{slug}-{str(uuid.uuid4())[:4]}"
    doc = body.model_dump()
    doc.update({"id": str(uuid.uuid4()), "slug": slug, "created_at": datetime.now(timezone.utc)})
    await db.blog_posts.insert_one(doc)
    return to_post(doc)


@admin_router.put("/posts/{post_id}", response_model=Post)
async def update_post(post_id: str, body: PostBase, _: dict = Depends(current_admin)):
    doc = await db.blog_posts.find_one({"id": post_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Article not found")
    updates = body.model_dump()
    await db.blog_posts.update_one({"id": post_id}, {"$set": updates})
    doc.update(updates)
    return to_post(doc)


@admin_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, _: dict = Depends(current_admin)):
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"ok": True}


class MeGate(BaseModel):
    feature: str
    allowed: bool
    reason: Optional[str] = None


@router.get("/entitlements", response_model=list[MeGate])
async def entitlements(user: dict = Depends(current_user)):
    paid = user.get("plan", "free") in ("pro", "business")
    return [
        MeGate(feature=f, allowed=paid, reason=None if paid else "Upgrade to DigiCon Pro")
        for f in ["analytics", "export", "wallet", "landing_pwa", "crm_pipeline", "multi_card"]
    ]
