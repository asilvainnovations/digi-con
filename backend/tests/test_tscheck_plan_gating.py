"""Criterion: Plan gating enforced by the backend for free vs pro users."""
import httpx

def test_free_user_gets_402_on_analytics_and_export(client: httpx.Client, login_as):
    login_as("free")

    analytics_resp = client.get("/analytics")
    assert analytics_resp.status_code == 402, analytics_resp.text
    assert "upgrade" in analytics_resp.json()["detail"].lower()

    cards_resp = client.get("/cards")
    assert cards_resp.status_code == 200
    cards = cards_resp.json()
    assert len(cards) >= 1
    export_resp = client.get(f"/cards/{cards[0]['id']}/export")
    assert export_resp.status_code == 402, export_resp.text


def test_pro_user_gets_real_analytics_content(client: httpx.Client, login_as):
    login_as("pro")
    resp = client.get("/analytics")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert "summary" in body and "trend" in body and "badges" in body
    assert body["summary"]["plan"] == "pro"


def test_entitlements_matrix_reflects_plan(client: httpx.Client, login_as):
    login_as("free")
    resp = client.get("/entitlements")
    assert resp.status_code == 200
    gates = {g["feature"]: g["allowed"] for g in resp.json()}
    assert gates["analytics"] is False
    assert gates["wallet"] is False
    assert gates["landing_pwa"] is False
    assert gates["crm_pipeline"] is False
