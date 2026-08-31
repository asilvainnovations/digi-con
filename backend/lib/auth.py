import hashlib
import hmac
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import jwt
from fastapi import Depends, HTTPException, Request, Response

from lib.db import db

SECRET = os.environ.get("JWT_SECRET", "digicon-dev-secret")
COOKIE = "digicon_session"
ALGO = "HS256"

FREE_LIMITS = {"cards": 1}
PAID_FEATURES = {"analytics", "export", "wallet", "landing_pwa", "crm_pipeline", "multi_card"}


def hash_password(password: str) -> str:
    salt = uuid.uuid4().hex
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000).hex()
    return f"{salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    salt, _, digest = (stored or "").partition("$")
    if not salt or not digest:
        return False
    check = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000).hex()
    return hmac.compare_digest(check, digest)


def set_session_cookie(response: Response, user_id: str) -> None:
    token = jwt.encode(
        {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=30)}, SECRET, algorithm=ALGO
    )
    response.set_cookie(
        COOKIE, token, httponly=True, samesite="lax", secure=False, max_age=60 * 60 * 24 * 30, path="/"
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(COOKIE, path="/")


async def optional_user(request: Request) -> Optional[dict[str, Any]]:
    token = request.cookies.get(COOKIE)
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGO])
    except jwt.PyJWTError:
        return None
    user = await db.users.find_one({"id": payload.get("sub")})
    return user


async def current_user(user: Optional[dict[str, Any]] = Depends(optional_user)) -> dict[str, Any]:
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


async def current_admin(user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    if user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin access required")
    return user


def is_paid(user: dict[str, Any]) -> bool:
    return user.get("plan", "free") in ("pro", "business")


def require_feature(user: dict[str, Any], feature: str) -> None:
    """Server-side plan enforcement — never trust the client."""
    if feature in PAID_FEATURES and not is_paid(user):
        raise HTTPException(status_code=402, detail=f"Upgrade required to use: {feature}")


def public_user(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name", ""),
        "role": user.get("role", "user"),
        "plan": user.get("plan", "free"),
        "title": user.get("title", ""),
        "company": user.get("company", ""),
        "phone": user.get("phone", ""),
        "avatar_url": user.get("avatar_url", ""),
        "networking_goal": user.get("networking_goal", ""),
        "onboarded": bool(user.get("onboarded", False)),
    }
