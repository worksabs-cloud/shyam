from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    SUPPLIER = "supplier"
    PHARMACY = "pharmacy"
    CUSTOMER = "customer"
    DELIVERY_AGENT = "delivery_agent"


class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    SUSPENDED = "suspended"


class User(Base):
    __tablename__ = "users_v2"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    role = Column(Enum(UserRole), nullable=False, default=UserRole.CUSTOMER)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING)
    is_verified = Column(Boolean, default=False)
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(255), nullable=True)
    profile_image = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    customer_profile = relationship("Customer", back_populates="user", uselist=False)
    pharmacy_profile = relationship("Pharmacy", back_populates="user", uselist=False, foreign_keys="Pharmacy.user_id")
    supplier_profile = relationship("Supplier", back_populates="user", uselist=False)
    delivery_agent_profile = relationship("DeliveryAgent", back_populates="user", uselist=False)
    audit_logs_v2 = relationship("AuditLog", back_populates="user")


class Permission(Base):
    __tablename__ = "permissions_v2"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True)
    description = Column(Text)
    resource = Column(String(100))
    action = Column(String(50))


class RolePermission(Base):
    __tablename__ = "role_permissions_v2"

    id = Column(Integer, primary_key=True)
    role = Column(Enum(UserRole))
    permission_id = Column(Integer, ForeignKey("permissions_v2.id"))
    permission = relationship("Permission")


class AuditLog(Base):
    __tablename__ = "audit_logs_v2"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users_v2.id"))
    action = Column(String(255))
    resource = Column(String(100))
    resource_id = Column(Integer, nullable=True)
    old_values = Column(Text, nullable=True)
    new_values = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="audit_logs_v2")
