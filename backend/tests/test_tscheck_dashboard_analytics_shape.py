"""Criterion: Backend refactors behave identically — /api/dashboard and /api/analytics keep
their documented shape for the pro seed user, and free users still get 402 on analytics.
Credentials resolved from tests/.env.test via the `credentials`/`login_as` fixtures (conftest.py).
"""
import httpx


def test_pro_dashboard_full_shape(client: httpx.Client, login_as):
    login_as("pro")
    resp = client.get("/dashboard")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    # /api/dashboard returns the flat summary dict (same shape as analytics.summary)
    assert body["plan"] == "pro"
    for key in ("connections", "active_relationships", "followups_due", "opportunity_value", "card_views"):
        assert key in body, body


def test_pro_analytics_full_shape_with_insights(client: httpx.Client, login_as):
    login_as("pro")
    resp = client.get("/analytics")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert "summary" in body and "trend" in body and "badges" in body
    assert len(body["trend"]) == 6, body["trend"]
    assert len(body["badges"]) == 6, body["badges"]
    assert body["summary"]["plan"] == "pro"
    assert "completion_rate" in body
    assert "conversion_rate" in body
    assert "insights" in body and len(body["insights"]) > 0, body.get("insights")


def test_free_user_gets_402_on_analytics(client: httpx.Client, login_as):
    login_as("free")
    resp = client.get("/analytics")
    assert resp.status_code == 402, resp.text
