"""AI procurement analysis endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..ai import engine
from ..auth import get_current_user
from ..database import get_db
from ..models import AnalysisRun, InventoryItem, SupplierCatalog
from ..schemas import AnalysisRunOut
from ..services.audit import log_action

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/run", response_model=AnalysisRunOut)
def run_analysis(user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    inventory = db.query(InventoryItem).all()
    if not inventory:
        raise HTTPException(
            status_code=400, detail="No inventory found. Upload inventory first."
        )
    catalog = db.query(SupplierCatalog).all()

    result = engine.run_analysis(inventory, catalog)
    metrics = result.get("metrics", {})

    run = AnalysisRun(
        triggered_by=user,
        model_used=result.get("model_used", "rule-engine"),
        ai_enhanced=1 if result.get("ai_enhanced") else 0,
        items_analyzed=metrics.get("items_analyzed", len(inventory)),
        estimated_reorder_cost=metrics.get("estimated_reorder_cost", 0),
        result=result,
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    log_action(
        db, user, "ANALYSIS_RUN",
        f"Analyzed {run.items_analyzed} items "
        f"({'AI-enhanced' if run.ai_enhanced else 'rule-engine'})",
        {"run_id": run.id, "reorder_cost": run.estimated_reorder_cost},
    )
    return run


@router.get("/results", response_model=AnalysisRunOut)
def latest_results(user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    run = db.query(AnalysisRun).order_by(AnalysisRun.created_at.desc()).first()
    if not run:
        raise HTTPException(status_code=404, detail="No analysis has been run yet.")
    return run


@router.get("/history", response_model=list[AnalysisRunOut])
def history(user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(AnalysisRun).order_by(AnalysisRun.created_at.desc()).limit(20).all()
