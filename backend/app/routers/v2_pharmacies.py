"""Pharmacies router for Nahid Pharmacy platform."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.pharmacy import Pharmacy
from app.routers.v2_auth import get_current_user_v2
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/v2/pharmacies", tags=["Pharmacies V2"])


@router.get("/")
def list_pharmacies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    pharmacies = db.query(Pharmacy).all()
    return [
        {
            "id": p.id, "business_name": p.business_name, "city": p.city,
            "is_approved": p.is_approved,
            "credit_limit": float(p.credit_limit) if p.credit_limit else 0,
            "outstanding_amount": float(p.outstanding_amount) if p.outstanding_amount else 0,
            "email": p.email, "phone": p.phone
        }
        for p in pharmacies
    ]


@router.get("/my-profile")
def my_pharmacy_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role != UserRole.PHARMACY:
        raise HTTPException(status_code=403, detail="Not authorized")
    pharmacy = db.query(Pharmacy).filter(Pharmacy.user_id == current_user.id).first()
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {
        "id": pharmacy.id, "business_name": pharmacy.business_name,
        "license_number": pharmacy.license_number, "city": pharmacy.city,
        "state": pharmacy.state, "is_approved": pharmacy.is_approved,
        "credit_limit": float(pharmacy.credit_limit) if pharmacy.credit_limit else 0
    }


@router.post("/")
def create_pharmacy_profile(
    business_name: str,
    city: str = None,
    state: str = None,
    license_number: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role != UserRole.PHARMACY:
        raise HTTPException(status_code=403, detail="Not authorized")
    existing = db.query(Pharmacy).filter(Pharmacy.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    pharmacy = Pharmacy(
        user_id=current_user.id,
        business_name=business_name,
        city=city,
        state=state,
        license_number=license_number
    )
    db.add(pharmacy)
    db.commit()
    return {"id": pharmacy.id, "business_name": pharmacy.business_name}


@router.put("/{pharmacy_id}/approve")
def approve_pharmacy(
    pharmacy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == pharmacy_id).first()
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Not found")
    pharmacy.is_approved = True
    db.commit()
    return {"message": "Pharmacy approved"}
