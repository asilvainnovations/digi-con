import re
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, EmailStr, Field

from lib.auth import (
    clear_session_cookie,
    current_user,
    hash_password,
    public_user,
    set_session_cookie,
    verify_password,
)
from lib.db import db

router = APIRouter(prefix="/auth", tags=["auth"])


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class OnboardingRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    title: str = Field(default="", max_length=120)
    company: str = Field(default="", max_length=120)
    phone: str = Field(default="", max_length=40)
    avatar_url: str = Field(default="", max_length=500)
    networking_goal: str = Field(default="", max_length=120)
    template: str = Field(default="founder", max_length=40)


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=80)
    title: Optional[str] = Field(default=None, max_length=120)
    company: Optional[str] = Field(default=None, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=40)
    avatar_url: Optional[str] = Field(default=None, max_length=500)
    networking_goal: Optional[str] = Field(default=None, max_length=120)


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str
    plan: str
    title: str
    company: str
    phone: str
    avatar_url: str
    networking_goal: str
    onboarded: bool


def slugify(value: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-") or "digicon"
    return base[:40]


async def unique_slug(value: str) -> str:
    base = slugify(value)
    slug = base
    n = 1
    while await db.cards.find_one({"slug": slug}):
        n += 1
        slug = f"{base}-{n}"
    return slug


@router.post("/signup", response_model=UserOut)
async def signup(body: SignupRequest, response: Response):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "name": body.name.strip(),
        "password": hash_password(body.password),
        "role": "user",
        "plan": "free",
        "title": "",
        "company": "",
        "phone": "",
        "avatar_url": "",
        "networking_goal": "",
        "onboarded": False,
        "created_at": datetime.now(timezone.utc),
    }
    await db.users.insert_one(user)
    set_session_cookie(response, user["id"])
    return public_user(user)


@router.post("/login", response_model=UserOut)
async def login(body: LoginRequest, response: Response):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    set_session_cookie(response, user["id"])
    return public_user(user)


@router.post("/logout")
async def logout(response: Response):
    clear_session_cookie(response)
    return {"ok": True}


@router.get("/me", response_model=UserOut)
async def me(user: dict = Depends(current_user)):
    return public_user(user)


@router.post("/onboarding", response_model=UserOut)
async def complete_onboarding(body: OnboardingRequest, user: dict = Depends(current_user)):
    updates = body.model_dump(exclude={"template"})
    updates["onboarded"] = True
    await db.users.update_one({"id": user["id"]}, {"$set": updates})
    existing = await db.cards.find_one({"user_id": user["id"]})
    if not existing:
        slug = await unique_slug(body.name)
        await db.cards.insert_one(
            {
                "id": str(uuid.uuid4()),
                "user_id": user["id"],
                "slug": slug,
                "label": "Primary",
                "template": body.template,
                "orientation": "portrait",
                "accent": "#22d3ee",
                "name": body.name,
                "title": body.title,
                "company": body.company,
                "bio": "",
                "phone": body.phone,
                "email": user["email"],
                "website": "",
                "location": "",
                "avatar_url": body.avatar_url,
                "logo_url": "",
                "services": [],
                "socials": [],
                "booking_url": "",
                "published": True,
                "views": 0,
                "created_at": datetime.now(timezone.utc),
            }
        )
    fresh = await db.users.find_one({"id": user["id"]})
    assert fresh is not None
    return public_user(fresh)


@router.patch("/profile", response_model=UserOut)
async def update_profile(body: ProfileUpdate, user: dict = Depends(current_user)):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if updates:
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
    fresh = await db.users.find_one({"id": user["id"]})
    assert fresh is not None
    return public_user(fresh)
