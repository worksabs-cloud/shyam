"""Orders router for Nahid Pharmacy platform."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.order import Order, OrderStatus
from app.schemas.order import OrderCreate, OrderStatusUpdate
from app.services.order_service import create_order, get_orders_summary
from app.routers.v2_auth import get_current_user_v2
from app.models.user import User, UserRole
from app.models.pharmacy import Customer, Pharmacy

router = APIRouter(prefix="/api/v2/orders", tags=["Orders V2"])


@router.post("/")
def place_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    customer_id = None
    pharmacy_id = None

    if current_user.role == UserRole.CUSTOMER:
        customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
        if customer:
            customer_id = customer.id
    elif current_user.role == UserRole.PHARMACY:
        pharmacy = db.query(Pharmacy).filter(Pharmacy.user_id == current_user.id).first()
        if pharmacy:
            pharmacy_id = pharmacy.id

    order = create_order(db, data, current_user.id, customer_id, pharmacy_id)
    return {
        "id": order.id, "order_number": order.order_number,
        "total_amount": float(order.total_amount), "status": order.status.value
    }


@router.get("/")
def list_orders(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    query = db.query(Order)

    if current_user.role == UserRole.CUSTOMER:
        customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
        if customer:
            query = query.filter(Order.customer_id == customer.id)
    elif current_user.role == UserRole.PHARMACY:
        pharmacy = db.query(Pharmacy).filter(Pharmacy.user_id == current_user.id).first()
        if pharmacy:
            query = query.filter(Order.pharmacy_id == pharmacy.id)

    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": o.id, "order_number": o.order_number, "status": o.status.value,
            "payment_status": o.payment_status.value,
            "total_amount": float(o.total_amount) if o.total_amount else 0,
            "order_type": o.order_type.value,
            "created_at": str(o.created_at)
        }
        for o in orders
    ]


@router.get("/summary")
def orders_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_orders_summary(db)


@router.put("/{order_id}/status")
def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DELIVERY_AGENT]:
        raise HTTPException(status_code=403, detail="Not authorized")
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = data.status
    if data.notes:
        order.notes = data.notes
    db.commit()
    return {"message": "Status updated", "order_number": order.order_number, "new_status": data.status.value}


@router.get("/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        "id": order.id, "order_number": order.order_number,
        "status": order.status.value, "payment_status": order.payment_status.value,
        "total_amount": float(order.total_amount) if order.total_amount else 0,
        "subtotal": float(order.subtotal) if order.subtotal else 0,
        "tax_amount": float(order.tax_amount) if order.tax_amount else 0,
        "delivery_address": order.delivery_address, "notes": order.notes,
        "created_at": str(order.created_at)
    }
