import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import require_user_id
from app.db.session import get_db
from app.models import Application, Employer
from app.schemas.employer import EmployerCreate, EmployerRead, EmployerUpdate

router = APIRouter()


@router.get("", response_model=list[EmployerRead])
def list_employers(
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> list[Employer]:
    return (
        db.query(Employer)
        .filter(Employer.user_id == user_id)
        .order_by(Employer.name.asc())
        .all()
    )


@router.post("", response_model=EmployerRead, status_code=201)
def create_employer(
    body: EmployerCreate,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> Employer:
    row = Employer(
        user_id=user_id,
        name=body.name.strip(),
        website_url=body.website_url,
        notes=body.notes,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/{employer_id}", response_model=EmployerRead)
def get_employer(
    employer_id: uuid.UUID,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> Employer:
    row = (
        db.query(Employer)
        .filter(Employer.id == employer_id, Employer.user_id == user_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Employer not found")
    return row


@router.patch("/{employer_id}", response_model=EmployerRead)
def update_employer(
    employer_id: uuid.UUID,
    body: EmployerUpdate,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> Employer:
    row = (
        db.query(Employer)
        .filter(Employer.id == employer_id, Employer.user_id == user_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Employer not found")
    data = body.model_dump(exclude_unset=True)
    if "name" in data and data["name"] is not None:
        data["name"] = data["name"].strip()
    for k, v in data.items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{employer_id}", status_code=204)
def delete_employer(
    employer_id: uuid.UUID,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> None:
    row = (
        db.query(Employer)
        .filter(Employer.id == employer_id, Employer.user_id == user_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Employer not found")
    app_count = (
        db.query(Application)
        .filter(Application.employer_id == employer_id, Application.user_id == user_id)
        .count()
    )
    if app_count > 0:
        raise HTTPException(
            status_code=409,
            detail=(
                f"This employer has {app_count} application(s). "
                "Delete or change those applications first."
            ),
        )
    db.delete(row)
    db.commit()
