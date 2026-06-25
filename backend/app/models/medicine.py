from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text, Float, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class MedicineCategory(str, enum.Enum):
    TABLET = "tablet"
    CAPSULE = "capsule"
    SYRUP = "syrup"
    INJECTION = "injection"
    CREAM = "cream"
    DROPS = "drops"
    INHALER = "inhaler"
    POWDER = "powder"
    OTHER = "other"


class StorageCondition(str, enum.Enum):
    ROOM_TEMPERATURE = "room_temperature"
    REFRIGERATED = "refrigerated"
    FROZEN = "frozen"
    COOL_DRY = "cool_dry"


class Medicine(Base):
    __tablename__ = "medicines_v2"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(255), nullable=False, index=True)
    generic_name = Column(String(255), index=True, nullable=True)
    brand_name = Column(String(255), nullable=True)
    sku = Column(String(100), unique=True, index=True)
    manufacturer = Column(String(255), nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers_v2.id"), nullable=True)
    category = Column(Enum(MedicineCategory), nullable=True)
    dosage = Column(String(100), nullable=True)
    pack_size = Column(String(100), nullable=True)
    storage_condition = Column(Enum(StorageCondition), default=StorageCondition.ROOM_TEMPERATURE)
    purchase_price = Column(Numeric(10, 2), nullable=True)
    wholesale_price = Column(Numeric(10, 2), nullable=True)
    retail_price = Column(Numeric(10, 2), nullable=True)
    gst_percentage = Column(Float, default=0.0)
    prescription_required = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False)
    barcode = Column(String(100), nullable=True)
    qr_code = Column(String(500), nullable=True)
    images = Column(Text, nullable=True)  # JSON array of image URLs
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    supplier = relationship("Supplier", back_populates="medicines")
    inventory_batches = relationship("InventoryBatch", back_populates="medicine")
    order_items = relationship("OrderItem", back_populates="medicine")
    forecasts = relationship("DemandForecast", back_populates="medicine")
    inventory = relationship("Inventory", back_populates="medicine", uselist=False)
