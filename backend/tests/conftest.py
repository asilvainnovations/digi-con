"""Pre-scaffolded pytest fixtures for the FastAPI backend.

Tests hit the live uvicorn process managed by supervisor (not an in-process ASGI app), so
the app under test is the same one the frontend and Playwright see. Do NOT re-create this
file — add app-specific fixtures below the marker at the bottom.
"""

import os

import httpx
import pytest
import pytest_asyncio

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8001")
API_URL = f"{BACKEND_URL}/api"


def api_url(path: str = "") -> str:
    """Absolute URL for an /api route: api_url("/status") -> http://localhost:8001/api/status."""
    return f"{API_URL}{path}"


@pytest.fixture(scope="session")
def backend_url() -> str:
    return BACKEND_URL


@pytest.fixture
def client():
    """Sync httpx client rooted at /api — the default for endpoint tests.

    Example:
        def test_status(client):
            assert client.get("/status").status_code == 200
    """
    with httpx.Client(base_url=API_URL, timeout=30.0) as c:
        yield c


@pytest_asyncio.fixture
async def aclient():
    """Async variant, for tests that also await motor/backend helpers directly."""
    async with httpx.AsyncClient(base_url=API_URL, timeout=30.0) as c:
        yield c


# --- app-specific fixtures below this line ---

from pathlib import Path  # noqa: E402

from dotenv import load_dotenv  # noqa: E402

# Credentials live in tests/.env.test (or the real environment) — never inline in test modules.
load_dotenv(Path(__file__).parent / ".env.test", override=False)


class Credentials:
    """Seed-account credentials resolved from the environment."""

    def __init__(self) -> None:
        self.password = os.environ["DIGICON_TEST_PASSWORD"]
        self.pro_email = os.environ["DIGICON_TEST_PRO_EMAIL"]
        self.free_email = os.environ["DIGICON_TEST_FREE_EMAIL"]
        self.admin_email = os.environ["DIGICON_TEST_ADMIN_EMAIL"]
        self.pro_card_slug = os.environ["DIGICON_TEST_PRO_CARD_SLUG"]


@pytest.fixture(scope="session")
def credentials() -> Credentials:
    return Credentials()


@pytest.fixture
def login_as(client, credentials):
    """login_as("pro") / login_as("free") / login_as("admin") — authenticates `client`."""

    def _login(role: str):
        email = {
            "pro": credentials.pro_email,
            "free": credentials.free_email,
            "admin": credentials.admin_email,
        }[role]
        resp = client.post("/auth/login", json={"email": email, "password": credentials.password})
        assert resp.status_code == 200, resp.text
        return resp.json()

    return _login
