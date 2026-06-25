from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text, Numeric, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class PaymentMethod(str, enum.Enum):
    STRIPE = "stripe"
    PAYPAL = "paypal"
    CASH_ON_DELIVERY = "cod"
    CREDIT = "credit"
    BANK_TRANSFER = "bank_transfer"


class Payment(Base):
    __tablename__ = "payments_v2"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders_v2.id"), unique=True)
    payment_method = Column(Enum(PaymentMethod), nullable=True)
    amount = Column(Numeric(10, 2), nullable=True)
    currency = Column(String(10), default="USD")
    transaction_id = Column(String(255), nullable=True)
    gateway_response = Column(Text, nullable=True)
    status = Column(String(50))
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="payment")


class Invoice(Base):
    __tablename__ = "invoices_v2"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders_v2.id"), unique=True)
    invoice_number = Column(String(50), unique=True)
    issue_date = Column(DateTime(timezone=True), server_default=func.now())
    due_date = Column(DateTime(timezone=True), nullable=True)
    subtotal = Column(Numeric(10, 2), nullable=True)
    tax_amount = Column(Numeric(10, 2), nullable=True)
    total_amount = Column(Numeric(10, 2), nullable=True)
    pdf_url = Column(String(500), nullable=True)
    is_paid = Column(Boolean, default=False)

    order = relationship("Order", back_populates="invoice")


class DemandForecast(Base):
    __tablename__ = "demand_forecasts_v2"

    id = Column(Integer, primary_key=True)
    medicine_id = Column(Integer, ForeignKey("medicines_v2.id"))
    forecast_date = Column(DateTime(timezone=True), server_default=func.now())
    predicted_demand = Column(Integer, nullable=True)
    confidence_score = Column(Float, nullable=True)
    forecast_period = Column(String(50), nullable=True)
    recommendations = Column(Text, nullable=True)

    medicine = relationship("Medicine", back_populates="forecasts")
