"""Criterion: Auth + onboarding — signup sets session, onboarding creates first card."""
import uuid

import httpx


def test_signup_sets_session_and_onboarding_creates_card(client: httpx.Client):
    email = f"tscheck-auth-{uuid.uuid4().hex[:8]}@test.com"
    signup_resp = client.post(
        "/auth/signup",
        json={"name": "TS Check Auth", "email": email, "password": "TestPass123!"},
    )
    assert signup_resp.status_code == 200, signup_resp.text
    body = signup_resp.json()
    assert body["email"] == email
    assert body["onboarded"] is False
    assert "digicon_session" in signup_resp.cookies

    # /me works with the session cookie set by signup
    me_resp = client.get("/auth/me")
    assert me_resp.status_code == 200, me_resp.text
    assert me_resp.json()["email"] == email

    # before onboarding, no cards exist for this user
    cards_before = client.get("/cards")
    assert cards_before.status_code == 200
    assert cards_before.json() == []

    onboard_resp = client.post(
        "/auth/onboarding",
        json={
            "name": "TS Check Auth",
            "title": "Founder",
            "company": "TS Co",
            "phone": "",
            "avatar_url": "",
            "networking_goal": "grow-network",
            "template": "founder",
        },
    )
    assert onboard_resp.status_code == 200, onboard_resp.text
    assert onboard_resp.json()["onboarded"] is True

    cards_after = client.get("/cards")
    assert cards_after.status_code == 200
    cards = cards_after.json()
    assert len(cards) == 1, f"expected exactly 1 card after onboarding, got {cards}"
    assert cards[0]["name"] == "TS Check Auth"
    assert cards[0]["published"] is True


def test_signup_duplicate_email_rejected(client: httpx.Client):
    email = f"tscheck-auth-dup-{uuid.uuid4().hex[:8]}@test.com"
    first = client.post(
        "/auth/signup", json={"name": "Dup One", "email": email, "password": "TestPass123!"}
    )
    assert first.status_code == 200
    dup = client.post(
        "/auth/signup", json={"name": "Dup Two", "email": email, "password": "TestPass123!"}
    )
    assert dup.status_code == 409
