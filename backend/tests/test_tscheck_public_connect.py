"""Criterion: Public card contact exchange — no account required, creates a relationship
for the card owner that then appears in their /contacts (relationships) list."""
import uuid

import httpx

def test_public_connect_creates_relationship_for_owner(
    client: httpx.Client, login_as, credentials
):
    visitor_name = f"TS Check Visitor {uuid.uuid4().hex[:8]}"

    # anonymous visitor hits the public card and submits the connect form — no auth header/cookie
    with httpx.Client(base_url=client.base_url, timeout=30.0) as anon:
        public_resp = anon.get(f"/public/cards/{credentials.pro_card_slug}")
        assert public_resp.status_code == 200, public_resp.text

        connect_resp = anon.post(
            f"/public/cards/{credentials.pro_card_slug}/connect",
            json={
                "name": visitor_name,
                "email": "visitor@example.com",
                "company": "Visitor Co",
                "position": "Tester",
                "met_at": "TS Check Event",
                "message": "Great meeting you!",
            },
        )
        assert connect_resp.status_code == 200, connect_resp.text
        assert connect_resp.json()["ok"] is True

    # now log in as the card owner and confirm the new relationship shows up with status New
    login_as("pro")

    rels_resp = client.get("/relationships", params={"q": visitor_name})
    assert rels_resp.status_code == 200, rels_resp.text
    rels = rels_resp.json()
    assert len(rels) == 1, f"expected the new visitor relationship, got {rels}"
    assert rels[0]["name"] == visitor_name
    assert rels[0]["status"] == "New"
    assert rels[0]["source"] == "public_card"

    # cleanup: remove the relationship this test created
    client.delete(f"/relationships/{rels[0]['id']}")


def test_public_card_never_exposes_private_fields(client: httpx.Client, credentials):
    with httpx.Client(base_url=client.base_url, timeout=30.0) as anon:
        resp = anon.get(f"/public/cards/{credentials.pro_card_slug}")
        assert resp.status_code == 200
        body = resp.json()
        for private_field in ("notes", "opportunity_value", "health", "followups"):
            assert private_field not in body, f"public card leaked private field: {private_field}"
