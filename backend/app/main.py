"""Nahid Pharmacy Distribution Platform — FastAPI application entrypoint."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routers import (
    v2_auth,
    v2_medicines,
    v2_orders,
    v2_analytics,
    v2_inventory,
    v2_users,
    v2_delivery,
    v2_ai,
    v2_pharmacies,
    v2_suppliers,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    try:
        from .seed import seed_admin
        seed_admin()
    except Exception as exc:
        print(f"[startup] admin seed skipped: {exc}")
    try:
        from .seed_v2 import seed_nahid_platform
        seed_nahid_platform()
    except Exception as exc:
        print(f"[startup] nahid platform seed skipped: {exc}")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Complete B2B & B2C Pharmaceutical Distribution Ecosystem",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.cors_origins == "*" else settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Nahid Pharmacy routers
app.include_router(v2_auth.router)
app.include_router(v2_medicines.router)
app.include_router(v2_orders.router)
app.include_router(v2_analytics.router)
app.include_router(v2_inventory.router)
app.include_router(v2_users.router)
app.include_router(v2_delivery.router)
app.include_router(v2_ai.router)
app.include_router(v2_pharmacies.router)
app.include_router(v2_suppliers.router)


@app.get("/")
def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "ok",
        "docs": "/api/docs"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/api/setup")
def setup_seed():
    """One-time setup endpoint to seed initial data."""
    try:
        from .seed_v2 import seed_nahid_platform
        seed_nahid_platform()
        return {
            "status": "success",
            "message": "Platform seeded successfully!",
            "credentials": {
                "admin": {"email": "nahid@admin.com", "password": "admin123"},
                "superadmin": {"email": "superadmin@nahid.com", "password": "super123"},
                "supplier": {"email": "supplier@nahid.com", "password": "supplier123"},
                "customer": {"email": "customer@nahid.com", "password": "customer123"},
                "pharmacy": {"email": "pharmacy@nahid.com", "password": "pharmacy123"},
                "delivery": {"email": "delivery@nahid.com", "password": "delivery123"},
            }
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
