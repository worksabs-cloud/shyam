"""Inventory upload and listing endpoints."""
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import InventoryItem
from ..schemas import InventoryItemOut, UploadResult
from ..services import excel
from ..services.audit import log_action

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.post("/upload", response_model=UploadResult)
async def upload_inventory(
    file: UploadFile = File(...),
    replace: bool = True,
    user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = await file.read()
    try:
        rows, warnings = excel.parse_inventory(content, file.filename or "upload.xlsx")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if replace:
        db.query(InventoryItem).delete()

    for r in rows:
        db.add(InventoryItem(**r))
    db.commit()

    log_action(
        db, user, "INVENTORY_UPLOAD",
        f"Imported {len(rows)} items from {file.filename}",
        {"rows": len(rows), "skipped": len(warnings)},
    )
    return UploadResult(
        rows_imported=len(rows),
        rows_skipped=len(warnings),
        warnings=warnings[:20],
        preview=[
            {
                "medicine_name": r["medicine_name"],
                "current_stock": r["current_stock"],
                "avg_daily_sales": r["avg_daily_sales"],
                "category": r["category"],
                "expiry_date": r["expiry_date"].isoformat() if r["expiry_date"] else None,
            }
            for r in rows[:25]
        ],
    )


@router.get("", response_model=list[InventoryItemOut])
def list_inventory(user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(InventoryItem).order_by(InventoryItem.medicine_name).all()


@router.delete("")
def clear_inventory(user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    n = db.query(InventoryItem).delete()
    db.commit()
    log_action(db, user, "INVENTORY_CLEAR", f"Cleared {n} items")
    return {"deleted": n}
