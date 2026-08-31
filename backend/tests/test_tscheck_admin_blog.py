"""Criterion: Super admin area is protected; blog CMS create+publish works for admin."""
import uuid

import httpx

def test_non_admin_gets_403_on_admin_stats(client: httpx.Client, login_as):
    login_as("free")
    resp = client.get("/admin/stats")
    assert resp.status_code == 403, resp.text


def test_admin_can_view_stats_toggle_plan_and_publish_post(
    client: httpx.Client, login_as, credentials
):
    login_as("admin")

    stats_resp = client.get("/admin/stats")
    assert stats_resp.status_code == 200, stats_resp.text
    assert stats_resp.json()["users"] >= 3

    users_resp = client.get("/admin/users")
    assert users_resp.status_code == 200
    free_user = next(u for u in users_resp.json() if u["email"] == credentials.free_email)
    original_plan = free_user["plan"]

    toggled_plan = "pro" if original_plan == "free" else "free"
    toggle_resp = client.patch(f"/admin/users/{free_user['id']}/plan", json={"plan": toggled_plan})
    assert toggle_resp.status_code == 200, toggle_resp.text
    assert toggle_resp.json()["plan"] == toggled_plan
    # restore to not disturb the seeded fixture's plan for other checks
    restore_resp = client.patch(f"/admin/users/{free_user['id']}/plan", json={"plan": original_plan})
    assert restore_resp.status_code == 200
    assert restore_resp.json()["plan"] == original_plan

    title = f"tscheck post {uuid.uuid4().hex[:8]}"
    create_resp = client.post(
        "/admin/posts",
        json={"title": title, "excerpt": "e2e test post", "body": "body", "published": True},
    )
    assert create_resp.status_code == 200, create_resp.text
    post = create_resp.json()
    assert post["published"] is True

    with httpx.Client(base_url=client.base_url, timeout=30.0) as anon:
        list_resp = anon.get("/posts")
        assert list_resp.status_code == 200
        slugs = [p["slug"] for p in list_resp.json()]
        assert post["slug"] in slugs

        detail_resp = anon.get(f"/posts/{post['slug']}")
        assert detail_resp.status_code == 200
        assert detail_resp.json()["title"] == title

    # cleanup
    client.delete(f"/admin/posts/{post['id']}")
