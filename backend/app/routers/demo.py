"""One-click demo-data loader — judge-friendly setup."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..seed import load_demo_data
from ..services.audit import log_action

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("/load")
def load_demo(user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    counts = load_demo_data(db)
    log_action(
        db, user, "DEMO_DATA_LOADED",
        f"Loaded {counts['inventory']} medicines and {counts['catalog']} catalog rows",
        counts,
    )
    return {"status": "ok", **counts}
