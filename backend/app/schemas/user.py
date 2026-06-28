from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.CUSTOMER


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[UserStatus] = None


class UserResponse(UserBase):
    id: int
    role: UserRole
    status: UserStatus
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True
