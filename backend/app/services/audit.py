"""Audit-trail helper."""
from sqlalchemy.orm import Session

from ..models import AuditLog


def log_action(
    db: Session, user: str, action: str, result: str = "", meta: dict | None = None
) -> AuditLog:
    entry = AuditLog(user=user, action=action, result=result, meta=meta)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
