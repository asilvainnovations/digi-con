import io
import uuid
from datetime import datetime, timezone
from typing import Optional

import qrcode
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import PlainTextResponse, StreamingResponse
from pydantic import BaseModel, Field

from lib.auth import current_user, is_paid, require_feature
from lib.db import db
from routers.auth import unique_slug

router = APIRouter(tags=["cards"])


class Social(BaseModel):
    label: str = Field(max_length=40)
    url: str = Field(max_length=300)


class CardBase(BaseModel):
    label: str = Field(default="Primary", max_length=40)
    template: str = Field(default="founder", max_length=40)
    orientation: str = Field(default="portrait", pattern="^(portrait|landscape)$")
    accent: str = Field(default="#22d3ee", max_length=20)
    name: str = Field(min_length=1, max_length=80)
    title: str = Field(default="", max_length=120)
    company: str = Field(default="", max_length=120)
    bio: str = Field(default="", max_length=400)
    phone: str = Field(default="", max_length=40)
    email: str = Field(default="", max_length=120)
    website: str = Field(default="", max_length=200)
    location: str = Field(default="", max_length=120)
    avatar_url: str = Field(default="", max_length=500)
    logo_url: str = Field(default="", max_length=500)
    services: list[str] = Field(default_factory=list)
    socials: list[Social] = Field(default_factory=list)
    booking_url: str = Field(default="", max_length=300)
    published: bool = True


class Card(CardBase):
    id: str
    slug: str
    views: int = 0


def to_card(doc: dict) -> Card:
    return Card(
        id=doc["id"],
        slug=doc["slug"],
        views=doc.get("views", 0),
        label=doc.get("label", "Primary"),
        template=doc.get("template", "founder"),
        orientation=doc.get("orientation", "portrait"),
        accent=doc.get("accent", "#22d3ee"),
        name=doc.get("name", ""),
        title=doc.get("title", ""),
        company=doc.get("company", ""),
        bio=doc.get("bio", ""),
        phone=doc.get("phone", ""),
        email=doc.get("email", ""),
        website=doc.get("website", ""),
        location=doc.get("location", ""),
        avatar_url=doc.get("avatar_url", ""),
        logo_url=doc.get("logo_url", ""),
        services=doc.get("services", []),
        socials=[Social(**s) for s in doc.get("socials", [])],
        booking_url=doc.get("booking_url", ""),
        published=doc.get("published", True),
    )


@router.get("/cards", response_model=list[Card])
async def list_cards(user: dict = Depends(current_user)):
    docs = await db.cards.find({"user_id": user["id"]}).to_list(100)
    return [to_card(d) for d in docs]


@router.post("/cards", response_model=Card)
async def create_card(body: CardBase, user: dict = Depends(current_user)):
    count = await db.cards.count_documents({"user_id": user["id"]})
    if count >= 1 and not is_paid(user):
        raise HTTPException(status_code=402, detail="Free plan includes 1 card. Upgrade to add more.")
    doc = body.model_dump()
    doc.update(
        {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "slug": await unique_slug(f"{body.name}-{body.label}"),
            "views": 0,
            "socials": [s.model_dump() for s in body.socials],
            "created_at": datetime.now(timezone.utc),
        }
    )
    await db.cards.insert_one(doc)
    return to_card(doc)


@router.put("/cards/{card_id}", response_model=Card)
async def update_card(card_id: str, body: CardBase, user: dict = Depends(current_user)):
    doc = await db.cards.find_one({"id": card_id, "user_id": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Card not found")
    updates = body.model_dump()
    updates["socials"] = [s.model_dump() for s in body.socials]
    await db.cards.update_one({"id": card_id}, {"$set": updates})
    doc.update(updates)
    return to_card(doc)


@router.delete("/cards/{card_id}")
async def delete_card(card_id: str, user: dict = Depends(current_user)):
    result = await db.cards.delete_one({"id": card_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Card not found")
    return {"ok": True}


@router.get("/cards/{card_id}/export")
async def export_card(card_id: str, user: dict = Depends(current_user)):
    """Paid feature: image/wallet export payload. Enforced server-side."""
    require_feature(user, "export")
    doc = await db.cards.find_one({"id": card_id, "user_id": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Card not found")
    return {
        "slug": doc["slug"],
        "wallet_pass_url": f"/api/public/cards/{doc['slug']}/vcard",
        "qr_url": f"/api/public/cards/{doc['slug']}/qr.png",
        "note": "Apple/Google Wallet pass signing requires provider certificates (see docs/wallet).",
    }


# ---------- public (no auth) ----------

public_router = APIRouter(prefix="/public", tags=["public"])


class PublicCard(Card):
    owner_plan: str


@public_router.get("/cards/{slug}", response_model=PublicCard)
async def get_public_card(slug: str):
    doc = await db.cards.find_one({"slug": slug, "published": True})
    if not doc:
        raise HTTPException(status_code=404, detail="Card not found")
    await db.cards.update_one({"id": doc["id"]}, {"$inc": {"views": 1}})
    owner = await db.users.find_one({"id": doc["user_id"]})
    card = to_card(doc)
    return PublicCard(**card.model_dump(), owner_plan=(owner or {}).get("plan", "free"))


@public_router.get("/cards/{slug}/qr.png")
async def card_qr(slug: str, request: Request):
    doc = await db.cards.find_one({"slug": slug})
    if not doc:
        raise HTTPException(status_code=404, detail="Card not found")
    origin = str(request.base_url).rstrip("/")
    img = qrcode.make(f"{origin}/c/{slug}")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")


@public_router.get("/cards/{slug}/vcard", response_class=PlainTextResponse)
async def card_vcard(slug: str):
    d = await db.cards.find_one({"slug": slug, "published": True})
    if not d:
        raise HTTPException(status_code=404, detail="Card not found")
    lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        f"FN:{d.get('name', '')}",
        f"TITLE:{d.get('title', '')}",
        f"ORG:{d.get('company', '')}",
        f"TEL;TYPE=CELL:{d.get('phone', '')}",
        f"EMAIL:{d.get('email', '')}",
        f"URL:{d.get('website', '')}",
        "END:VCARD",
    ]
    return PlainTextResponse("\n".join(lines), media_type="text/vcard")


class ContactExchange(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str = Field(default="", max_length=120)
    phone: str = Field(default="", max_length=40)
    company: str = Field(default="", max_length=120)
    position: str = Field(default="", max_length=120)
    met_at: str = Field(default="", max_length=120)
    message: str = Field(default="", max_length=400)


@public_router.post("/cards/{slug}/connect")
async def connect(slug: str, body: ContactExchange):
    """Contact exchange from a public card — no registration required for the visitor."""
    card = await db.cards.find_one({"slug": slug, "published": True})
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    now = datetime.now(timezone.utc)
    rel_id = str(uuid.uuid4())
    await db.relationships.insert_one(
        {
            "id": rel_id,
            "user_id": card["user_id"],
            "name": body.name,
            "company": body.company,
            "position": body.position,
            "email": body.email,
            "phone": body.phone,
            "website": "",
            "avatar_url": "",
            "met_at": body.met_at or "DigiCon card share",
            "event": body.met_at,
            "date_met": now.date().isoformat(),
            "category": "Inbound",
            "tags": ["inbound", "card-scan"],
            "interest": "",
            "status": "New",
            "notes": body.message,
            "opportunity_value": 0.0,
            "health": 70,
            "source": "public_card",
            "last_interaction": now,
            "created_at": now,
        }
    )
    await db.interactions.insert_one(
        {
            "id": str(uuid.uuid4()),
            "relationship_id": rel_id,
            "user_id": card["user_id"],
            "kind": "Connected via card",
            "summary": body.message or f"{body.name} shared their contact details from your DigiCon card.",
            "created_at": now,
        }
    )
    return {"ok": True, "owner_name": card.get("name", "")}


class SlugCheck(BaseModel):
    available: bool
    suggestion: Optional[str] = None
