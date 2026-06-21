"""Audit log endpoint."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import AuditLog
from ..schemas import AuditLogOut

router = APIRouter(prefix="/audit-log", tags=["audit"])


@router.get("", response_model=list[AuditLogOut])
def get_audit_log(
    limit: int = 100,
    user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .limit(min(limit, 500))
        .all()
    )
