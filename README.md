# Nahid Pharmacy Distribution Platform

A full-stack, production-ready SaaS platform for pharmacy distribution management with multi-role access, B2B/B2C order flows, AI-powered insights, and real-time analytics.

---

## Roles and Demo Credentials

| Role | Email | Password | Portal |
|------|-------|----------|--------|
| Admin | nahid@admin.com | admin123 | /nahid/admin |
| Super Admin | superadmin@nahid.com | super123 | /nahid/admin |
| Supplier | supplier@nahid.com | supplier123 | /nahid/supplier |
| Pharmacy | pharmacy@nahid.com | pharmacy123 | /nahid/pharmacy |
| Customer | customer@nahid.com | customer123 | /nahid/customer |
| Delivery Agent | delivery@nahid.com | delivery123 | /nahid/delivery |

---

## Quick Start (Docker Compose)

```bash
# Clone and start
git clone <repo-url>
cd shyam

# Copy env file and configure secrets (optional for local dev)
cp backend/.env.example .env

# Start all services
docker compose up --build

# Access the platform
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/docs
# Landing:   http://localhost:3000/nahid
```

The database is seeded automatically on first startup with demo users and 15 sample medicines.

---

## Tech Stack

**Backend**
- FastAPI + SQLAlchemy (async-ready)
- PostgreSQL 16 with `_v2` table suffix for clean coexistence with legacy schema
- Redis 7 for caching
- JWT (access + refresh tokens) via `python-jose`
- OpenAI GPT-4o-mini for AI features (graceful fallback without API key)
- Stripe for payments (optional)

**Frontend**
- Next.js 15 App Router + TypeScript
- Tailwind CSS with slate/emerald dark theme
- Recharts for analytics dashboards
- Role-aware `NahidShell` layout with per-role sidebar navigation

**Infrastructure**
- Docker Compose (dev) + Docker Compose Prod (with Nginx)
- Kubernetes manifests in `/k8s/`

---

## Project Structure

```
shyam/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy models (_v2 tables)
│   │   ├── routers/         # FastAPI routers (v2_* prefix)
│   │   ├── schemas/         # Pydantic v2 schemas
│   │   ├── services/        # Business logic layer
│   │   └── utils/           # Security, helpers
│   ├── migrations/
│   │   └── init_schema.sql  # Full PostgreSQL schema
│   ├── tests/               # pytest test suite
│   ├── seed_v2.py           # Demo data seeder
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   └── nahid/           # All platform pages
│   │       ├── admin/       # Admin portal
│   │       ├── customer/    # Customer portal
│   │       ├── pharmacy/    # Pharmacy (B2B) portal
│   │       ├── supplier/    # Supplier portal
│   │       ├── delivery/    # Delivery agent portal
│   │       ├── login/
│   │       └── register/
│   ├── components/
│   │   └── nahid-shell.tsx  # Role-aware layout shell
│   └── lib/
│       └── nahid-api.ts     # Typed API client
├── k8s/                     # Kubernetes manifests
├── docker-compose.yml       # Development
└── docker-compose.prod.yml  # Production
```

---

## API Reference

All new endpoints are under `/api/v2/`. Legacy endpoints remain at `/api/`.

| Group | Prefix | Description |
|-------|--------|-------------|
| Auth | `/api/v2/auth/` | Login, register, refresh, me |
| Medicines | `/api/v2/medicines/` | CRUD, search, approve |
| Orders | `/api/v2/orders/` | B2B/B2C order management |
| Inventory | `/api/v2/inventory/` | Batches, stock levels, alerts |
| Analytics | `/api/v2/analytics/` | Dashboard stats, trends |
| AI | `/api/v2/ai/` | Smart search, forecast, expiry risk |
| Users | `/api/v2/users/` | User management |
| Pharmacies | `/api/v2/pharmacies/` | Pharmacy profiles |
| Suppliers | `/api/v2/suppliers/` | Supplier profiles |
| Delivery | `/api/v2/delivery/` | Agent assignments |

Interactive API docs: `http://localhost:8000/docs`

---

## Environment Variables

See `backend/.env.example` for the full list. Required for production:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` / `SECRET_KEY` — 256-bit random strings
- `ADMIN_PASSWORD` — Initial admin password

Optional:
- `OPENAI_API_KEY` — Enables AI smart search, demand forecasting, expiry risk
- `STRIPE_SECRET_KEY` — Enables online payments

---

## Kubernetes Deployment

```bash
# Apply namespace first
kubectl apply -f k8s/namespace.yaml

# Create secrets
kubectl create secret generic nahid-secrets \
  --namespace=nahid-pharmacy \
  --from-literal=db-user=nahid \
  --from-literal=db-password=<strong-password> \
  --from-literal=database-url=postgresql://nahid:<password>@postgres:5432/nahidpharmacy \
  --from-literal=jwt-secret=<random-256bit> \
  --from-literal=secret-key=<random-256bit>

# Deploy all services
kubectl apply -f k8s/
```

---

## Running Tests

```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v
```

---

## Original MedSupply AI Platform

The original MedSupply AI platform (legacy routes at `/api/`) continues to work alongside the new platform. No existing functionality was removed.
