"""Excel/CSV parsing and validation for inventory and supplier uploads."""
from __future__ import annotations

import io
from datetime import date, datetime
from typing import Any

import pandas as pd


def _norm(col: str) -> str:
    return str(col).strip().lower().replace(" ", "_")


def _read(file_bytes: bytes, filename: str) -> pd.DataFrame:
    if filename.lower().endswith(".csv"):
        df = pd.read_csv(io.BytesIO(file_bytes))
    else:
        df = pd.read_excel(io.BytesIO(file_bytes), engine="openpyxl")
    df.columns = [_norm(c) for c in df.columns]
    return df


def _to_date(value: Any) -> date | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, (datetime, pd.Timestamp)):
        return value.date()
    if isinstance(value, date):
        return value
    try:
        return pd.to_datetime(value).date()
    except Exception:
        return None


# Map of accepted header aliases -> canonical field
INVENTORY_ALIASES = {
    "medicine_name": "medicine_name",
    "medicine": "medicine_name",
    "name": "medicine_name",
    "current_stock": "current_stock",
    "stock": "current_stock",
    "quantity": "current_stock",
    "average_daily_sales": "avg_daily_sales",
    "avg_daily_sales": "avg_daily_sales",
    "daily_sales": "avg_daily_sales",
    "category": "category",
    "expiry_date": "expiry_date",
    "expiry": "expiry_date",
    "unit_cost": "unit_cost",
}

SUPPLIER_ALIASES = {
    "medicine_name": "medicine_name",
    "medicine": "medicine_name",
    "supplier_name": "supplier_name",
    "supplier": "supplier_name",
    "unit_price": "unit_price",
    "price": "unit_price",
    "lead_time": "lead_time_days",
    "lead_time_days": "lead_time_days",
    "available_quantity": "available_quantity",
    "available": "available_quantity",
    "quantity": "available_quantity",
}


def _apply_aliases(df: pd.DataFrame, aliases: dict[str, str]) -> pd.DataFrame:
    rename = {c: aliases[c] for c in df.columns if c in aliases}
    return df.rename(columns=rename)


def parse_inventory(file_bytes: bytes, filename: str) -> tuple[list[dict], list[str]]:
    df = _apply_aliases(_read(file_bytes, filename), INVENTORY_ALIASES)
    warnings: list[str] = []
    required = ["medicine_name", "current_stock", "avg_daily_sales"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(
            f"Missing required columns: {', '.join(missing)}. "
            "Expected: Medicine Name, Current Stock, Average Daily Sales, "
            "Category, Expiry Date."
        )

    rows: list[dict] = []
    for idx, r in df.iterrows():
        name = str(r.get("medicine_name", "")).strip()
        if not name or name.lower() == "nan":
            warnings.append(f"Row {idx + 2}: skipped (missing medicine name).")
            continue
        try:
            stock = float(r.get("current_stock") or 0)
            sales = float(r.get("avg_daily_sales") or 0)
        except (TypeError, ValueError):
            warnings.append(f"Row {idx + 2}: skipped (non-numeric stock/sales).")
            continue
        rows.append(
            {
                "medicine_name": name,
                "current_stock": stock,
                "avg_daily_sales": sales,
                "category": (str(r.get("category")).strip()
                             if r.get("category") is not None
                             and str(r.get("category")).lower() != "nan"
                             else "Uncategorized"),
                "expiry_date": _to_date(r.get("expiry_date")),
                "unit_cost": (float(r["unit_cost"])
                              if "unit_cost" in df.columns and pd.notna(r.get("unit_cost"))
                              else None),
            }
        )
    return rows, warnings


def parse_suppliers(file_bytes: bytes, filename: str) -> tuple[list[dict], list[str]]:
    df = _apply_aliases(_read(file_bytes, filename), SUPPLIER_ALIASES)
    warnings: list[str] = []
    required = ["medicine_name", "supplier_name", "unit_price"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(
            f"Missing required columns: {', '.join(missing)}. "
            "Expected: Medicine Name, Supplier Name, Unit Price, Lead Time, "
            "Available Quantity."
        )

    rows: list[dict] = []
    for idx, r in df.iterrows():
        name = str(r.get("medicine_name", "")).strip()
        supplier = str(r.get("supplier_name", "")).strip()
        if not name or not supplier or name.lower() == "nan":
            warnings.append(f"Row {idx + 2}: skipped (missing medicine/supplier).")
            continue
        try:
            price = float(r.get("unit_price") or 0)
        except (TypeError, ValueError):
            warnings.append(f"Row {idx + 2}: skipped (invalid price).")
            continue
        rows.append(
            {
                "medicine_name": name,
                "supplier_name": supplier,
                "unit_price": price,
                "lead_time_days": int(float(r.get("lead_time_days") or 3)),
                "available_quantity": int(float(r.get("available_quantity") or 0)),
            }
        )
    return rows, warnings
