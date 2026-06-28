"""New multi-role auth router for Nahid Pharmacy platform."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, RefreshTokenRequest
from app.services.auth_service import authenticate_user, register_user, create_tokens
from app.utils.security import verify_token
from app.models.user import User
from datetime import datetime

router = APIRouter(prefix="/api/v2/auth", tags=["Auth V2"])
security = HTTPBearer()


def get_current_user_v2(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.email, data.password)
    user.last_login = datetime.utcnow()
    db.commit()
    return create_tokens(user)


@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    user = register_user(db, data)
    return create_tokens(user)


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user_v2)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "role": current_user.role.value,
        "status": current_user.status.value,
        "is_verified": current_user.is_verified
    }


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = verify_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return create_tokens(user)
