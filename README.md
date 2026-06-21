# ⬢ MedSupply AI — AI Pharmacy Procurement Platform

> **Reduce pharmacy procurement from hours to under 5 minutes** with AI-powered
> inventory intelligence: stockout prediction, dead-stock & expiry detection,
> supplier optimization, and one-click purchase-order automation.

A production-quality, demo-ready MVP that walks judges through the full workflow:

```
Inventory Upload  →  AI Analysis  →  Smart Recommendations  →  Automated Purchase Order
```

---

## ✨ Highlights for Judges

| Module | What it does |
| --- | --- |
| 🧠 **AI Procurement Engine** | Days-of-cover, demand forecasting (7/14/30d), reorder optimization, cheapest-supplier selection, substitute suggestions, and an executive summary. |
| 📉 **Stockout Prediction** | `Days Left = Current Stock ÷ Avg Daily Sales` → Critical / High / Medium / Low, with plain-English explanations. |
| 💀 **Dead Stock Detection** *(wow feature)* | Flags zero-movement / severe-overstock SKUs and recommends promotions or transfers. |
| ⏳ **Expiry Risk Engine** | Critical `<30d` · Warning `30–90d` · Safe `90d+`, with action guidance. |
| 🚚 **Supplier Comparison** | Ranks suppliers by blended price + lead-time score and quantifies savings. |
| 📄 **Purchase Order Generator** | One click → branded **PDF** via ReportLab, grouped by optimal supplier. |
| 📊 **Analytics Dashboard** | Health score, risk & expiry distributions, spend forecast — built with Recharts. |
| 🧾 **Audit Trail** | Every upload, analysis run, and PO generation is logged and timestamped. |

> 💡 **The AI engine works with or without an OpenAI key.** A deterministic
> rule engine always produces the full structured analysis, so the demo never
> breaks. Add an `OPENAI_API_KEY` to enrich the narrative with GPT-4.1.

---

## 🏗️ Architecture

```
┌────────────────────────┐        ┌──────────────────────────────┐        ┌──────────────┐
│  Next.js 15 Frontend   │  HTTP  │        FastAPI Backend        │  SQL   │  PostgreSQL  │
│  TS · Tailwind · React │ <────> │  Pandas · OpenPyXL · ReportLab │ <────> │   16-alpine  │
│  Query · Recharts      │        │  AI Engine (rules + OpenAI)    │        │              │
└────────────────────────┘        └──────────────────────────────┘        └──────────────┘
```

**Frontend** Next.js 15 (App Router), TypeScript, TailwindCSS, ShadCN-style UI,
React Query, Recharts.
**Backend** FastAPI, Python 3.12, Pandas, OpenPyXL, SQLAlchemy, ReportLab.
**AI** OpenAI GPT-4.1 (optional) layered over a deterministic procurement engine.

### Folder structure

```
shyam/
├── docker-compose.yml          # one-command full stack
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── sample_data/            # ready-to-upload CSV/XLSX samples
│   └── app/
│       ├── main.py             # FastAPI app + router wiring
│       ├── config.py           # env-driven settings
│       ├── database.py         # SQLAlchemy engine/session
│       ├── models.py           # 8-table PostgreSQL schema
│       ├── schemas.py          # Pydantic contracts
│       ├── auth.py             # JWT admin auth
│       ├── seed.py             # admin + demo data
│       ├── ai/
│       │   ├── engine.py       # orchestrates rules + OpenAI
│       │   └── prompts.py      # prompt-engineering strategy
│       ├── services/
│       │   ├── analytics.py    # core procurement intelligence
│       │   ├── excel.py        # upload parsing + validation
│       │   ├── pdf.py          # ReportLab PO generator
│       │   └── audit.py
│       └── routers/            # auth, inventory, suppliers, analysis,
│                               # purchase_orders, dashboard, audit, demo
└── frontend/
    ├── Dockerfile
    ├── app/                    # login, dashboard, inventory, suppliers,
    │                           # analysis, purchase-orders, audit
    ├── components/             # sidebar, app-shell, kpi-card, charts, ui/*
    └── lib/                    # api client, utils
```

---

## 🚀 Quick Start (Docker — recommended)

```bash
cp .env.example .env          # optional: add OPENAI_API_KEY for GPT-4.1
docker compose up --build
```

| Service | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| Backend API + Swagger docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

**Login:** `admin` / `admin123`

---

## 🧪 Local Development (without Docker)

### Backend
```bash
cd backend
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Point at a local Postgres (or use docker compose up db)
export DATABASE_URL=postgresql://pharma:pharma@localhost:5432/pharma_procurement
export OPENAI_API_KEY=                # optional

uvicorn app.main:app --reload --port 8000
# Seed demo data + admin:
python -m app.seed
```

### Frontend
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_BASE=http://localhost:8000" > .env.local
npm run dev      # http://localhost:3000
```

---

## 🎬 5-Minute Demo Script

1. **Login** with `admin / admin123`.
2. On the **Dashboard**, click **Load Demo Data** (20 medicines + 26 catalog rows
   engineered to showcase every risk category). *Or* upload the files in
   `backend/sample_data/` on the **Inventory** and **Supplier Catalog** pages.
3. Watch the **KPI cards** and **charts** populate — health score, stockout,
   dead stock, expiry, reorder cost.
4. Go to **AI Analysis** → click **Analyze Inventory**.
   - Read the **AI Executive Summary** + priority actions + risk callouts.
   - Review **Stockout Prediction**, **Dead Stock**, **Expiry Risk**,
     **Supplier Optimization**, and **Substitutes**.
5. In **AI Recommended Orders**, click a supplier button to **generate a PO** in
   one click.
6. Open **Purchase Orders** → **Download PDF** (branded, ReportLab).
7. Open **Audit Trail** to show every action was logged.

---

## 🔌 API Reference

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/login` | Admin login → JWT |
| `POST` | `/demo/load` | One-click demo data |
| `POST` | `/inventory/upload` | Upload inventory Excel/CSV |
| `GET`  | `/inventory` | List inventory |
| `POST` | `/suppliers/upload` | Upload supplier catalog |
| `GET`  | `/suppliers` | List catalog |
| `POST` | `/analysis/run` | Run AI procurement analysis |
| `GET`  | `/analysis/results` | Latest analysis result |
| `POST` | `/purchase-orders/generate` | Generate a PO |
| `GET`  | `/purchase-orders` | List POs |
| `GET`  | `/purchase-orders/{id}/pdf` | Download PO PDF |
| `GET`  | `/dashboard/metrics` | Dashboard KPIs + charts |
| `GET`  | `/audit-log` | Audit trail |

Full interactive docs at **`/docs`** (Swagger) and **`/redoc`**.

---

## 🗄️ Database Schema

8 tables with indexes & relationships (auto-created on startup):

`users` · `inventory` · `suppliers` · `supplier_catalog` ·
`purchase_orders` · `purchase_order_items` · `analysis_runs` · `audit_logs`

See `backend/app/models.py`. For production, generate Alembic migrations from
these models.

---

## 🧠 AI Analysis Logic

1. **Days Left** = `Current Stock ÷ Avg Daily Sales`
2. **Risk**: Critical `0–3d` · High `4–7d` · Medium `8–14d` · Low `15d+`
3. **Forecast**: 7-day / 14-day / 30-day demand
4. **Reorder Qty**: order-up-to (lead time + 21-day window + 7-day safety) − stock
5. **Cheapest Supplier**: blended 70% price + 30% lead-time score
6. **Substitutes**: in-stock, same-category, healthy-cover alternatives
7. **Rationale**: deterministic + optional GPT-4.1 executive narrative

### Structured AI output
```json
{
  "stockout_risk": [],
  "recommended_orders": [],
  "supplier_recommendations": [],
  "alternatives": [],
  "dead_stock": [],
  "expiry_risk": [],
  "executive_summary": "",
  "metrics": { "health_score": 0, "risk_distribution": {}, "...": {} }
}
```

---

## 🔐 Configuration

All via environment variables (see `.env.example`):
`DATABASE_URL`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`,
`OPENAI_API_KEY`, `OPENAI_MODEL`, `NEXT_PUBLIC_API_BASE`.

---

## 📦 Tech Stack

`Next.js 15` · `TypeScript` · `TailwindCSS` · `React Query` · `Recharts` ·
`FastAPI` · `Python 3.12` · `Pandas` · `OpenPyXL` · `SQLAlchemy` · `ReportLab` ·
`PostgreSQL` · `OpenAI GPT-4.1` · `Docker` / `Docker Compose`

---

Built for the hackathon — enterprise-grade UX, real working workflows, strong AI value.
