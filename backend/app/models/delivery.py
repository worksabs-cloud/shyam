from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class DeliveryStatus(str, enum.Enum):
    ASSIGNED = "assigned"
    PICKED_UP = "picked_up"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    FAILED = "failed"
    RETURNED = "returned"


class DeliveryAgent(Base):
    __tablename__ = "delivery_agents_v2"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_v2.id"), unique=True)
    vehicle_type = Column(String(50), nullable=True)
    vehicle_number = Column(String(50), nullable=True)
    license_number = Column(String(100), nullable=True)
    is_available = Column(Boolean, default=True)
    current_location = Column(String(255), nullable=True)
    rating = Column(Float, default=0.0)
    total_deliveries = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="delivery_agent_profile")
    deliveries = relationship("Order", back_populates="delivery_agent")
    delivery_logs = relationship("DeliveryLog", back_populates="agent")


class DeliveryLog(Base):
    __tablename__ = "delivery_logs_v2"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders_v2.id"))
    agent_id = Column(Integer, ForeignKey("delivery_agents_v2.id"), nullable=True)
    status = Column(Enum(DeliveryStatus))
    location = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    proof_of_delivery = Column(String(500), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    agent = relationship("DeliveryAgent", back_populates="delivery_logs")
