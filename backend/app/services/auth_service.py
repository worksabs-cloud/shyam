from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole, UserStatus
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.utils.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from datetime import datetime


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if user.status == UserStatus.SUSPENDED:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account suspended")
    return user


def register_user(db: Session, data: RegisterRequest) -> User:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        password_hash=get_password_hash(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        role=data.role,
        status=UserStatus.PENDING if data.role in [UserRole.PHARMACY, UserRole.SUPPLIER] else UserStatus.ACTIVE,
        is_verified=True if data.role == UserRole.CUSTOMER else False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_tokens(user: User) -> TokenResponse:
    token_data = {"sub": str(user.id), "role": user.role.value, "email": user.email}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_role=user.role.value,
        user_id=user.id
    )
