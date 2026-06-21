# 🚀 Deploying MedSupply AI online (public link)

This app has three parts that all need hosting: a **database**, a **backend**
(API), and a **frontend** (website). The blueprint in `render.yaml` provisions
all three on [Render](https://render.com) in one go.

> **Prerequisite (unavoidable):** every hosting service deploys from a Git repo.
> So the code must be on **GitHub** first. See the main README for pushing.

---

## Option A — Render (full stack, recommended)

1. Create a free account at **https://render.com** and connect your GitHub.
2. Push this repository to GitHub (`worksabs-cloud/shyam`).
3. In Render: **New + → Blueprint**.
4. Select the `shyam` repository → Render reads `render.yaml` → **Apply**.
5. Render creates the database, backend, and frontend automatically.
6. After the first build, open the **backend** service, copy its URL
   (e.g. `https://medsupply-backend.onrender.com`), then on the **frontend**
   service set `NEXT_PUBLIC_API_BASE` to that URL and click **Manual Deploy →
   Deploy latest commit** (this rebuilds the site against the live API).
7. Open the **frontend** URL → log in with `admin / admin123` → **Load Demo Data**.

> Free Render services sleep when idle and take ~30–60s to wake on first hit.
> That's fine for a demo; upgrade the plan for an always-on experience.

---

## Option B — Split hosting (Vercel + Render)

- **Frontend → Vercel:** import the repo, set root directory to `frontend`,
  add env var `NEXT_PUBLIC_API_BASE` = your backend URL. Deploy.
- **Backend + DB → Render:** use the `medsupply-backend` + `medsupply-db`
  parts of `render.yaml`, or create them manually.

---

## Environment variables reference

| Service | Variable | Purpose |
| --- | --- | --- |
| backend | `DATABASE_URL` | Postgres connection (auto-wired from the DB) |
| backend | `JWT_SECRET` | Token signing secret (auto-generated) |
| backend | `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Login (default `admin` / `admin123`) |
| backend | `OPENAI_API_KEY` | Optional — enables GPT-4.1 enrichment |
| backend | `CORS_ORIGINS` | `*` or your frontend domain |
| frontend | `NEXT_PUBLIC_API_BASE` | Public URL of the backend API |

---

## Notes

- The backend auto-creates its tables and seeds the admin user on startup.
- The deterministic AI engine works with **no** `OPENAI_API_KEY`, so the demo
  is fully functional out of the box.
- `database.py` normalizes `postgres://` → `postgresql://` for managed hosts.
