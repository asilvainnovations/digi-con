"""Pure helpers behind the dashboard/analytics endpoints.

Kept free of FastAPI and Mongo so each rule is small and independently testable.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Optional

ACTIVE_STATUSES = {"Active", "Partner", "Customer", "In Progress", "Opportunity"}
OPPORTUNITY_STATUSES = {"Opportunity", "Partner", "Customer"}
DORMANT_AFTER_DAYS = 45
NEW_WINDOW_DAYS = 30

Doc = dict[str, Any]


def as_utc(value: Any) -> Optional[datetime]:
    """Normalise a Mongo datetime to an aware UTC datetime."""
    if not isinstance(value, datetime):
        return None
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value


def created_at(doc: Doc) -> Optional[datetime]:
    return as_utc(doc.get("created_at"))


def last_touch(doc: Doc) -> Optional[datetime]:
    return as_utc(doc.get("last_interaction")) or created_at(doc)


def is_new(rel: Doc, now: datetime) -> bool:
    created = created_at(rel)
    return created is not None and created >= now - timedelta(days=NEW_WINDOW_DAYS)


def is_active(rel: Doc) -> bool:
    return rel.get("status") in ACTIVE_STATUSES


def is_dormant(rel: Doc, now: datetime) -> bool:
    if rel.get("status") == "Dormant":
        return True
    touched = last_touch(rel)
    return touched is not None and touched < now - timedelta(days=DORMANT_AFTER_DAYS)


def is_opportunity(rel: Doc) -> bool:
    return rel.get("status") in OPPORTUNITY_STATUSES


def is_open(followup: Doc) -> bool:
    return followup.get("status") != "Completed"


def is_overdue(followup: Doc, today: str) -> bool:
    return is_open(followup) and followup.get("due_date", "") < today


def average_health(rels: list[Doc]) -> int:
    values = [int(r.get("health", 70) or 0) for r in rels]
    return int(sum(values) / len(values)) if values else 0


def total_opportunity_value(rels: list[Doc]) -> float:
    return float(sum(r.get("opportunity_value", 0) or 0 for r in rels if is_opportunity(r)))


def in_window(value: Any, start: datetime, end: datetime) -> bool:
    moment = as_utc(value)
    return moment is not None and start <= moment < end


def monthly_windows(now: datetime, months: int = 6) -> list[tuple[str, datetime, datetime]]:
    """Oldest-first (label, start, end) buckets of ~30 days each."""
    windows = []
    for offset in range(months - 1, -1, -1):
        start = now - timedelta(days=30 * (offset + 1))
        end = now - timedelta(days=30 * offset)
        windows.append((end.strftime("%b"), start, end))
    return windows


def count_by(docs: list[Doc], key: str, default: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for doc in docs:
        value = doc.get(key) or default
        counts[value] = counts.get(value, 0) + 1
    return counts


def connection_sources(rels: list[Doc]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for rel in rels:
        source = rel.get("event") or rel.get("met_at") or "Direct"
        counts[source] = counts.get(source, 0) + 1
    return counts


def percent(part: int, whole: int) -> int:
    return int(part / whole * 100) if whole else 0
