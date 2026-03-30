import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class DocumentKind(str, Enum):
    resume = "resume"
    cover_letter = "cover_letter"
    reference_letter = "reference_letter"
    other = "other"


class DocumentCreate(BaseModel):
    application_id: uuid.UUID | None = None
    kind: DocumentKind
    label: str = Field(min_length=1, max_length=500)


class DocumentRead(BaseModel):
    id: uuid.UUID
    application_id: uuid.UUID | None
    kind: str
    label: str
    file_name: str
    uploaded_at: datetime

    model_config = {"from_attributes": True}
