from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from lib.auth import current_user, require_feature
from lib.dates import today_iso
from lib.db import db

router = APIRouter(tags=["insights"])

ACTIVE = {"Active", "Partner", "Customer", "In Progress", "Opportunity"}


class DashboardSummary(BaseModel):
    connections: int
    new_connections_30d: int
    active_relationships: int
    dormant_relationships: int
    followups_due: int
    followups_overdue: int
    followups_completed: int
    opportunities: int
    opportunity_value: float
    card_views: int
    relationship_health: int
    plan: str


class TrendPoint(BaseModel):
    label: str
    connections: int
    followups: int


class StatusSlice(BaseModel):
    status: str
    count: int


class EventSlice(BaseModel):
    event: str
    count: int


class Badge(BaseModel):
    name: str
    description: str
    earned: bool


class Analytics(BaseModel):
    summary: DashboardSummary
    trend: list[TrendPoint]
    by_status: list[StatusSlice]
    by_event: list[EventSlice]
    badges: list[Badge]
    completion_rate: int
    conversion_rate: int
    insights: list[str]


async def build_summary(user: dict) -> DashboardSummary:
    uid = user["id"]
    rels = await db.relationships.find({"user_id": uid}).to_list(1000)
    fus = await db.followups.find({"user_id": uid}).to_list(1000)
    cards = await db.cards.find({"user_id": uid}).to_list(100)
    today = today_iso()
    cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    dormant_cut = datetime.now(timezone.utc) - timedelta(days=45)

    def created(r):
        c = r.get("created_at")
        return c.replace(tzinfo=timezone.utc) if c and c.tzinfo is None else c

    def last(r):
        c = r.get("last_interaction") or r.get("created_at")
        return c.replace(tzinfo=timezone.utc) if c and c.tzinfo is None else c

    opportunities = [r for r in rels if r.get("status") in ("Opportunity", "Partner", "Customer")]
    open_fus = [f for f in fus if f.get("status") != "Completed"]
    health_vals = [r.get("health", 70) for r in rels] or [0]
    return DashboardSummary(
        connections=len(rels),
        new_connections_30d=len([r for r in rels if created(r) and created(r) >= cutoff]),
        active_relationships=len([r for r in rels if r.get("status") in ACTIVE]),
        dormant_relationships=len(
            [r for r in rels if last(r) and last(r) < dormant_cut or r.get("status") == "Dormant"]
        ),
        followups_due=len(open_fus),
        followups_overdue=len([f for f in open_fus if f["due_date"] < today]),
        followups_completed=len([f for f in fus if f.get("status") == "Completed"]),
        opportunities=len(opportunities),
        opportunity_value=float(sum(r.get("opportunity_value", 0) or 0 for r in opportunities)),
        card_views=sum(c.get("views", 0) for c in cards),
        relationship_health=int(sum(health_vals) / len(health_vals)),
        plan=user.get("plan", "free"),
    )


@router.get("/dashboard", response_model=DashboardSummary)
async def dashboard(user: dict = Depends(current_user)):
    return await build_summary(user)


@router.get("/analytics", response_model=Analytics)
async def analytics(user: dict = Depends(current_user)):
    require_feature(user, "analytics")
    uid = user["id"]
    summary = await build_summary(user)
    rels = await db.relationships.find({"user_id": uid}).to_list(1000)
    fus = await db.followups.find({"user_id": uid}).to_list(1000)

    trend: list[TrendPoint] = []
    now = datetime.now(timezone.utc)
    for i in range(5, -1, -1):
        start = (now - timedelta(days=30 * (i + 1))).replace(tzinfo=timezone.utc)
        end = (now - timedelta(days=30 * i)).replace(tzinfo=timezone.utc)

        def within(value):
            if not value:
                return False
            v = value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value
            return start <= v < end

        trend.append(
            TrendPoint(
                label=end.strftime("%b"),
                connections=len([r for r in rels if within(r.get("created_at"))]),
                followups=len([f for f in fus if within(f.get("created_at"))]),
            )
        )

    status_counts: dict[str, int] = {}
    for r in rels:
        status_counts[r.get("status", "New")] = status_counts.get(r.get("status", "New"), 0) + 1
    event_counts: dict[str, int] = {}
    for r in rels:
        key = r.get("event") or r.get("met_at") or "Direct"
        event_counts[key] = event_counts.get(key, 0) + 1

    completed = summary.followups_completed
    total_fu = len(fus) or 1
    completion_rate = int(completed / total_fu * 100)
    conversion_rate = int(summary.opportunities / (summary.connections or 1) * 100)

    badges = [
        Badge(name="Growing Network", description="10+ connections captured",
              earned=summary.connections >= 10),
        Badge(name="Follow-up Champion", description="70%+ follow-up completion",
              earned=completion_rate >= 70),
        Badge(name="Highly Connected", description="25+ connections", earned=summary.connections >= 25),
        Badge(name="Relationship Builder", description="5+ active relationships",
              earned=summary.active_relationships >= 5),
        Badge(name="Opportunity Creator", description="3+ opportunities created",
              earned=summary.opportunities >= 3),
        Badge(name="Consistent Networker", description="New connections in the last 30 days",
              earned=summary.new_connections_30d >= 3),
    ]

    insights: list[str] = []
    if summary.followups_overdue:
        insights.append(f"{summary.followups_overdue} follow-up(s) are overdue — clear these first.")
    if summary.dormant_relationships:
        insights.append(
            f"{summary.dormant_relationships} relationship(s) have gone quiet for 45+ days."
        )
    top_event = max(event_counts.items(), key=lambda kv: kv[1], default=None)
    if top_event:
        insights.append(f"{top_event[0]} is your strongest connection source ({top_event[1]} people).")
    if summary.opportunities:
        insights.append(
            f"{summary.opportunities} connection(s) look like real opportunities "
            f"(~${summary.opportunity_value:,.0f})."
        )
    if not insights:
        insights.append("Capture your first connections to unlock networking insights.")

    return Analytics(
        summary=summary,
        trend=trend,
        by_status=[StatusSlice(status=k, count=v) for k, v in sorted(status_counts.items())],
        by_event=[EventSlice(event=k, count=v) for k, v in sorted(event_counts.items(), key=lambda kv: -kv[1])[:6]],
        badges=badges,
        completion_rate=completion_rate,
        conversion_rate=conversion_rate,
        insights=insights,
    )
