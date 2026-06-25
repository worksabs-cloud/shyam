"""Suppliers router for Nahid Pharmacy platform."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.pharmacy import Supplier
from app.routers.v2_auth import get_current_user_v2
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/v2/suppliers", tags=["Suppliers V2"])


@router.get("/")
def list_suppliers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    suppliers = db.query(Supplier).all()
    return [
        {
            "id": s.id, "company_name": s.company_name, "email": s.email,
            "phone": s.phone, "is_approved": s.is_approved, "rating": s.rating,
            "city": s.city, "state": s.state
        }
        for s in suppliers
    ]


@router.get("/my-profile")
def my_supplier_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role != UserRole.SUPPLIER:
        raise HTTPException(status_code=403, detail="Not authorized")
    supplier = db.query(Supplier).filter(Supplier.user_id == current_user.id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {
        "id": supplier.id, "company_name": supplier.company_name,
        "is_approved": supplier.is_approved, "rating": supplier.rating
    }


@router.put("/{supplier_id}/approve")
def approve_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Not found")
    supplier.is_approved = True
    db.commit()
    return {"message": "Supplier approved"}
