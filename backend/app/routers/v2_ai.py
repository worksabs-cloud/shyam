"""AI router for Nahid Pharmacy platform."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.routers.v2_auth import get_current_user_v2
from app.models.user import User, UserRole
from app.services.ai_service import ai_smart_search, get_demand_forecast, get_expiry_risk_report, get_reorder_recommendations

router = APIRouter(prefix="/api/v2/ai", tags=["AI V2"])


@router.get("/search")
def smart_search(
    query: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    return ai_smart_search(db, query)


@router.get("/forecast/{medicine_id}")
def demand_forecast(
    medicine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_demand_forecast(db, medicine_id)


@router.get("/expiry-risk")
def expiry_risk(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_expiry_risk_report(db)


@router.get("/reorder-recommendations")
def reorder_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_reorder_recommendations(db)
