import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.db.base import Base
from app.db.sqlite_migrate import migrate_sqlite_schema
from app.db.session import engine

import app.models  # noqa: F401 — register ORM metadata

settings = get_settings()
settings.upload_dir.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="JIMS API", version="0.1.0")

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.secret_key,
    same_site="lax",
    https_only=False,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
def _startup() -> None:
    # Pytest sets SKIP_DB_INIT=1 before import; tests use an in-memory DB via dependency override.
    if os.getenv("SKIP_DB_INIT"):
        return
    Base.metadata.create_all(bind=engine)
    migrate_sqlite_schema(engine, settings.database_url)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
