from app.schemas.application import (
    ApplicationCreate,
    ApplicationRead,
    ApplicationUpdate,
)
from app.schemas.auth import RegisterBody, UserRead
from app.schemas.document import DocumentCreate, DocumentRead
from app.schemas.employer import EmployerCreate, EmployerRead, EmployerUpdate
from app.schemas.interview import InterviewCreate, InterviewRead, InterviewUpdate
from app.schemas.reminder import ReminderCreate, ReminderRead, ReminderUpdate
from app.schemas.stats import DashboardStats

__all__ = [
    "ApplicationCreate",
    "ApplicationRead",
    "ApplicationUpdate",
    "RegisterBody",
    "UserRead",
    "DocumentCreate",
    "DocumentRead",
    "EmployerCreate",
    "EmployerRead",
    "EmployerUpdate",
    "InterviewCreate",
    "InterviewRead",
    "InterviewUpdate",
    "ReminderCreate",
    "ReminderRead",
    "ReminderUpdate",
    "DashboardStats",
]
