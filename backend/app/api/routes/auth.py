import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import require_user_id
from app.core.security import hash_password, verify_password
from app.db.session import get_db
from app.models import User
from app.schemas.auth import LoginBody, RegisterBody, UserRead

router = APIRouter()


@router.post("/register", response_model=UserRead)
def register(
    body: RegisterBody,
    request: Request,
    db: Session = Depends(get_db),
) -> UserRead:
    email = body.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(email=email, hashed_password=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    request.session["user_id"] = str(user.id)
    return UserRead.model_validate(user)


@router.post("/login", response_model=UserRead)
def login(
    body: LoginBody,
    request: Request,
    db: Session = Depends(get_db),
) -> UserRead:
    email = body.email.lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    request.session["user_id"] = str(user.id)
    return UserRead.model_validate(user)


@router.post("/logout")
def logout(request: Request) -> dict[str, str]:
    request.session.clear()
    return {"status": "ok"}


@router.get("/me", response_model=UserRead)
def me(
    db: Session = Depends(get_db),
    user_id: uuid.UUID = Depends(require_user_id),
) -> UserRead:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return UserRead.model_validate(user)
