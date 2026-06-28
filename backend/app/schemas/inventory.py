from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import date, datetime
from app.models.inventory import BatchStatus


class BatchCreate(BaseModel):
    medicine_id: int
    supplier_id: Optional[int] = None
    batch_number: str
    manufacturing_date: Optional[date] = None
    expiry_date: date
    quantity_received: int
    purchase_price: Optional[Decimal] = None
    location: Optional[str] = None


class BatchResponse(BaseModel):
    id: int
    medicine_id: int
    batch_number: str
    expiry_date: date
    quantity_available: int
    status: BatchStatus

    class Config:
        from_attributes = True


class InventoryResponse(BaseModel):
    medicine_id: int
    total_quantity: int
    reorder_level: int

    class Config:
        from_attributes = True
