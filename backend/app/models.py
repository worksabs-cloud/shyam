"""SQLAlchemy ORM models — the complete PostgreSQL schema.

Tables: users, inventory, suppliers, supplier_catalog, purchase_orders,
purchase_order_items, analysis_runs, audit_logs.
"""
from datetime import datetime

from sqlalchemy import (
    JSON,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    Index,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(120), unique=True, nullable=False, index=True)
    full_name = Column(String(200), default="Administrator")
    role = Column(String(50), default="admin")
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    medicine_name = Column(String(200), nullable=False, index=True)
    current_stock = Column(Float, nullable=False, default=0)
    avg_daily_sales = Column(Float, nullable=False, default=0)
    category = Column(String(120), index=True)
    expiry_date = Column(Date, nullable=True)
    unit_cost = Column(Float, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (Index("ix_inventory_name_category", "medicine_name", "category"),)


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False, index=True)
    rating = Column(Float, default=4.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    catalog = relationship("SupplierCatalog", back_populates="supplier")


class SupplierCatalog(Base):
    __tablename__ = "supplier_catalog"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), index=True)
    supplier_name = Column(String(200), nullable=False, index=True)
    medicine_name = Column(String(200), nullable=False, index=True)
    unit_price = Column(Float, nullable=False)
    lead_time_days = Column(Integer, nullable=False, default=3)
    available_quantity = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    supplier = relationship("Supplier", back_populates="catalog")

    __table_args__ = (
        Index("ix_catalog_med_supplier", "medicine_name", "supplier_name"),
    )


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    triggered_by = Column(String(120), default="admin")
    model_used = Column(String(80), default="rule-engine")
    ai_enhanced = Column(Integer, default=0)  # 0/1 boolean
    items_analyzed = Column(Integer, default=0)
    estimated_reorder_cost = Column(Float, default=0)
    result = Column(JSON)  # full structured AI JSON output


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(40), unique=True, index=True)
    supplier_name = Column(String(200), nullable=False)
    status = Column(String(40), default="DRAFT")
    total_cost = Column(Float, default=0)
    expected_delivery = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_by = Column(String(120), default="admin")
    notes = Column(Text, default="")

    items = relationship(
        "PurchaseOrderItem", back_populates="order", cascade="all, delete-orphan"
    )


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id = Column(Integer, primary_key=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), index=True)
    medicine_name = Column(String(200), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    line_total = Column(Float, nullable=False)

    order = relationship("PurchaseOrder", back_populates="items")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    user = Column(String(120), default="admin")
    action = Column(String(120), nullable=False)
    result = Column(String(400), default="")
    meta = Column(JSON, nullable=True)
