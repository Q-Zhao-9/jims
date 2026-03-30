from pydantic import BaseModel


class DashboardStats(BaseModel):
    total: int
    by_status: dict[str, int]
    interview_conversion_rate: float | None
