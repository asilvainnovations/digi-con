from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from lib import insights_rules as rules
from lib.auth import current_user, require_feature
from lib.dates import today_iso
from lib.db import db

router = APIRouter(tags=["insights"])


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


async def load_workspace(user_id: str) -> tuple[list[dict], list[dict], list[dict]]:
    rels = await db.relationships.find({"user_id": user_id}).to_list(1000)
    followups = await db.followups.find({"user_id": user_id}).to_list(1000)
    cards = await db.cards.find({"user_id": user_id}).to_list(100)
    return rels, followups, cards


def summarise(
    user: dict, rels: list[dict], followups: list[dict], cards: list[dict]
) -> DashboardSummary:
    now = datetime.now(timezone.utc)
    today = today_iso()
    open_followups = [f for f in followups if rules.is_open(f)]
    return DashboardSummary(
        connections=len(rels),
        new_connections_30d=sum(1 for r in rels if rules.is_new(r, now)),
        active_relationships=sum(1 for r in rels if rules.is_active(r)),
        dormant_relationships=sum(1 for r in rels if rules.is_dormant(r, now)),
        followups_due=len(open_followups),
        followups_overdue=sum(1 for f in open_followups if rules.is_overdue(f, today)),
        followups_completed=sum(1 for f in followups if f.get("status") == "Completed"),
        opportunities=sum(1 for r in rels if rules.is_opportunity(r)),
        opportunity_value=rules.total_opportunity_value(rels),
        card_views=sum(c.get("views", 0) for c in cards),
        relationship_health=rules.average_health(rels),
        plan=user.get("plan", "free"),
    )


def build_trend(rels: list[dict], followups: list[dict]) -> list[TrendPoint]:
    now = datetime.now(timezone.utc)
    return [
        TrendPoint(
            label=label,
            connections=sum(1 for r in rels if rules.in_window(r.get("created_at"), start, end)),
            followups=sum(1 for f in followups if rules.in_window(f.get("created_at"), start, end)),
        )
        for label, start, end in rules.monthly_windows(now)
    ]


def build_badges(summary: DashboardSummary, completion_rate: int) -> list[Badge]:
    definitions = [
        ("Growing Network", "10+ connections captured", summary.connections >= 10),
        ("Follow-up Champion", "70%+ follow-up completion", completion_rate >= 70),
        ("Highly Connected", "25+ connections", summary.connections >= 25),
        ("Relationship Builder", "5+ active relationships", summary.active_relationships >= 5),
        ("Opportunity Creator", "3+ opportunities created", summary.opportunities >= 3),
        ("Consistent Networker", "New connections in the last 30 days", summary.new_connections_30d >= 3),
    ]
    return [Badge(name=n, description=d, earned=e) for n, d, e in definitions]


def build_insights(summary: DashboardSummary, sources: dict[str, int]) -> list[str]:
    insights: list[str] = []
    if summary.followups_overdue:
        insights.append(f"{summary.followups_overdue} follow-up(s) are overdue — clear these first.")
    if summary.dormant_relationships:
        insights.append(
            f"{summary.dormant_relationships} relationship(s) have gone quiet for 45+ days."
        )
    top_source = max(sources.items(), key=lambda kv: kv[1], default=None)
    if top_source:
        insights.append(
            f"{top_source[0]} is your strongest connection source ({top_source[1]} people)."
        )
    if summary.opportunities:
        insights.append(
            f"{summary.opportunities} connection(s) look like real opportunities "
            f"(~${summary.opportunity_value:,.0f})."
        )
    return insights or ["Capture your first connections to unlock networking insights."]


@router.get("/dashboard", response_model=DashboardSummary)
async def dashboard(user: dict = Depends(current_user)):
    rels, followups, cards = await load_workspace(user["id"])
    return summarise(user, rels, followups, cards)


@router.get("/analytics", response_model=Analytics)
async def analytics(user: dict = Depends(current_user)):
    require_feature(user, "analytics")
    rels, followups, cards = await load_workspace(user["id"])
    summary = summarise(user, rels, followups, cards)

    completion_rate = rules.percent(summary.followups_completed, len(followups))
    conversion_rate = rules.percent(summary.opportunities, summary.connections)
    status_counts = rules.count_by(rels, "status", "New")
    sources = rules.connection_sources(rels)

    return Analytics(
        summary=summary,
        trend=build_trend(rels, followups),
        by_status=[StatusSlice(status=k, count=v) for k, v in sorted(status_counts.items())],
        by_event=[
            EventSlice(event=k, count=v)
            for k, v in sorted(sources.items(), key=lambda kv: -kv[1])[:6]
        ],
        badges=build_badges(summary, completion_rate),
        completion_rate=completion_rate,
        conversion_rate=conversion_rate,
        insights=build_insights(summary, sources),
    )
