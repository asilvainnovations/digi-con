"""Idempotent demo seed for DigiCon. Run: cd /app/backend && python seed.py"""
import asyncio
import uuid
from datetime import datetime, timedelta, timezone

from lib.auth import hash_password
from lib.db import db

NOW = datetime.now(timezone.utc)


def days(n: int) -> datetime:
    return NOW - timedelta(days=n)


ACCOUNTS = [
    {
        "email": "maria@digicon.app",
        "password": "DigiCon2026!",
        "name": "Maria Santos",
        "title": "Founder & CEO",
        "company": "Neora Solutions",
        "phone": "+63 917 123 4567",
        "plan": "pro",
        "role": "user",
        "networking_goal": "Find partners and investors",
        "slug": "maria-santos",
    },
    {
        "email": "free@digicon.app",
        "password": "DigiCon2026!",
        "name": "Paolo Dela Cruz",
        "title": "Independent Consultant",
        "company": "Kalikha Studios",
        "phone": "+63 917 555 2211",
        "plan": "free",
        "role": "user",
        "networking_goal": "Win more clients",
        "slug": "paolo-dela-cruz",
    },
    {
        "email": "admin@digicon.app",
        "password": "DigiCon2026!",
        "name": "DigiCon Admin",
        "title": "Platform Operations",
        "company": "DigiCon",
        "phone": "",
        "plan": "pro",
        "role": "super_admin",
        "networking_goal": "Run the platform",
        "slug": "digicon-admin",
    },
]

CONTACTS = [
    {
        "name": "David Lim", "position": "CTO", "company": "NovaTech Solutions",
        "email": "david.lim@novatech.io", "phone": "+65 8123 4455",
        "event": "Global Tech Conference 2026", "met_at": "Global Tech Conference 2026, San Francisco",
        "status": "Follow Up", "category": "Prospect", "tags": ["tech", "integration"],
        "interest": "API integration", "opportunity_value": 24000.0, "health": 78,
        "notes": "Discussed AI-powered solutions for business growth. Wants a technical deep-dive with his team.",
        "days_ago": 40,
        "followup": {"title": "Send partnership proposal", "kind": "Proposal", "due_in": -2, "status": "Pending"},
        "interactions": [
            ("Met at event", "Introduced at the Global Tech Conference keynote lounge.", 40),
            ("Call", "30-min call on integration scope and timelines.", 12),
        ],
    },
    {
        "name": "Miguel Reyes", "position": "Founder", "company": "GreenGrid",
        "email": "miguel@greengrid.ph", "phone": "+63 917 884 1200",
        "event": "Sustainability Forum 2026", "met_at": "Sustainability Forum 2026, Manila",
        "status": "Partner", "category": "Partner", "tags": ["sustainability", "partnership"],
        "interest": "Co-marketing partnership", "opportunity_value": 60000.0, "health": 92,
        "notes": "Signed a co-marketing agreement. Wants to run a joint webinar next quarter.",
        "days_ago": 90,
        "followup": {"title": "Plan joint webinar agenda", "kind": "Meeting", "due_in": 6, "status": "In Progress"},
        "interactions": [
            ("Met at event", "Panel discussion on circular business models.", 90),
            ("Meeting", "Agreed on co-marketing terms.", 30),
        ],
    },
    {
        "name": "Aisha Rahman", "position": "HR Director", "company": "PeopleFirst",
        "email": "aisha.rahman@peoplefirst.co", "phone": "+971 50 220 8899",
        "event": "Leadership Summit 2026", "met_at": "Leadership Summit 2026, Dubai",
        "status": "Connected", "category": "Contact", "tags": ["hr", "collaboration"],
        "interest": "Team enablement collaboration", "opportunity_value": 0.0, "health": 65,
        "notes": "Open to collaborating on a leadership enablement series. Prefers email follow-ups.",
        "days_ago": 20,
        "followup": {"title": "Share portfolio and case studies", "kind": "Task", "due_in": 1, "status": "Pending"},
        "interactions": [("Met at event", "Roundtable on hybrid team culture.", 20)],
    },
    {
        "name": "Jessica Chen", "position": "Investor", "company": "NextWave",
        "email": "jessica@nextwave.vc", "phone": "+1 415 220 7788",
        "event": "Tech Leaders Roundtable", "met_at": "Tech Leaders Roundtable, Singapore",
        "status": "Opportunity", "category": "Investor", "tags": ["funding", "high-potential"],
        "interest": "Seed round participation", "opportunity_value": 250000.0, "health": 84,
        "notes": "Interested in the DigiCon SME plan traction. Asked for a metrics deck before committing.",
        "days_ago": 14,
        "followup": {"title": "Send updated metrics deck", "kind": "Task", "due_in": 3, "status": "Pending"},
        "interactions": [
            ("Met at event", "Discussed relationship-first product positioning.", 14),
            ("Email", "Sent one-pager, she asked for cohort retention numbers.", 5),
        ],
    },
    {
        "name": "Sofia Villanueva", "position": "Marketing Lead", "company": "Brightline Agency",
        "email": "sofia@brightline.agency", "phone": "+63 917 330 4411",
        "event": "Startup Expo 2026", "met_at": "Startup Expo 2026, Manila",
        "status": "New", "category": "Lead", "tags": ["agency", "inbound"],
        "interest": "Agency plan pricing", "opportunity_value": 12000.0, "health": 55,
        "notes": "Scanned the DigiCon card at the booth. Wants pricing for a 12-seat team.",
        "days_ago": 3,
        "followup": {"title": "Send agency plan quotation", "kind": "Quotation", "due_in": 2, "status": "Pending"},
        "interactions": [("Connected via card", "Scanned the DigiCon QR at the Startup Expo booth.", 3)],
    },
    {
        "name": "Kenji Watanabe", "position": "Head of BD", "company": "Orbit Logistics",
        "email": "kenji@orbitlogistics.jp", "phone": "+81 90 1122 3344",
        "event": "Global Tech Conference 2026", "met_at": "Global Tech Conference 2026, San Francisco",
        "status": "Dormant", "category": "Contact", "tags": ["logistics"],
        "interest": "Unclear — needs re-engagement", "opportunity_value": 0.0, "health": 32,
        "notes": "Went quiet after the initial intro. Worth one warm re-engagement note.",
        "days_ago": 120,
        "followup": None,
        "interactions": [("Met at event", "Brief hallway introduction.", 120)],
    },
]

POSTS = [
    {
        "title": "The business card is not the product. The relationship is.",
        "category": "Strategy",
        "excerpt": "Why exchanging details is the easy part — and what actually determines whether a connection turns into an opportunity.",
        "body": "Most digital business card tools stop at the moment of exchange. That is the easiest moment in the whole relationship.\n\nThe hard part is everything after: remembering the context of the conversation, knowing what you promised, and doing it before the moment goes cold.\n\nDigiCon is built around that gap. Your card is the entry point. Your relationship memory is the product.",
        "tags": ["positioning", "networking"],
        "published": True,
    },
    {
        "title": "A five-minute follow-up habit that compounds",
        "category": "Networking",
        "excerpt": "The professionals who grow the fastest are rarely the best at meeting people. They are the best at following up.",
        "body": "Block five minutes at the end of every event day. Capture three things per person: where you met, what they need, and the single next action.\n\nThat is it. No CRM configuration, no pipeline theatre. Over a year this habit is the difference between a contact list and a network.",
        "tags": ["follow-up", "habits"],
        "published": True,
    },
    {
        "title": "Reading relationship health before it goes quiet",
        "category": "Insights",
        "excerpt": "Dormant relationships rarely announce themselves. Here are the signals worth watching.",
        "body": "A relationship going quiet is usually visible 30 days before it feels quiet: fewer interactions, no open next action, and no shared purpose recorded.\n\nDigiCon surfaces those three signals so you can re-engage while the context is still warm.",
        "tags": ["analytics", "relationships"],
        "published": False,
    },
]


async def upsert_account(account: dict) -> str:
    existing = await db.users.find_one({"email": account["email"]})
    if existing:
        await db.users.update_one(
            {"id": existing["id"]},
            {"$set": {"plan": account["plan"], "role": account["role"],
                      "password": hash_password(account["password"])}},
        )
        return existing["id"]
    user_id = str(uuid.uuid4())
    await db.users.insert_one(
        {
            "id": user_id, "email": account["email"], "name": account["name"],
            "password": hash_password(account["password"]), "role": account["role"],
            "plan": account["plan"], "title": account["title"], "company": account["company"],
            "phone": account["phone"], "avatar_url": "", "networking_goal": account["networking_goal"],
            "onboarded": True, "created_at": days(150),
        }
    )
    return user_id


async def ensure_card(account: dict, user_id: str) -> None:
    if await db.cards.find_one({"user_id": user_id}):
        return
    await db.cards.insert_one(
        {
            "id": str(uuid.uuid4()), "user_id": user_id, "slug": account["slug"],
            "label": "Primary", "template": "founder", "orientation": "portrait",
            "accent": "#22d3ee", "name": account["name"], "title": account["title"],
            "company": account["company"],
            "bio": "Building solutions that create impact. Always open to meeting people who build things.",
            "phone": account["phone"], "email": account["email"],
            "website": "www.neora.com" if account["plan"] == "pro" else "www.kalikha.ph",
            "location": "Manila, Philippines", "avatar_url": "", "logo_url": "",
            "services": ["Product strategy", "Partnerships", "Advisory"],
            "socials": [{"label": "LinkedIn", "url": "https://linkedin.com"},
                        {"label": "Website", "url": "https://neora.com"}],
            "booking_url": "https://cal.com/digicon", "published": True, "views": 128,
            "created_at": days(140),
        }
    )


async def insert_contact(user_id: str, contact: dict) -> None:
    rel_id = str(uuid.uuid4())
    created = days(contact["days_ago"])
    await db.relationships.insert_one(
        {
            "id": rel_id, "user_id": user_id, "name": contact["name"], "company": contact["company"],
            "position": contact["position"], "email": contact["email"], "phone": contact["phone"],
            "website": "", "avatar_url": "", "met_at": contact["met_at"], "event": contact["event"],
            "date_met": created.date().isoformat(), "category": contact["category"],
            "tags": contact["tags"], "interest": contact["interest"], "status": contact["status"],
            "notes": contact["notes"], "opportunity_value": contact["opportunity_value"],
            "health": contact["health"], "source": "manual",
            "last_interaction": created, "created_at": created,
        }
    )
    last = created
    for kind, summary, ago in contact["interactions"]:
        when = days(ago)
        await db.interactions.insert_one(
            {"id": str(uuid.uuid4()), "relationship_id": rel_id, "user_id": user_id,
             "kind": kind, "summary": summary, "created_at": when}
        )
        last = max(last, when)
    await db.relationships.update_one({"id": rel_id}, {"$set": {"last_interaction": last}})

    followup = contact["followup"]
    if followup:
        await db.followups.insert_one(
            {"id": str(uuid.uuid4()), "user_id": user_id, "relationship_id": rel_id,
             "title": followup["title"], "kind": followup["kind"],
             "due_date": (NOW + timedelta(days=followup["due_in"])).date().isoformat(),
             "notes": "", "status": followup["status"], "created_at": created}
        )


async def insert_completed_followups(user_id: str) -> None:
    """Completed history so follow-up completion-rate analytics are meaningful."""
    first = await db.relationships.find_one({"user_id": user_id})
    if not first:
        return
    for title, ago in [("Send introduction email", 25), ("Follow up after event", 10)]:
        await db.followups.insert_one(
            {"id": str(uuid.uuid4()), "user_id": user_id, "relationship_id": first["id"],
             "title": title, "kind": "Task",
             "due_date": (NOW - timedelta(days=ago)).date().isoformat(),
             "notes": "", "status": "Completed", "created_at": days(ago + 5)}
        )


async def seed_user(account: dict, with_contacts: bool) -> None:
    user_id = await upsert_account(account)
    await ensure_card(account, user_id)
    if not with_contacts or await db.relationships.find_one({"user_id": user_id}):
        return
    for contact in CONTACTS:
        await insert_contact(user_id, contact)
    await insert_completed_followups(user_id)


async def main() -> None:
    for account in ACCOUNTS:
        await seed_user(account, with_contacts=account["plan"] == "pro" and account["role"] == "user")
    for post in POSTS:
        if await db.blog_posts.find_one({"title": post["title"]}):
            continue
        slug = post["title"].lower()
        slug = "".join(ch if ch.isalnum() else "-" for ch in slug).strip("-")[:60]
        await db.blog_posts.insert_one(
            {
                "id": str(uuid.uuid4()), "slug": slug, "title": post["title"],
                "excerpt": post["excerpt"], "body": post["body"], "category": post["category"],
                "tags": post["tags"], "cover_url": "", "seo_title": post["title"],
                "seo_description": post["excerpt"], "published": post["published"],
                "created_at": days(POSTS.index(post) * 7 + 2),
            }
        )
    print("Seed complete.")
    print("  Pro user   : maria@digicon.app / DigiCon2026!")
    print("  Free user  : free@digicon.app / DigiCon2026!")
    print("  Super admin: admin@digicon.app / DigiCon2026!")


if __name__ == "__main__":
    asyncio.run(main())
