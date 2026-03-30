import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class InterviewCreate(BaseModel):
    application_id: uuid.UUID
    interview_type: str = Field(min_length=1, max_length=500)
    scheduled_at: datetime
    meeting_link: str | None = None
    interviewers: str = ""
    notes: str = ""


class InterviewUpdate(BaseModel):
    interview_type: str | None = Field(default=None, min_length=1, max_length=500)
    scheduled_at: datetime | None = None
    meeting_link: str | None = None
    interviewers: str | None = None
    notes: str | None = None


class InterviewRead(BaseModel):
    id: uuid.UUID
    application_id: uuid.UUID
    interview_type: str
    scheduled_at: datetime
    meeting_link: str | None
    interviewers: str
    notes: str
    created_at: datetime

    model_config = {"from_attributes": True}
