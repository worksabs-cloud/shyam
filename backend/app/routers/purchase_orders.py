"""Purchase order generation, retrieval, and PDF download."""
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import PurchaseOrder, PurchaseOrderItem, SupplierCatalog
from ..schemas import POGenerateRequest, PurchaseOrderOut
from ..services.audit import log_action
from ..services.pdf import build_po_pdf

router = APIRouter(prefix="/purchase-orders", tags=["purchase-orders"])


def _next_po_number(db: Session) -> str:
    count = db.query(PurchaseOrder).count() + 1
    return f"PO-{date.today():%Y%m}-{count:04d}"


@router.post("/generate", response_model=PurchaseOrderOut)
def generate_po(
    payload: POGenerateRequest,
    user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="No items provided.")

    # Determine lead time from catalog to estimate delivery date
    lead = 3
    catalog = (
        db.query(SupplierCatalog)
        .filter(SupplierCatalog.supplier_name == payload.supplier_name)
        .all()
    )
    if catalog:
        lead = max(c.lead_time_days for c in catalog)

    po = PurchaseOrder(
        po_number=_next_po_number(db),
        supplier_name=payload.supplier_name,
        status="ISSUED",
        created_by=user,
        notes=payload.notes,
        expected_delivery=date.today() + timedelta(days=lead),
    )
    total = 0.0
    for it in payload.items:
        line = round(it.quantity * it.unit_price, 2)
        total += line
        po.items.append(
            PurchaseOrderItem(
                medicine_name=it.medicine_name,
                quantity=it.quantity,
                unit_price=it.unit_price,
                line_total=line,
            )
        )
    po.total_cost = round(total, 2)
    db.add(po)
    db.commit()
    db.refresh(po)

    log_action(
        db, user, "PO_GENERATED",
        f"{po.po_number} → {po.supplier_name} (${po.total_cost:,.2f})",
        {"po_id": po.id, "items": len(po.items)},
    )
    return po


@router.get("", response_model=list[PurchaseOrderOut])
def list_pos(user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(PurchaseOrder).order_by(PurchaseOrder.created_at.desc()).all()


@router.get("/{po_id}", response_model=PurchaseOrderOut)
def get_po(po_id: int, user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    po = db.query(PurchaseOrder).get(po_id)
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found.")
    return po


@router.get("/{po_id}/pdf")
def download_pdf(po_id: int, user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    po = db.query(PurchaseOrder).get(po_id)
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found.")
    pdf = build_po_pdf(po)
    log_action(db, user, "PO_PDF_DOWNLOAD", f"{po.po_number} PDF downloaded")
    return StreamingResponse(
        iter([pdf]),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{po.po_number}.pdf"'},
    )
