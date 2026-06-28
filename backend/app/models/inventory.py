from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text, Float, Numeric, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class BatchStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    NEAR_EXPIRY = "near_expiry"
    RECALLED = "recalled"


class InventoryBatch(Base):
    __tablename__ = "inventory_batches_v2"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines_v2.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers_v2.id"), nullable=True)
    batch_number = Column(String(100), nullable=False)
    manufacturing_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=False)
    quantity_received = Column(Integer, nullable=False)
    quantity_available = Column(Integer, nullable=False)
    purchase_price = Column(Numeric(10, 2), nullable=True)
    status = Column(Enum(BatchStatus), default=BatchStatus.ACTIVE)
    location = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    received_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    medicine = relationship("Medicine", back_populates="inventory_batches")
    supplier = relationship("Supplier")


class Inventory(Base):
    __tablename__ = "inventory_v2"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines_v2.id"), unique=True, nullable=False)
    total_quantity = Column(Integer, default=0)
    reorder_level = Column(Integer, default=10)
    max_stock_level = Column(Integer, default=1000)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    medicine = relationship("Medicine", back_populates="inventory")


class StockMovement(Base):
    __tablename__ = "stock_movements_v2"

    id = Column(Integer, primary_key=True)
    medicine_id = Column(Integer, ForeignKey("medicines_v2.id"))
    batch_id = Column(Integer, ForeignKey("inventory_batches_v2.id"), nullable=True)
    movement_type = Column(String(50))  # IN, OUT, ADJUSTMENT, TRANSFER
    quantity = Column(Integer)
    reference_type = Column(String(50), nullable=True)  # ORDER, PURCHASE, ADJUSTMENT
    reference_id = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users_v2.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    medicine = relationship("Medicine")
    batch = relationship("InventoryBatch")


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders_v2"

    id = Column(Integer, primary_key=True)
    po_number = Column(String(50), unique=True)
    supplier_id = Column(Integer, ForeignKey("suppliers_v2.id"), nullable=True)
    status = Column(String(50), default="pending")
    total_amount = Column(Numeric(10, 2), nullable=True)
    notes = Column(Text, nullable=True)
    ordered_by = Column(Integer, ForeignKey("users_v2.id"), nullable=True)
    approved_by = Column(Integer, ForeignKey("users_v2.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    supplier = relationship("Supplier")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order")


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items_v2"

    id = Column(Integer, primary_key=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders_v2.id"))
    medicine_id = Column(Integer, ForeignKey("medicines_v2.id"))
    quantity = Column(Integer)
    unit_price = Column(Numeric(10, 2), nullable=True)
    total_price = Column(Numeric(10, 2), nullable=True)

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    medicine = relationship("Medicine")
