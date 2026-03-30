import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import require_user_id
from app.db.session import get_db
from app.models import Application, Interview
from app.schemas.interview import InterviewCreate, InterviewRead, InterviewUpdate

router = APIRouter()


def _get_app(db: Session, user_id: uuid.UUID, application_id: uuid.UUID) -> Application | None:
    return (
        db.query(Application)
        .filter(Application.id == application_id, Application.user_id == user_id)
        .first()
    )


@router.get("", response_model=list[InterviewRead])
def list_interviews(
    application_id: uuid.UUID | None = Query(None),
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> list[Interview]:
    q = db.query(Interview).filter(Interview.user_id == user_id)
    if application_id is not None:
        q = q.filter(Interview.application_id == application_id)
    return q.order_by(Interview.scheduled_at.desc()).all()


@router.post("", response_model=InterviewRead, status_code=201)
def create_interview(
    body: InterviewCreate,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> Interview:
    if not _get_app(db, user_id, body.application_id):
        raise HTTPException(status_code=422, detail="Application not found")
    row = Interview(
        user_id=user_id,
        application_id=body.application_id,
        interview_type=body.interview_type.strip(),
        scheduled_at=body.scheduled_at,
        meeting_link=body.meeting_link,
        interviewers=body.interviewers or "",
        notes=body.notes or "",
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/{interview_id}", response_model=InterviewRead)
def get_interview(
    interview_id: uuid.UUID,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> Interview:
    row = (
        db.query(Interview)
        .filter(Interview.id == interview_id, Interview.user_id == user_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Interview not found")
    return row


@router.patch("/{interview_id}", response_model=InterviewRead)
def update_interview(
    interview_id: uuid.UUID,
    body: InterviewUpdate,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> Interview:
    row = (
        db.query(Interview)
        .filter(Interview.id == interview_id, Interview.user_id == user_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Interview not found")
    data = body.model_dump(exclude_unset=True)
    if "interview_type" in data and data["interview_type"] is not None:
        data["interview_type"] = data["interview_type"].strip()
    for k, v in data.items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{interview_id}", status_code=204)
def delete_interview(
    interview_id: uuid.UUID,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> None:
    row = (
        db.query(Interview)
        .filter(Interview.id == interview_id, Interview.user_id == user_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Interview not found")
    db.delete(row)
    db.commit()
