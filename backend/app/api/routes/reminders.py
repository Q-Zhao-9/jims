import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import require_user_id
from app.core.constants import REMINDER_CHANNEL_VALUES
from app.db.session import get_db
from app.models import Application, Reminder
from app.schemas.reminder import ReminderCreate, ReminderRead, ReminderUpdate

router = APIRouter()


@router.get("", response_model=list[ReminderRead])
def list_reminders(
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> list[Reminder]:
    return (
        db.query(Reminder)
        .filter(Reminder.user_id == user_id)
        .order_by(Reminder.due_at.asc())
        .all()
    )


@router.post("", response_model=ReminderRead, status_code=201)
def create_reminder(
    body: ReminderCreate,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> Reminder:
    ch = body.channel.value
    if ch not in REMINDER_CHANNEL_VALUES:
        raise HTTPException(status_code=422, detail="Invalid channel")
    if body.application_id:
        app = (
            db.query(Application)
            .filter(Application.id == body.application_id, Application.user_id == user_id)
            .first()
        )
        if not app:
            raise HTTPException(status_code=422, detail="Application not found")
    row = Reminder(
        user_id=user_id,
        application_id=body.application_id,
        title=body.title.strip(),
        due_at=body.due_at,
        channel=ch,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/{reminder_id}", response_model=ReminderRead)
def get_reminder(
    reminder_id: uuid.UUID,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> Reminder:
    row = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == user_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return row


@router.patch("/{reminder_id}", response_model=ReminderRead)
def update_reminder(
    reminder_id: uuid.UUID,
    body: ReminderUpdate,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> Reminder:
    row = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == user_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Reminder not found")
    data = body.model_dump(exclude_unset=True)
    if "title" in data and data["title"] is not None:
        data["title"] = data["title"].strip()
    if "channel" in data and data["channel"] is not None:
        ch = (
            data["channel"].value
            if hasattr(data["channel"], "value")
            else str(data["channel"])
        )
        if ch not in REMINDER_CHANNEL_VALUES:
            raise HTTPException(status_code=422, detail="Invalid channel")
        data["channel"] = ch
    if data.get("application_id"):
        app = (
            db.query(Application)
            .filter(
                Application.id == data["application_id"],
                Application.user_id == user_id,
            )
            .first()
        )
        if not app:
            raise HTTPException(status_code=422, detail="Application not found")
    for k, v in data.items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{reminder_id}", status_code=204)
def delete_reminder(
    reminder_id: uuid.UUID,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> None:
    row = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == user_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Reminder not found")
    db.delete(row)
    db.commit()
