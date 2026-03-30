import uuid

from sqlalchemy.orm import Session

from app.core.constants import APPLICATION_STATUS_VALUES
from app.models import Application
from app.schemas.stats import DashboardStats


POST_APPLIED = frozenset(
    {
        "Applied",
        "OA",
        "Interview",
        "Final Round",
        "Offer",
        "Rejected",
        "Ghosted",
    }
)
INTERVIEW_OR_LATER = frozenset(
    {
        "Interview",
        "Final Round",
        "Offer",
        "Rejected",
        "Ghosted",
    }
)


def dashboard_stats(db: Session, user_id: uuid.UUID) -> DashboardStats:
    rows = (
        db.query(Application).filter(Application.user_id == user_id).all()
    )
    total = len(rows)
    by_status: dict[str, int] = {s: 0 for s in APPLICATION_STATUS_VALUES}
    for r in rows:
        if r.status in by_status:
            by_status[r.status] += 1
    post_applied = sum(1 for r in rows if r.status in POST_APPLIED)
    reached = sum(1 for r in rows if r.status in INTERVIEW_OR_LATER)
    rate = (reached / post_applied) if post_applied else None
    return DashboardStats(
        total=total,
        by_status=by_status,
        interview_conversion_rate=rate,
    )
