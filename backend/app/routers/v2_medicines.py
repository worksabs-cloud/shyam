"""Medicines router for Nahid Pharmacy platform."""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models.medicine import Medicine
from app.schemas.medicine import MedicineCreate, MedicineUpdate
from app.services.medicine_service import get_medicines, create_medicine, get_low_stock_medicines, get_expiring_medicines
from app.routers.v2_auth import get_current_user_v2
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/v2/medicines", tags=["Medicines V2"])


@router.get("/")
def list_medicines(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    show_wholesale = current_user.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PHARMACY, UserRole.SUPPLIER]
    medicines = get_medicines(db, skip, limit, search, category, show_wholesale)
    result = []
    for m in medicines:
        data = {
            "id": m.id, "product_name": m.product_name, "generic_name": m.generic_name,
            "brand_name": m.brand_name, "sku": m.sku, "manufacturer": m.manufacturer,
            "category": str(m.category) if m.category else None,
            "dosage": m.dosage, "pack_size": m.pack_size,
            "retail_price": float(m.retail_price) if m.retail_price else None,
            "prescription_required": m.prescription_required, "is_active": m.is_active
        }
        if show_wholesale:
            data["wholesale_price"] = float(m.wholesale_price) if m.wholesale_price else None
            data["purchase_price"] = float(m.purchase_price) if m.purchase_price else None
        result.append(data)
    return result


@router.get("/all-admin")
def list_all_medicines_admin(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    """Admin endpoint to see all medicines including unapproved."""
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    from sqlalchemy import or_
    query = db.query(Medicine)
    if search:
        query = query.filter(
            or_(
                Medicine.product_name.ilike(f"%{search}%"),
                Medicine.sku.ilike(f"%{search}%")
            )
        )
    medicines = query.offset(skip).limit(limit).all()
    return [
        {
            "id": m.id, "product_name": m.product_name, "generic_name": m.generic_name,
            "sku": m.sku, "category": str(m.category) if m.category else None,
            "retail_price": float(m.retail_price) if m.retail_price else None,
            "wholesale_price": float(m.wholesale_price) if m.wholesale_price else None,
            "purchase_price": float(m.purchase_price) if m.purchase_price else None,
            "is_active": m.is_active, "is_approved": m.is_approved,
            "manufacturer": m.manufacturer, "prescription_required": m.prescription_required
        }
        for m in medicines
    ]


@router.post("/")
def create_new_medicine(
    data: MedicineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPPLIER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    medicine = create_medicine(db, data)
    return {"id": medicine.id, "sku": medicine.sku, "product_name": medicine.product_name, "message": "Medicine created successfully"}


@router.get("/low-stock")
def low_stock(db: Session = Depends(get_db), current_user: User = Depends(get_current_user_v2)):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    items = get_low_stock_medicines(db)
    return [
        {"medicine_id": m.id, "name": m.product_name, "current_stock": i.total_quantity, "reorder_level": i.reorder_level}
        for m, i in items
    ]


@router.get("/expiring")
def expiring_medicines(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    batches = get_expiring_medicines(db, days)
    return [
        {"batch_id": b.id, "medicine_id": b.medicine_id, "batch_number": b.batch_number,
         "expiry_date": str(b.expiry_date), "quantity": b.quantity_available}
        for b in batches
    ]


@router.get("/{medicine_id}")
def get_medicine(
    medicine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return {
        "id": medicine.id, "product_name": medicine.product_name,
        "generic_name": medicine.generic_name, "brand_name": medicine.brand_name,
        "sku": medicine.sku, "manufacturer": medicine.manufacturer,
        "category": str(medicine.category) if medicine.category else None,
        "dosage": medicine.dosage, "pack_size": medicine.pack_size,
        "retail_price": float(medicine.retail_price) if medicine.retail_price else None,
        "wholesale_price": float(medicine.wholesale_price) if medicine.wholesale_price else None,
        "prescription_required": medicine.prescription_required,
        "description": medicine.description, "is_active": medicine.is_active,
        "is_approved": medicine.is_approved
    }


@router.put("/{medicine_id}")
def update_medicine(
    medicine_id: int,
    data: MedicineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(medicine, key, value)
    db.commit()
    return {"message": "Updated successfully"}
