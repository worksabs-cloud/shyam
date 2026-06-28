"""Delivery router for Nahid Pharmacy platform."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.delivery import DeliveryAgent, DeliveryLog, DeliveryStatus
from app.models.order import Order, OrderStatus
from app.routers.v2_auth import get_current_user_v2
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/v2/delivery", tags=["Delivery V2"])


@router.get("/my-deliveries")
def my_deliveries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role != UserRole.DELIVERY_AGENT:
        raise HTTPException(status_code=403, detail="Not authorized")
    agent = db.query(DeliveryAgent).filter(DeliveryAgent.user_id == current_user.id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent profile not found")
    orders = db.query(Order).filter(Order.delivery_agent_id == agent.id).all()
    return [
        {
            "id": o.id, "order_number": o.order_number, "status": o.status.value,
            "delivery_address": o.delivery_address,
            "total_amount": float(o.total_amount) if o.total_amount else 0
        }
        for o in orders
    ]


@router.put("/orders/{order_id}/status")
def update_delivery_status(
    order_id: int,
    status: DeliveryStatus,
    proof_url: str = None,
    notes: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.DELIVERY_AGENT, UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if status == DeliveryStatus.DELIVERED:
        order.status = OrderStatus.DELIVERED
    elif status == DeliveryStatus.FAILED:
        order.status = OrderStatus.CANCELLED

    agent = db.query(DeliveryAgent).filter(DeliveryAgent.user_id == current_user.id).first()
    log = DeliveryLog(
        order_id=order_id,
        agent_id=agent.id if agent else None,
        status=status,
        proof_of_delivery=proof_url,
        notes=notes
    )
    db.add(log)
    db.commit()
    return {"message": "Delivery status updated"}


@router.post("/assign")
def assign_delivery(
    order_id: int,
    agent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.delivery_agent_id = agent_id
    order.status = OrderStatus.SHIPPED
    db.commit()
    return {"message": "Delivery assigned"}


@router.get("/agents")
def list_agents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    agents = db.query(DeliveryAgent).all()
    return [
        {
            "id": a.id, "user_id": a.user_id, "is_available": a.is_available,
            "vehicle_type": a.vehicle_type, "total_deliveries": a.total_deliveries,
            "rating": a.rating
        }
        for a in agents
    ]
