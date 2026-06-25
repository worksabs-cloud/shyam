"""Users router for Nahid Pharmacy platform."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole, UserStatus
from app.routers.v2_auth import get_current_user_v2

router = APIRouter(prefix="/api/v2/users", tags=["Users V2"])


@router.get("/")
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    users = db.query(User).offset(skip).limit(limit).all()
    return [
        {
            "id": u.id, "email": u.email, "first_name": u.first_name,
            "last_name": u.last_name, "role": u.role.value, "status": u.status.value,
            "is_verified": u.is_verified, "created_at": str(u.created_at)
        }
        for u in users
    ]


@router.put("/{user_id}/status")
def update_user_status(
    user_id: int,
    status: UserStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = status
    db.commit()
    return {"message": "Status updated"}


@router.get("/notifications")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    from app.services.notification_service import get_user_notifications
    notifs = get_user_notifications(db, current_user.id)
    return [
        {
            "id": n.id, "title": n.title, "message": n.message,
            "is_read": n.is_read, "created_at": str(n.created_at)
        }
        for n in notifs
    ]
