import os
from datetime import datetime, timezone
from typing import Optional

from emergentintegrations.payments.stripe.checkout import (
    CheckoutSessionRequest,
    StripeCheckout,
)
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from lib.auth import current_user, optional_user
from lib.db import db

router = APIRouter(prefix="/payments", tags=["payments"])

# Server-side price book — the client only ever sends a plan id.
PLANS: dict[str, dict] = {
    "pro_monthly": {"amount": 19.0, "label": "DigiCon Pro — Monthly", "period": "month", "plan": "pro"},
    "pro_yearly": {"amount": 182.0, "label": "DigiCon Pro — Yearly", "period": "year", "plan": "pro"},
}


class CheckoutRequest(BaseModel):
    plan_id: str = Field(max_length=40)
    origin_url: str = Field(max_length=300)


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


class PaymentStatus(BaseModel):
    session_id: str
    status: str
    payment_status: str


def checkout_client(request: Request) -> StripeCheckout:
    host_url = str(request.base_url)
    return StripeCheckout(
        api_key=os.environ.get("STRIPE_API_KEY", "sk_test_emergent"),
        webhook_url=f"{host_url}api/webhook/stripe",
    )


@router.get("/plans")
async def plans():
    return [
        {"id": pid, "label": p["label"], "amount": p["amount"], "period": p["period"]}
        for pid, p in PLANS.items()
    ]


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(body: CheckoutRequest, request: Request, user: dict = Depends(current_user)):
    plan = PLANS.get(body.plan_id)
    if not plan:
        raise HTTPException(status_code=400, detail="Unknown plan")
    origin = body.origin_url.rstrip("/")
    session = await checkout_client(request).create_checkout_session(
        CheckoutSessionRequest(
            amount=plan["amount"],
            currency="usd",
            success_url=f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{origin}/payment/cancel",
            metadata={"user_id": user["id"], "plan_id": body.plan_id},
        )
    )
    await db.payment_transactions.insert_one(
        {
            "session_id": session.session_id,
            "user_id": user["id"],
            "plan_id": body.plan_id,
            "amount": plan["amount"],
            "currency": "usd",
            "status": "initiated",
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
    )
    return CheckoutResponse(checkout_url=session.url, session_id=session.session_id)


async def _grant(record: dict) -> None:
    """Idempotent: flip the transaction to paid and upgrade the user's plan."""
    result = await db.payment_transactions.update_one(
        {"session_id": record["session_id"], "payment_status": {"$ne": "paid"}},
        {"$set": {"status": "completed", "payment_status": "paid",
                  "updated_at": datetime.now(timezone.utc)}},
    )
    if result.modified_count and record.get("user_id"):
        plan = PLANS.get(record.get("plan_id", ""), {}).get("plan", "pro")
        await db.users.update_one({"id": record["user_id"]}, {"$set": {"plan": plan}})


@router.get("/status/{session_id}", response_model=PaymentStatus)
async def payment_status(session_id: str, request: Request, _: Optional[dict] = Depends(optional_user)):
    record = await db.payment_transactions.find_one({"session_id": session_id})
    if not record:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if record.get("payment_status") != "paid":
        try:
            status = await checkout_client(request).get_checkout_status(session_id)
            if status.payment_status == "paid" or status.status == "complete":
                await _grant(record)
                record = await db.payment_transactions.find_one({"session_id": session_id}) or record
        except Exception:  # transient Stripe error — report DB state
            pass
    return PaymentStatus(
        session_id=record["session_id"], status=record["status"], payment_status=record["payment_status"]
    )


webhook_router = APIRouter(tags=["payments"])


@webhook_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    try:
        event = await checkout_client(request).handle_webhook(
            body, request.headers.get("Stripe-Signature", "")
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
    if event.payment_status == "paid" and event.session_id:
        record = await db.payment_transactions.find_one({"session_id": event.session_id})
        if record:
            await _grant(record)
    return {"status": "ok"}
