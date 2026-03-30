import uuid

from fastapi import HTTPException, Request


def require_user_id(request: Request) -> uuid.UUID:
    raw = request.session.get("user_id")
    if not raw:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        return uuid.UUID(str(raw))
    except ValueError as e:
        raise HTTPException(status_code=401, detail="Invalid session") from e
