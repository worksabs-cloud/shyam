"""Analytics router for Nahid Pharmacy platform."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.routers.v2_auth import get_current_user_v2
from app.models.user import User, UserRole
from app.models.order import Order, OrderItem, OrderType
from app.models.medicine import Medicine
from app.models.inventory import Inventory
from datetime import datetime, timedelta, date

router = APIRouter(prefix="/api/v2/analytics", tags=["Analytics V2"])


@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")

    today = date.today()
    month_start = today.replace(day=1)

    total_revenue = db.query(func.sum(Order.total_amount)).filter(
        Order.status != "cancelled"
    ).scalar() or 0
    today_sales = db.query(func.sum(Order.total_amount)).filter(
        func.date(Order.created_at) == today
    ).scalar() or 0
    monthly_sales = db.query(func.sum(Order.total_amount)).filter(
        Order.created_at >= month_start
    ).scalar() or 0
    b2b_revenue = db.query(func.sum(Order.total_amount)).filter(
        Order.order_type == OrderType.B2B
    ).scalar() or 0
    b2c_revenue = db.query(func.sum(Order.total_amount)).filter(
        Order.order_type == OrderType.B2C
    ).scalar() or 0

    low_stock = db.query(func.count(Inventory.id)).filter(
        Inventory.total_quantity <= Inventory.reorder_level
    ).scalar() or 0

    from app.models.inventory import InventoryBatch
    threshold = today + timedelta(days=30)
    expiring = db.query(func.count(InventoryBatch.id)).filter(
        InventoryBatch.expiry_date <= threshold,
        InventoryBatch.quantity_available > 0
    ).scalar() or 0

    pending_deliveries = db.query(func.count(Order.id)).filter(
        Order.status.in_(["shipped", "processing"])
    ).scalar() or 0

    from app.models.pharmacy import Customer, Pharmacy
    active_customers = db.query(func.count(Customer.id)).scalar() or 0
    active_pharmacies = db.query(func.count(Pharmacy.id)).filter(
        Pharmacy.is_approved == True
    ).scalar() or 0

    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_medicines = db.query(func.count(Medicine.id)).filter(Medicine.is_active == True).scalar() or 0

    return {
        "total_revenue": float(total_revenue),
        "today_sales": float(today_sales),
        "monthly_sales": float(monthly_sales),
        "b2b_revenue": float(b2b_revenue),
        "b2c_revenue": float(b2c_revenue),
        "low_stock_count": low_stock,
        "expiring_medicines": expiring,
        "pending_deliveries": pending_deliveries,
        "active_customers": active_customers,
        "active_pharmacies": active_pharmacies,
        "total_orders": total_orders,
        "total_medicines": total_medicines
    }


@router.get("/sales-trend")
def sales_trend(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")

    start_date = date.today() - timedelta(days=days)
    results = db.query(
        func.date(Order.created_at).label("date"),
        func.sum(Order.total_amount).label("revenue"),
        func.count(Order.id).label("orders")
    ).filter(
        Order.created_at >= start_date
    ).group_by(
        func.date(Order.created_at)
    ).order_by("date").all()

    return [
        {"date": str(r.date), "revenue": float(r.revenue or 0), "orders": r.orders}
        for r in results
    ]


@router.get("/top-medicines")
def top_medicines(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")

    results = db.query(
        Medicine.id,
        Medicine.product_name,
        func.sum(OrderItem.quantity).label("total_sold"),
        func.sum(OrderItem.total_price).label("revenue")
    ).join(OrderItem, Medicine.id == OrderItem.medicine_id).group_by(
        Medicine.id, Medicine.product_name
    ).order_by(func.sum(OrderItem.quantity).desc()).limit(limit).all()

    return [
        {
            "medicine_id": r.id, "name": r.product_name,
            "total_sold": int(r.total_sold or 0), "revenue": float(r.revenue or 0)
        }
        for r in results
    ]


@router.get("/category-breakdown")
def category_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_v2)
):
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")

    results = db.query(
        Medicine.category,
        func.count(Medicine.id).label("count"),
        func.sum(OrderItem.quantity).label("total_sold")
    ).outerjoin(OrderItem, Medicine.id == OrderItem.medicine_id).group_by(
        Medicine.category
    ).all()

    return [
        {
            "category": str(r.category) if r.category else "Other",
            "count": r.count,
            "total_sold": int(r.total_sold or 0)
        }
        for r in results
    ]
