# GoalSync AI — Complete Production Deployment Guide

Deploy the **React frontend** (Vercel or Netlify), **Node.js API** (Render, Railway, or AWS), and **PostgreSQL** (Neon, Supabase, RDS, or self-hosted) with HTTPS, env vars, Docker, and CI/CD.

---

## Architecture overview

```
[Users] ──HTTPS──► [Vercel/Netlify CDN] ──► React SPA
                         │
                         └──HTTPS──► [Render/Railway/AWS] ──► Express API
                                              │
                                              └──TLS──► PostgreSQL (Neon/RDS)
```

| Component | Recommended | Alternatives |
|-----------|-------------|--------------|
| Frontend | **Vercel** | Netlify, Docker+Nginx |
| Backend | **Render** (Docker) | Railway, AWS ECS/EB |
| Database | **Neon PostgreSQL** | Supabase, RDS, Docker Postgres |

---

## Prerequisites

- Node.js 20+ (local builds)
- Git repository (GitHub/GitLab)
- Domain name (optional, e.g. `app.goalsync.com`, `api.goalsync.com`)
- PostgreSQL 15+ connection string with `?sslmode=require` for cloud DBs

---

## Part 1 — Database (PostgreSQL)

### Option A: Neon (recommended for hackathon/production MVP)

1. Create project at [neon.tech](https://neon.tech).
2. Copy **connection string** (pooled URL for serverless API).
3. Run schema once:

```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/migrations/002_escalation_engine.sql
psql "$DATABASE_URL" -f database/migrations/003_azure_oid.sql
```

Or from backend folder:

```bash
cd backend
DATABASE_URL="your-neon-url" npx prisma db push
DATABASE_URL="your-neon-url" npm run db:seed
```

### Option B: Docker (local / VPS)

```bash
docker compose up -d postgres
```

---

## Part 2 — Backend API

### Environment variables (production)

Set these on Render/Railway/AWS — **never commit real values**.

| Variable | Required | Example |
|----------|----------|---------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Yes | `5000` (Render sets automatically) |
| `DATABASE_URL` | Yes | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Yes | 64+ char random string |
| `JWT_REFRESH_SECRET` | Yes | Different 64+ char string |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` |
| `CORS_ORIGIN` | Yes | `https://app.yourdomain.com` |
| `APP_URL` | Yes | `https://app.yourdomain.com` |
| `AZURE_REDIRECT_URI` | If SSO | `https://api.yourdomain.com/api/auth/microsoft/callback` |
| `TEAMS_WEBHOOK_URL` | Optional | Teams incoming webhook |
| `RUN_PRISMA_PUSH` | Docker only | `true` on first deploy |

See `backend/.env.example` for full list.

### Option A: Render (Docker)

1. **New → Web Service** → connect Git repo.
2. **Root directory:** `backend`
3. **Runtime:** Docker (uses `backend/Dockerfile`)
4. Or use Blueprint: `backend/render.yaml`
5. Add environment variables from table above.
6. **Health check path:** `/api/health`
7. Deploy → note URL: `https://goalsync-api.onrender.com`

**HTTPS:** Provided automatically (`*.onrender.com` or custom domain).

**Custom domain:**

1. Render → Settings → Custom Domains → add `api.yourdomain.com`
2. DNS: CNAME `api` → `goalsync-api.onrender.com`
3. Update `CORS_ORIGIN`, `APP_URL`, `AZURE_REDIRECT_URI`

**Deploy hook (CI/CD):** Render → Settings → Deploy Hook → add URL to GitHub secret `RENDER_DEPLOY_HOOK`.

### Option B: Railway

1. New project → **Deploy from GitHub**
2. Set root to `backend` or use repo root with `railway.toml`
3. Add variables (same as above)
4. Railway assigns `https://*.up.railway.app` with HTTPS

`railway.toml` at repo root points to `backend/Dockerfile`.

### Option C: AWS (ECS Fargate sketch)

1. Push image: `docker build -t goalsync-api ./backend && docker push ECR_URI`
2. ECS task definition: port 5000, env from Secrets Manager
3. ALB + ACM certificate for HTTPS
4. RDS PostgreSQL in same VPC; security group allows 5432 from ECS only

### Option D: Docker on VPS

```bash
cp .env.production.example .env
# Edit secrets
docker compose -f docker-compose.prod.yml up -d --build
```

- Frontend: `http://SERVER_IP` (port 80)
- API proxied at `/api` via Nginx (`frontend/nginx.docker.conf`)
- Put **Caddy** or **Traefik** in front for free HTTPS (Let’s Encrypt)

---

## Part 3 — Frontend (React / Vite)

### Build

```bash
cd frontend
cp .env.example .env.production
# VITE_API_URL=https://api.yourdomain.com/api
npm ci
npm run build
# Output: frontend/dist/
```

### Environment variables

| Variable | Production value |
|----------|------------------|
| `VITE_API_URL` | `https://api.yourdomain.com/api` |

Firebase vars only if using client Firebase auth.

### Option A: Vercel

1. Import Git repo → **Root directory:** `frontend`
2. Framework preset: **Vite**
3. Build: `npm run build` · Output: `dist`
4. Environment: `VITE_API_URL` = your API URL
5. Deploy → `https://your-app.vercel.app`

`frontend/vercel.json` configures SPA rewrites and cache headers.

**Custom domain:**

1. Vercel → Domains → add `app.yourdomain.com`
2. DNS: CNAME to `cname.vercel-dns.com`
3. HTTPS auto-provisioned

### Option B: Netlify

1. Import repo → base `frontend`
2. Build `npm run build`, publish `dist`
3. `frontend/netlify.toml` handles redirects and headers
4. Env: `VITE_API_URL`

### Option C: Docker + Nginx

```bash
docker build -t goalsync-web ./frontend \
  --build-arg VITE_API_URL=https://api.yourdomain.com/api
docker run -p 80:80 goalsync-web
```

For same-origin API proxy, use `docker-compose.prod.yml` with `VITE_API_URL=/api`.

---

## Part 4 — HTTPS & domains (checklist)

| Step | Action |
|------|--------|
| 1 | API custom domain + TLS (Render/Railway/ACM) |
| 2 | App custom domain + TLS (Vercel/Netlify) |
| 3 | `CORS_ORIGIN=https://app.yourdomain.com` |
| 4 | `VITE_API_URL=https://api.yourdomain.com/api` |
| 5 | `APP_URL=https://app.yourdomain.com` |
| 6 | Entra redirect URI → `https://api.../api/auth/microsoft/callback` |
| 7 | Test `GET https://api.../api/health` |

---

## Part 5 — CI/CD (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

| Job | Runs |
|-----|------|
| `backend` | `npm ci`, Prisma validate, Docker build API |
| `frontend` | `npm run build`, Docker build Nginx image |
| `deploy-render` | POST to `RENDER_DEPLOY_HOOK` on `main` push |

**Secrets to add (GitHub → Settings → Secrets):**

- `RENDER_DEPLOY_HOOK` — Render deploy hook URL
- `VERCEL_TOKEN` / `NETLIFY_AUTH_TOKEN` — if using official deploy actions (optional)

**Vercel CI alternative:** connect GitHub in Vercel dashboard (zero workflow file).

---

## Part 6 — Docker reference

### Files

| File | Purpose |
|------|---------|
| `backend/Dockerfile` | Multi-stage API image, non-root user, healthcheck |
| `backend/docker-entrypoint.sh` | Optional `prisma db push` |
| `frontend/Dockerfile` | Vite build + Nginx Alpine |
| `frontend/nginx.conf` | SPA static hosting |
| `frontend/nginx.docker.conf` | SPA + `/api` reverse proxy |
| `docker-compose.yml` | Dev Postgres + API |
| `docker-compose.prod.yml` | Full stack on one host |

### Commands

```bash
# Dev database only
docker compose up -d postgres

# Production stack
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

# Logs
docker compose -f docker-compose.prod.yml logs -f backend

# Health
curl http://localhost/api/health   # via nginx proxy
curl http://localhost:5000/api/health  # direct if port exposed
```

---

## Part 7 — Production optimizations

### Backend (implemented)

- `NODE_ENV=production`
- `trust proxy` for correct client IP behind load balancers
- Multi-origin CORS via comma-separated `CORS_ORIGIN`
- Docker: non-root user, `dumb-init`, healthcheck on `/api/health`
- Structured logging (`morgan` combined)
- Escalation cron disable in multi-instance: set `ESCALATION_CRON_ENABLED=false` on all but one replica

### Frontend (implemented)

- Vite production build with tree-shaking
- Long-cache immutable assets (`/assets/*`)
- Security headers (Vercel/Netlify/Nginx)
- Gzip on Nginx

### Database

- Use connection pooling (Neon pooler, PgBouncer)
- Enable automated backups (Neon/RDS)
- Index hot paths (see `database/schema.sql`)

### Secrets

- Rotate `JWT_SECRET` with planned logout-all
- Store secrets in platform vaults (Render env, Vercel env, AWS Secrets Manager)

---

## Part 8 — Post-deploy verification

```bash
# API health
curl https://api.yourdomain.com/api/health

# Login
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@goalsync.com","password":"Password123"}'

# Frontend loads
curl -I https://app.yourdomain.com
```

1. Open app → login as admin/manager/employee  
2. Submit goals → manager receives notification  
3. Admin → Analytics, Escalations  
4. Microsoft SSO (if Entra configured)  

---

## Part 9 — Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error | `CORS_ORIGIN` must exactly match frontend URL (no trailing slash) |
| 401 on API | Check `VITE_API_URL` ends with `/api` |
| DB SSL error | Append `?sslmode=require` to `DATABASE_URL` |
| Render sleep | Upgrade plan or use health ping |
| Prisma errors | Run `npx prisma db push` against production DB once |
| Microsoft SSO redirect mismatch | Entra app registration URI = `AZURE_REDIRECT_URI` |

---

## Quick reference — URLs after deploy

| Service | URL |
|---------|-----|
| App | `https://app.yourdomain.com` |
| API | `https://api.yourdomain.com/api` |
| Health | `https://api.yourdomain.com/api/health` |
| API docs hint | `https://api.yourdomain.com/api/docs` |

---

*Repository configs: `backend/render.yaml`, `railway.toml`, `frontend/vercel.json`, `frontend/netlify.toml`, `.github/workflows/ci.yml`*
