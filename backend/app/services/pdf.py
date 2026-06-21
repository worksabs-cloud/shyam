"""Professional purchase-order PDF generation using ReportLab."""
from __future__ import annotations

import io

from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

BRAND = colors.HexColor("#0EA5A4")  # teal
DARK = colors.HexColor("#0F172A")
LIGHT = colors.HexColor("#F1F5F9")


def build_po_pdf(po) -> bytes:
    """Render a PurchaseOrder ORM object to a styled PDF (bytes)."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        title=f"Purchase Order {po.po_number}",
    )
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=styles["Title"], textColor=DARK, fontSize=22)
    brand = ParagraphStyle(
        "brand", parent=styles["Normal"], textColor=BRAND, fontSize=14, leading=16
    )
    small = ParagraphStyle("small", parent=styles["Normal"], fontSize=9, textColor=colors.grey)
    label = ParagraphStyle("label", parent=styles["Normal"], fontSize=9, textColor=colors.grey)
    val = ParagraphStyle("val", parent=styles["Normal"], fontSize=11, textColor=DARK)
    right = ParagraphStyle("right", parent=styles["Normal"], alignment=TA_RIGHT, fontSize=10)

    story = []

    # Header
    header = Table(
        [[
            Paragraph("⬢ MedSupply <b>AI</b>", brand),
            Paragraph("PURCHASE ORDER", h1),
        ]],
        colWidths=[90 * mm, 80 * mm],
    )
    header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
    ]))
    story.append(header)
    story.append(Paragraph("AI-Powered Pharmacy Procurement Platform", small))
    story.append(Spacer(1, 8 * mm))

    # Meta block
    meta = Table(
        [
            [Paragraph("PO Number", label), Paragraph(po.po_number, val),
             Paragraph("Status", label), Paragraph(po.status, val)],
            [Paragraph("Supplier", label), Paragraph(po.supplier_name, val),
             Paragraph("Order Date", label),
             Paragraph(po.created_at.strftime("%Y-%m-%d") if po.created_at else "-", val)],
            [Paragraph("Created By", label), Paragraph(po.created_by, val),
             Paragraph("Expected Delivery", label),
             Paragraph(po.expected_delivery.strftime("%Y-%m-%d") if po.expected_delivery else "-", val)],
        ],
        colWidths=[28 * mm, 57 * mm, 35 * mm, 50 * mm],
    )
    meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#E2E8F0")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(meta)
    story.append(Spacer(1, 8 * mm))

    # Line items
    data = [["#", "Medicine", "Quantity", "Unit Price", "Line Total"]]
    for i, item in enumerate(po.items, start=1):
        data.append([
            str(i),
            item.medicine_name,
            f"{item.quantity:,}",
            f"${item.unit_price:,.2f}",
            f"${item.line_total:,.2f}",
        ])
    data.append(["", "", "", "TOTAL", f"${po.total_cost:,.2f}"])

    table = Table(data, colWidths=[12 * mm, 70 * mm, 28 * mm, 30 * mm, 30 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, LIGHT]),
        ("LINEBELOW", (0, 0), (-1, -2), 0.25, colors.HexColor("#E2E8F0")),
        ("BACKGROUND", (0, -1), (-1, -1), DARK),
        ("TEXTCOLOR", (0, -1), (-1, -1), colors.white),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(table)
    story.append(Spacer(1, 8 * mm))

    if po.notes:
        story.append(Paragraph("<b>Notes</b>", val))
        story.append(Paragraph(po.notes, styles["Normal"]))
        story.append(Spacer(1, 6 * mm))

    story.append(Spacer(1, 10 * mm))
    story.append(Paragraph(
        "This purchase order was generated automatically by MedSupply AI. "
        "Quantities and supplier selection were optimized using demand "
        "forecasting and cost-minimization algorithms.",
        small,
    ))

    doc.build(story)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf
