import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import require_user_id
from app.core.constants import APPLICATION_STATUS_VALUES, WORK_MODE_VALUES
from app.db.session import get_db
from app.models import Application, Document, Employer
from app.schemas.application import ApplicationCreate, ApplicationRead, ApplicationUpdate
from app.services.applications import application_to_read, list_applications, load_application

router = APIRouter()


def _validate_status(status: str) -> None:
    if status not in APPLICATION_STATUS_VALUES:
        raise HTTPException(status_code=422, detail=f"Invalid status: {status}")


def _validate_work_mode(mode: str | None) -> None:
    if mode is None:
        return
    if mode not in WORK_MODE_VALUES:
        raise HTTPException(status_code=422, detail=f"Invalid work_mode: {mode}")


def _validate_resume_for_app(
    db: Session,
    user_id: uuid.UUID,
    app: Application,
    resume_id: uuid.UUID | None,
) -> None:
    if resume_id is None:
        return
    doc = (
        db.query(Document)
        .filter(Document.id == resume_id, Document.user_id == user_id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=422, detail="Resume document not found")
    if doc.application_id != app.id:
        raise HTTPException(
            status_code=422,
            detail="Resume document must belong to this application",
        )
    if doc.kind != "resume":
        raise HTTPException(status_code=422, detail="Resume field must reference a resume document")


@router.get("", response_model=list[ApplicationRead])
def list_apps(
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> list[ApplicationRead]:
    apps = list_applications(db, user_id)
    return [application_to_read(a) for a in apps]


@router.post("", response_model=ApplicationRead, status_code=201)
def create_app(
    body: ApplicationCreate,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> ApplicationRead:
    _validate_status(body.status)
    wm = body.work_mode
    if wm is not None:
        wm = wm.strip() or None
    _validate_work_mode(wm)
    emp = (
        db.query(Employer)
        .filter(Employer.id == body.employer_id, Employer.user_id == user_id)
        .first()
    )
    if not emp:
        raise HTTPException(status_code=422, detail="Employer not found")
    role = body.role.strip()
    salary = body.salary.strip() if body.salary else None
    source_url = body.source_url.strip() if body.source_url else None
    row = Application(
        user_id=user_id,
        employer_id=body.employer_id,
        role=role,
        salary=salary,
        work_mode=wm,
        source_url=source_url,
        status=body.status,
        applied_at=body.applied_at,
        deadline=body.deadline,
        next_action_at=body.next_action_at,
        notes=body.notes or "",
        resume_document_id=None,
        interview_feedback=body.interview_feedback,
        recruiter_interactions=body.recruiter_interactions,
        improvement_points=body.improvement_points,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    fresh = load_application(db, user_id, row.id)
    assert fresh is not None
    return application_to_read(fresh)


@router.get("/{application_id}", response_model=ApplicationRead)
def get_app(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> ApplicationRead:
    app = load_application(db, user_id, application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return application_to_read(app)


@router.patch("/{application_id}", response_model=ApplicationRead)
def update_app(
    application_id: uuid.UUID,
    body: ApplicationUpdate,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> ApplicationRead:
    app = load_application(db, user_id, application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    data = body.model_dump(exclude_unset=True)
    if "status" in data and data["status"] is not None:
        _validate_status(data["status"])
    if "work_mode" in data:
        wmv = data.get("work_mode")
        if wmv == "":
            data["work_mode"] = None
        _validate_work_mode(data.get("work_mode"))
    if "employer_id" in data and data["employer_id"] is not None:
        emp = (
            db.query(Employer)
            .filter(Employer.id == data["employer_id"], Employer.user_id == user_id)
            .first()
        )
        if not emp:
            raise HTTPException(status_code=422, detail="Employer not found")
    if "role" in data and data["role"] is not None:
        data["role"] = data["role"].strip()
    if "salary" in data and data.get("salary") is not None:
        s = data["salary"].strip() if isinstance(data["salary"], str) else ""
        data["salary"] = s if s else None
    if "source_url" in data and data.get("source_url") is not None:
        u = data["source_url"].strip() if isinstance(data["source_url"], str) else ""
        data["source_url"] = u if u else None
    resume_in_payload = "resume_document_id" in data
    new_resume = data.pop("resume_document_id", None) if resume_in_payload else None
    for k, v in data.items():
        setattr(app, k, v)
    db.flush()
    if resume_in_payload:
        _validate_resume_for_app(db, user_id, app, new_resume)
        app.resume_document_id = new_resume
    db.commit()
    fresh = load_application(db, user_id, application_id)
    assert fresh is not None
    return application_to_read(fresh)


@router.delete("/{application_id}", status_code=204)
def delete_app(
    application_id: uuid.UUID,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> None:
    app = load_application(db, user_id, application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app)
    db.commit()
