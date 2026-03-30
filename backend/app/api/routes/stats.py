import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_user_id
from app.db.session import get_db
from app.schemas.stats import DashboardStats
from app.services.stats import dashboard_stats

router = APIRouter()


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> DashboardStats:
    return dashboard_stats(db, user_id)
