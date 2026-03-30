import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class ReminderChannel(str, Enum):
    in_app = "in_app"
    email = "email"


class ReminderCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    due_at: datetime
    channel: ReminderChannel
    application_id: uuid.UUID | None = None


class ReminderUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    due_at: datetime | None = None
    channel: ReminderChannel | None = None
    application_id: uuid.UUID | None = None


class ReminderRead(BaseModel):
    id: uuid.UUID
    title: str
    due_at: datetime
    channel: str
    application_id: uuid.UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}
