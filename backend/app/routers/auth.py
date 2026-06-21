"""Authentication endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import create_access_token, verify_password
from ..config import settings
from ..database import get_db
from ..models import User
from ..schemas import LoginRequest, TokenResponse
from ..services.audit import log_action

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()

    valid = False
    if user and verify_password(payload.password, user.password_hash):
        valid = True
    # Fallback to env admin credentials (works even before seed runs)
    elif (
        payload.username == settings.admin_username
        and payload.password == settings.admin_password
    ):
        valid = True

    if not valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    full_name = user.full_name if user else "Administrator"
    role = user.role if user else "admin"
    token = create_access_token(payload.username, {"role": role})
    log_action(db, payload.username, "LOGIN", "Successful login")
    return TokenResponse(access_token=token, full_name=full_name, role=role)
