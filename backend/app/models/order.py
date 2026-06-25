from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text, Float, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class OrderType(str, enum.Enum):
    B2B = "b2b"
    B2C = "b2c"


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    PACKED = "packed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIAL = "partial"


class Order(Base):
    __tablename__ = "orders_v2"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True)
    order_type = Column(Enum(OrderType), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers_v2.id"), nullable=True)
    pharmacy_id = Column(Integer, ForeignKey("pharmacies_v2.id"), nullable=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    subtotal = Column(Numeric(10, 2), nullable=True)
    tax_amount = Column(Numeric(10, 2), nullable=True)
    discount_amount = Column(Numeric(10, 2), default=0)
    delivery_charge = Column(Numeric(10, 2), default=0)
    total_amount = Column(Numeric(10, 2), nullable=True)
    delivery_address = Column(Text, nullable=True)
    delivery_agent_id = Column(Integer, ForeignKey("delivery_agents_v2.id"), nullable=True)
    notes = Column(Text, nullable=True)
    prescription_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("Customer", back_populates="orders")
    pharmacy = relationship("Pharmacy", back_populates="orders")
    delivery_agent = relationship("DeliveryAgent", back_populates="deliveries")
    items = relationship("OrderItem", back_populates="order")
    payment = relationship("Payment", back_populates="order", uselist=False)
    invoice = relationship("Invoice", back_populates="order", uselist=False)


class OrderItem(Base):
    __tablename__ = "order_items_v2"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders_v2.id"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines_v2.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("inventory_batches_v2.id"), nullable=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=True)
    discount = Column(Numeric(10, 2), default=0)
    total_price = Column(Numeric(10, 2), nullable=True)

    order = relationship("Order", back_populates="items")
    medicine = relationship("Medicine", back_populates="order_items")
    batch = relationship("InventoryBatch")
