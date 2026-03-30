import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field

APPLICATION_STATUS_VALUES = frozenset(
    {
        "Saved",
        "Applied",
        "OA",
        "Interview",
        "Final Round",
        "Offer",
        "Rejected",
        "Ghosted",
    }
)


class ApplicationCreate(BaseModel):
    employer_id: uuid.UUID
    role: str = Field(min_length=1, max_length=500)
    salary: str | None = Field(default=None, max_length=255)
    work_mode: str | None = Field(default=None, max_length=32)
    source_url: str | None = Field(default=None, max_length=2000)
    status: str = "Saved"
    applied_at: date | None = None
    deadline: date | None = None
    next_action_at: datetime | None = None
    notes: str = ""
    interview_feedback: str | None = None
    recruiter_interactions: str | None = None
    improvement_points: str | None = None


class ApplicationUpdate(BaseModel):
    employer_id: uuid.UUID | None = None
    role: str | None = Field(default=None, min_length=1, max_length=500)
    salary: str | None = Field(default=None, max_length=255)
    work_mode: str | None = Field(default=None, max_length=32)
    source_url: str | None = Field(default=None, max_length=2000)
    status: str | None = None
    applied_at: date | None = None
    deadline: date | None = None
    next_action_at: datetime | None = None
    notes: str | None = None
    resume_document_id: uuid.UUID | None = None
    interview_feedback: str | None = None
    recruiter_interactions: str | None = None
    improvement_points: str | None = None


class ApplicationRead(BaseModel):
    id: uuid.UUID
    employer_id: uuid.UUID
    role: str
    salary: str | None
    work_mode: str | None
    source_url: str | None
    status: str
    applied_at: date | None
    deadline: date | None
    next_action_at: datetime | None
    notes: str
    resume_document_id: uuid.UUID | None
    document_ids: list[uuid.UUID]
    interview_feedback: str | None
    recruiter_interactions: str | None
    improvement_points: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
