"""Pydantic schemas for request/response validation."""
from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    full_name: str
    role: str


class InventoryItemOut(BaseModel):
    id: int
    medicine_name: str
    current_stock: float
    avg_daily_sales: float
    category: Optional[str] = None
    expiry_date: Optional[date] = None
    unit_cost: Optional[float] = None

    class Config:
        from_attributes = True


class SupplierCatalogOut(BaseModel):
    id: int
    supplier_name: str
    medicine_name: str
    unit_price: float
    lead_time_days: int
    available_quantity: int

    class Config:
        from_attributes = True


class UploadResult(BaseModel):
    rows_imported: int
    rows_skipped: int
    warnings: list[str] = []
    preview: list[dict[str, Any]] = []


class POItemIn(BaseModel):
    medicine_name: str
    quantity: int
    unit_price: float


class POGenerateRequest(BaseModel):
    supplier_name: str
    items: list[POItemIn]
    notes: str = ""


class PurchaseOrderItemOut(BaseModel):
    medicine_name: str
    quantity: int
    unit_price: float
    line_total: float

    class Config:
        from_attributes = True


class PurchaseOrderOut(BaseModel):
    id: int
    po_number: str
    supplier_name: str
    status: str
    total_cost: float
    expected_delivery: Optional[date] = None
    created_at: datetime
    notes: str = ""
    items: list[PurchaseOrderItemOut] = []

    class Config:
        from_attributes = True


class AnalysisRunOut(BaseModel):
    id: int
    created_at: datetime
    model_used: str
    ai_enhanced: int
    items_analyzed: int
    estimated_reorder_cost: float
    result: dict[str, Any]

    class Config:
        from_attributes = True


class AuditLogOut(BaseModel):
    id: int
    timestamp: datetime
    user: str
    action: str
    result: str
    meta: Optional[dict[str, Any]] = None

    class Config:
        from_attributes = True
