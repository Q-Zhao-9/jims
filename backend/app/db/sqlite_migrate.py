"""Add columns to existing SQLite DBs when the ORM gains new fields (create_all does not alter tables)."""

from __future__ import annotations

from sqlalchemy import Engine, text


def migrate_sqlite_schema(engine: Engine, database_url: str) -> None:
    if not database_url.strip().lower().startswith("sqlite"):
        return
    with engine.begin() as conn:
        row = conn.execute(
            text(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='applications'"
            )
        ).fetchone()
        if not row:
            return
        info = conn.execute(text("PRAGMA table_info(applications)")).fetchall()
        names = {r[1] for r in info}
        alters: list[str] = []
        if "salary" not in names:
            alters.append("ALTER TABLE applications ADD COLUMN salary VARCHAR(255)")
        if "work_mode" not in names:
            alters.append("ALTER TABLE applications ADD COLUMN work_mode VARCHAR(32)")
        if "source_url" not in names:
            alters.append("ALTER TABLE applications ADD COLUMN source_url VARCHAR(2000)")
        for stmt in alters:
            conn.execute(text(stmt))
