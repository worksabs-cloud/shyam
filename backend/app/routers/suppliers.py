"""Supplier catalog upload and listing endpoints."""
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Supplier, SupplierCatalog
from ..schemas import SupplierCatalogOut, UploadResult
from ..services import excel
from ..services.audit import log_action

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


def _ensure_supplier(db: Session, name: str) -> Supplier:
    sup = db.query(Supplier).filter(Supplier.name == name).first()
    if not sup:
        sup = Supplier(name=name)
        db.add(sup)
        db.flush()
    return sup


@router.post("/upload", response_model=UploadResult)
async def upload_suppliers(
    file: UploadFile = File(...),
    replace: bool = True,
    user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = await file.read()
    try:
        rows, warnings = excel.parse_suppliers(content, file.filename or "upload.xlsx")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if replace:
        db.query(SupplierCatalog).delete()

    for r in rows:
        sup = _ensure_supplier(db, r["supplier_name"])
        db.add(SupplierCatalog(supplier_id=sup.id, **r))
    db.commit()

    log_action(
        db, user, "SUPPLIER_UPLOAD",
        f"Imported {len(rows)} catalog rows from {file.filename}",
        {"rows": len(rows), "skipped": len(warnings)},
    )
    return UploadResult(
        rows_imported=len(rows),
        rows_skipped=len(warnings),
        warnings=warnings[:20],
        preview=[
            {
                "medicine_name": r["medicine_name"],
                "supplier_name": r["supplier_name"],
                "unit_price": r["unit_price"],
                "lead_time_days": r["lead_time_days"],
                "available_quantity": r["available_quantity"],
            }
            for r in rows[:25]
        ],
    )


@router.get("", response_model=list[SupplierCatalogOut])
def list_catalog(user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(SupplierCatalog).order_by(SupplierCatalog.medicine_name).all()
