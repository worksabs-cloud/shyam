from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
from datetime import datetime
from app.models.order import OrderType, OrderStatus, PaymentStatus


class OrderItemCreate(BaseModel):
    medicine_id: int
    quantity: int
    unit_price: Decimal


class OrderCreate(BaseModel):
    order_type: OrderType
    items: List[OrderItemCreate]
    delivery_address: Optional[str] = None
    notes: Optional[str] = None
    prescription_url: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    notes: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    order_number: str
    order_type: OrderType
    status: OrderStatus
    payment_status: PaymentStatus
    total_amount: Decimal
    created_at: datetime

    class Config:
        from_attributes = True
