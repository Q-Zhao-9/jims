import re
import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import require_user_id
from app.core.config import get_settings
from app.core.constants import DOCUMENT_KIND_VALUES
from app.db.session import get_db
from app.models import Application, Document
from app.schemas.document import DocumentRead

router = APIRouter()
_settings = get_settings()


def _safe_filename(name: str) -> str:
    base = Path(name).name
    return re.sub(r"[^a-zA-Z0-9._-]", "_", base)[:200] or "file"


@router.get("", response_model=list[DocumentRead])
def list_documents(
    application_id: uuid.UUID | None = Query(None),
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> list[Document]:
    q = db.query(Document).filter(Document.user_id == user_id)
    if application_id is not None:
        q = q.filter(Document.application_id == application_id)
    return q.order_by(Document.uploaded_at.desc()).all()


@router.post("", response_model=DocumentRead, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    kind: str = Form(...),
    label: str = Form(...),
    application_id: str | None = Form(None),
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> Document:
    if kind not in DOCUMENT_KIND_VALUES:
        raise HTTPException(status_code=422, detail=f"Invalid kind: {kind}")
    app_uuid: uuid.UUID | None = None
    if application_id:
        try:
            app_uuid = uuid.UUID(application_id)
        except ValueError as e:
            raise HTTPException(status_code=422, detail="Invalid application_id") from e
        app = (
            db.query(Application)
            .filter(Application.id == app_uuid, Application.user_id == user_id)
            .first()
        )
        if not app:
            raise HTTPException(status_code=422, detail="Application not found")

    doc_id = uuid.uuid4()
    safe = _safe_filename(file.filename or "upload.bin")
    rel = f"{user_id}/{doc_id}_{safe}"
    dest = _settings.upload_dir / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    with dest.open("wb") as out:
        shutil.copyfileobj(file.file, out)

    row = Document(
        id=doc_id,
        user_id=user_id,
        application_id=app_uuid,
        kind=kind,
        label=label.strip(),
        file_name=safe,
        storage_path=rel,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    if app_uuid is not None and kind == "resume":
        app_row = (
            db.query(Application)
            .filter(Application.id == app_uuid, Application.user_id == user_id)
            .first()
        )
        if app_row is not None:
            app_row.resume_document_id = row.id
            db.commit()
            db.refresh(row)

    return row


@router.get("/{document_id}/file")
def download_file(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> FileResponse:
    row = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == user_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    path = _settings.upload_dir / row.storage_path
    if not path.is_file():
        raise HTTPException(status_code=404, detail="File missing on disk")
    return FileResponse(
        path,
        filename=row.file_name,
        media_type="application/octet-stream",
    )


@router.delete("/{document_id}", status_code=204)
def delete_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> None:
    row = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == user_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    for a in (
        db.query(Application)
        .filter(
            Application.user_id == user_id,
            Application.resume_document_id == document_id,
        )
        .all()
    ):
        a.resume_document_id = None
    path = _settings.upload_dir / row.storage_path
    db.delete(row)
    db.commit()
    if path.is_file():
        path.unlink()
