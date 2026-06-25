from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Pharmacy(Base):
    __tablename__ = "pharmacies_v2"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_v2.id"), unique=True)
    business_name = Column(String(255), nullable=False)
    license_number = Column(String(100), unique=True, nullable=True)
    gstin = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    contact_person = Column(String(100), nullable=True)
    credit_limit = Column(Numeric(10, 2), default=0)
    outstanding_amount = Column(Numeric(10, 2), default=0)
    is_approved = Column(Boolean, default=False)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = Column(Integer, ForeignKey("users_v2.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="pharmacy_profile", foreign_keys=[user_id])
    orders = relationship("Order", back_populates="pharmacy")


class Customer(Base):
    __tablename__ = "customers_v2"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_v2.id"), unique=True)
    date_of_birth = Column(String(20), nullable=True)
    gender = Column(String(20), nullable=True)
    addresses = Column(Text, nullable=True)  # JSON
    favourite_medicines = Column(Text, nullable=True)  # JSON array of medicine IDs
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="customer_profile")
    orders = relationship("Order", back_populates="customer")


class Supplier(Base):
    __tablename__ = "suppliers_v2"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_v2.id"), unique=True, nullable=True)
    company_name = Column(String(255), nullable=False)
    license_number = Column(String(100), nullable=True)
    gstin = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    contact_person = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    bank_details = Column(Text, nullable=True)  # JSON
    is_approved = Column(Boolean, default=False)
    rating = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="supplier_profile")
    medicines = relationship("Medicine", back_populates="supplier")
