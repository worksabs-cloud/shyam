from sqlalchemy.orm import Session
from typing import List
import random
import string
from app.models.order import Order, OrderItem, OrderType, OrderStatus, PaymentStatus
from app.models.inventory import Inventory, StockMovement
from app.schemas.order import OrderCreate
from fastapi import HTTPException


def generate_order_number():
    return "ORD-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


def create_order(db: Session, data: OrderCreate, user_id: int,
                 customer_id: int = None, pharmacy_id: int = None) -> Order:
    subtotal = sum(float(item.unit_price) * item.quantity for item in data.items)
    tax_amount = subtotal * 0.18  # 18% GST
    total = subtotal + tax_amount

    order = Order(
        order_number=generate_order_number(),
        order_type=data.order_type,
        customer_id=customer_id,
        pharmacy_id=pharmacy_id,
        subtotal=subtotal,
        tax_amount=tax_amount,
        total_amount=total,
        delivery_address=data.delivery_address,
        notes=data.notes,
        prescription_url=data.prescription_url
    )
    db.add(order)
    db.flush()

    for item_data in data.items:
        inventory = db.query(Inventory).filter(Inventory.medicine_id == item_data.medicine_id).first()
        if not inventory or inventory.total_quantity < item_data.quantity:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for medicine ID {item_data.medicine_id}"
            )

        item = OrderItem(
            order_id=order.id,
            medicine_id=item_data.medicine_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            total_price=float(item_data.unit_price) * item_data.quantity
        )
        db.add(item)

        inventory.total_quantity -= item_data.quantity

        movement = StockMovement(
            medicine_id=item_data.medicine_id,
            movement_type="OUT",
            quantity=item_data.quantity,
            reference_type="ORDER",
            reference_id=order.id,
            created_by=user_id
        )
        db.add(movement)

    db.commit()
    db.refresh(order)
    return order


def get_orders_summary(db: Session):
    from sqlalchemy import func
    return {
        "total": db.query(func.count(Order.id)).scalar() or 0,
        "pending": db.query(func.count(Order.id)).filter(Order.status == OrderStatus.PENDING).scalar() or 0,
        "processing": db.query(func.count(Order.id)).filter(Order.status == OrderStatus.PROCESSING).scalar() or 0,
        "delivered": db.query(func.count(Order.id)).filter(Order.status == OrderStatus.DELIVERED).scalar() or 0,
        "b2b": db.query(func.count(Order.id)).filter(Order.order_type == OrderType.B2B).scalar() or 0,
        "b2c": db.query(func.count(Order.id)).filter(Order.order_type == OrderType.B2C).scalar() or 0,
    }
