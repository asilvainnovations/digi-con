"""Criterion: Card builder — free user capped at 1 card (402), pro user can create a 2nd."""
import uuid

import httpx

def _card_payload(suffix: str) -> dict:
    return {
        "label": f"tscheck-card-{suffix}",
        "name": f"TS Check {suffix}",
        "title": "Tester",
        "company": "TS Co",
    }


def test_free_user_second_card_returns_402(client: httpx.Client, login_as):
    login_as("free")
    existing = client.get("/cards")
    assert existing.status_code == 200
    assert len(existing.json()) >= 1, "free seed user should already own 1 card"

    resp = client.post("/cards", json=_card_payload(uuid.uuid4().hex[:8]))
    assert resp.status_code == 402, resp.text
    assert "upgrade" in resp.json()["detail"].lower()


def test_pro_user_can_create_second_card_and_it_publishes_publicly(
    client: httpx.Client, login_as
):
    login_as("pro")
    suffix = uuid.uuid4().hex[:8]
    resp = client.post("/cards", json=_card_payload(suffix))
    assert resp.status_code == 200, resp.text
    card = resp.json()
    assert card["slug"]

    # public page renders with no auth (fresh client, no cookies)
    with httpx.Client(base_url=client.base_url, timeout=30.0) as anon:
        public_resp = anon.get(f"/public/cards/{card['slug']}")
        assert public_resp.status_code == 200, public_resp.text
        assert public_resp.json()["name"] == f"TS Check {suffix}"

    # cleanup: remove the card this test created (fixture discipline, not seeded data)
    client.delete(f"/cards/{card['id']}")
