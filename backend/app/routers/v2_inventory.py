"""Inventory router for Nahid Pharmacy platform."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.inventory import InventoryBatch, Inventory
from app.schemas.inventory import BatchCreate
from app.routers.v2_auth import get_current_user_v2
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/v2/inventory", tags=["Inventory V2"])


@router.post("/batch")
def add_batch(
    data: BatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPPLIER]:
        raise HTTPException(status_code=403, detail="Not authorized")

    batch = InventoryBatch(
        medicine_id=data.medicine_id,
        supplier_id=data.supplier_id,
        batch_number=data.batch_number,
        manufacturing_date=data.manufacturing_date,
        expiry_date=data.expiry_date,
        quantity_received=data.quantity_received,
        quantity_available=data.quantity_received,
        purchase_price=data.purchase_price,
        location=data.location
    )
    db.add(batch)
    db.flush()

    inventory = db.query(Inventory).filter(Inventory.medicine_id == data.medicine_id).first()
    if inventory:
        inventory.total_quantity += data.quantity_received
    else:
        inventory = Inventory(medicine_id=data.medicine_id, total_quantity=data.quantity_received)
        db.add(inventory)

    db.commit()
    return {"message": "Batch added", "batch_id": batch.id}


@router.get("/")
def list_inventory(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    inventories = db.query(Inventory).all()
    return [
        {"medicine_id": i.medicine_id, "total_quantity": i.total_quantity, "reorder_level": i.reorder_level}
        for i in inventories
    ]


@router.get("/batches/{medicine_id}")
def get_batches(
    medicine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    batches = db.query(InventoryBatch).filter(InventoryBatch.medicine_id == medicine_id).all()
    return [
        {
            "id": b.id, "batch_number": b.batch_number,
            "expiry_date": str(b.expiry_date), "quantity_available": b.quantity_available,
            "status": str(b.status)
        }
        for b in batches
    ]


@router.put("/{inventory_id}/reorder-level")
def update_reorder_level(
    inventory_id: int,
    reorder_level: int,
    max_stock_level: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    inv = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Not found")
    inv.reorder_level = reorder_level
    if max_stock_level:
        inv.max_stock_level = max_stock_level
    db.commit()
    return {"message": "Updated"}
