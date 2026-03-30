import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class EmployerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    website_url: str | None = None
    notes: str | None = None


class EmployerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    website_url: str | None = None
    notes: str | None = None


class EmployerRead(BaseModel):
    id: uuid.UUID
    name: str
    website_url: str | None
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
