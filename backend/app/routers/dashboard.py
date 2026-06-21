"""Dashboard metrics endpoint — aggregates live KPIs for the home screen."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import (
    AnalysisRun,
    AuditLog,
    InventoryItem,
    PurchaseOrder,
    SupplierCatalog,
)
from ..services import analytics

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/metrics")
def metrics(user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    inventory = db.query(InventoryItem).all()
    catalog = db.query(SupplierCatalog).all()

    # Live computation so the dashboard reflects current data even before a run
    if inventory:
        analysis = analytics.analyze(inventory, catalog)
        m = analysis["metrics"]
        rd = m["risk_distribution"]
        ed = m["expiry_distribution"]
        low_stock = rd["critical"] + rd["high"] + rd["medium"]
        cards = {
            "total_medicines": len(inventory),
            "low_stock_items": low_stock,
            "stockout_risk_items": rd["critical"] + rd["high"],
            "dead_stock_items": len(analysis["dead_stock"]),
            "expiry_risk_items": ed["critical"] + ed["warning"] + ed["expired"],
            "estimated_reorder_cost": m["estimated_reorder_cost"],
            "health_score": m["health_score"],
        }
        charts = {
            "risk_distribution": rd,
            "expiry_distribution": ed,
            "supplier_spend": m["supplier_spend"],
            "dead_stock_units": [
                {"medicine_name": d["medicine_name"], "units": d["current_stock"]}
                for d in analysis["dead_stock"][:8]
            ],
            "top_reorders": [
                {
                    "medicine_name": o["medicine_name"],
                    "cost": o["estimated_cost"],
                    "quantity": o["recommended_quantity"],
                }
                for o in analysis["recommended_orders"][:8]
            ],
        }
    else:
        cards = {
            "total_medicines": 0,
            "low_stock_items": 0,
            "stockout_risk_items": 0,
            "dead_stock_items": 0,
            "expiry_risk_items": 0,
            "estimated_reorder_cost": 0,
            "health_score": 0,
        }
        charts = {
            "risk_distribution": {},
            "expiry_distribution": {},
            "supplier_spend": [],
            "dead_stock_units": [],
            "top_reorders": [],
        }

    recent = (
        db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(10).all()
    )
    activity = [
        {
            "timestamp": a.timestamp.isoformat(),
            "action": a.action,
            "user": a.user,
            "result": a.result,
        }
        for a in recent
    ]

    return {
        "cards": cards,
        "charts": charts,
        "activity": activity,
        "counts": {
            "suppliers": db.query(SupplierCatalog).distinct(
                SupplierCatalog.supplier_name
            ).count(),
            "purchase_orders": db.query(PurchaseOrder).count(),
            "analysis_runs": db.query(AnalysisRun).count(),
        },
    }
