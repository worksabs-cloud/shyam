from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
from datetime import date, datetime
from app.models.medicine import MedicineCategory, StorageCondition


class MedicineBase(BaseModel):
    product_name: str
    generic_name: Optional[str] = None
    brand_name: Optional[str] = None
    manufacturer: Optional[str] = None
    category: Optional[MedicineCategory] = None
    dosage: Optional[str] = None
    pack_size: Optional[str] = None
    storage_condition: Optional[StorageCondition] = StorageCondition.ROOM_TEMPERATURE
    purchase_price: Optional[Decimal] = None
    wholesale_price: Optional[Decimal] = None
    retail_price: Optional[Decimal] = None
    gst_percentage: Optional[float] = 0.0
    prescription_required: bool = False
    description: Optional[str] = None


class MedicineCreate(MedicineBase):
    sku: str
    supplier_id: Optional[int] = None


class MedicineUpdate(BaseModel):
    product_name: Optional[str] = None
    wholesale_price: Optional[Decimal] = None
    retail_price: Optional[Decimal] = None
    is_active: Optional[bool] = None
    is_approved: Optional[bool] = None
    description: Optional[str] = None


class MedicineResponse(MedicineBase):
    id: int
    sku: str
    is_active: bool
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True
