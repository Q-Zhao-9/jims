import uuid

from sqlalchemy.orm import Session, selectinload

from app.models import Application
from app.schemas.application import ApplicationRead


def application_to_read(app: Application) -> ApplicationRead:
    doc_ids = [d.id for d in app.documents] if app.documents else []
    return ApplicationRead(
        id=app.id,
        employer_id=app.employer_id,
        role=app.role,
        salary=app.salary,
        work_mode=app.work_mode,
        source_url=app.source_url,
        status=app.status,
        applied_at=app.applied_at,
        deadline=app.deadline,
        next_action_at=app.next_action_at,
        notes=app.notes,
        resume_document_id=app.resume_document_id,
        document_ids=doc_ids,
        interview_feedback=app.interview_feedback,
        recruiter_interactions=app.recruiter_interactions,
        improvement_points=app.improvement_points,
        created_at=app.created_at,
        updated_at=app.updated_at,
    )


def load_application(db: Session, user_id: uuid.UUID, app_id: uuid.UUID) -> Application | None:
    return (
        db.query(Application)
        .options(selectinload(Application.documents))
        .filter(Application.id == app_id, Application.user_id == user_id)
        .first()
    )


def list_applications(db: Session, user_id: uuid.UUID) -> list[Application]:
    return (
        db.query(Application)
        .options(selectinload(Application.documents))
        .filter(Application.user_id == user_id)
        .order_by(Application.updated_at.desc())
        .all()
    )
