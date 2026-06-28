from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from app.models.medicine import Medicine
from app.models.inventory import Inventory, InventoryBatch
from app.schemas.medicine import MedicineCreate, MedicineUpdate
from fastapi import HTTPException


def get_medicines(db: Session, skip: int = 0, limit: int = 100,
                  search: Optional[str] = None, category: Optional[str] = None,
                  show_wholesale: bool = False):
    query = db.query(Medicine).filter(Medicine.is_active == True, Medicine.is_approved == True)

    if search:
        query = query.filter(
            or_(
                Medicine.product_name.ilike(f"%{search}%"),
                Medicine.generic_name.ilike(f"%{search}%"),
                Medicine.brand_name.ilike(f"%{search}%"),
                Medicine.sku.ilike(f"%{search}%")
            )
        )
    if category:
        query = query.filter(Medicine.category == category)

    return query.offset(skip).limit(limit).all()


def create_medicine(db: Session, data: MedicineCreate) -> Medicine:
    existing = db.query(Medicine).filter(Medicine.sku == data.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")

    medicine = Medicine(**data.model_dump())
    db.add(medicine)
    db.commit()
    db.refresh(medicine)

    inventory = Inventory(medicine_id=medicine.id, total_quantity=0)
    db.add(inventory)
    db.commit()

    return medicine


def get_low_stock_medicines(db: Session):
    return db.query(Medicine, Inventory).join(
        Inventory, Medicine.id == Inventory.medicine_id
    ).filter(
        Inventory.total_quantity <= Inventory.reorder_level,
        Medicine.is_active == True
    ).all()


def get_expiring_medicines(db: Session, days: int = 30):
    from datetime import date, timedelta
    threshold = date.today() + timedelta(days=days)
    return db.query(InventoryBatch).filter(
        InventoryBatch.expiry_date <= threshold,
        InventoryBatch.quantity_available > 0
    ).all()
