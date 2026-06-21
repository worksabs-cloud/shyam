"""MedSupply AI — FastAPI application entrypoint."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routers import (
    analysis,
    audit,
    auth,
    dashboard,
    demo,
    inventory,
    purchase_orders,
    suppliers,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (MVP-friendly; use Alembic in production)
    Base.metadata.create_all(bind=engine)
    try:
        from .seed import seed_admin

        seed_admin()
    except Exception as exc:  # noqa: BLE001
        print(f"[startup] admin seed skipped: {exc}")
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="AI-powered pharmacy procurement: inventory → analysis → "
    "recommendations → purchase orders, in under 5 minutes.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.cors_origins == "*" else settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(inventory.router)
app.include_router(suppliers.router)
app.include_router(analysis.router)
app.include_router(purchase_orders.router)
app.include_router(dashboard.router)
app.include_router(audit.router)
app.include_router(demo.router)


@app.get("/")
def root():
    return {"service": settings.app_name, "status": "ok", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
