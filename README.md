# GoalSync AI

Enterprise goal setting and tracking portal for employees, managers, and HR.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Recharts
- **Backend:** Node.js, Express, JWT
- **Database:** PostgreSQL (Neon in production)

## Quick Start

### Prerequisites

- Node.js 20+
- Docker (optional, for local PostgreSQL)

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Start database

```bash
npm run db:up
```

### 3. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 4. Run development servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

### Demo accounts (after seed)

| Role     | Email              | Password    |
|----------|--------------------|-------------|
| Admin    | admin@goalsync.com | Password123 |
| Manager  | manager@goalsync.com | Password123 |
| Employee | employee@goalsync.com | Password123 |

## Project Structure

```
goalsync-ai/
├── frontend/          # React SPA (Vercel)
├── backend/           # Express API (Render)
├── database/          # Schema & seeds
├── docker-compose.yml
└── CLAUDE.md          # Full product spec
```

## Deployment

Full step-by-step guide: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

| Layer | Config |
|-------|--------|
| Frontend | `frontend/vercel.json`, `frontend/netlify.toml`, `frontend/Dockerfile` |
| Backend | `backend/Dockerfile`, `backend/render.yaml`, `railway.toml` |
| Docker stack | `docker-compose.prod.yml` |
| CI/CD | `.github/workflows/ci.yml` |

```bash
# One-command production stack (VPS)
cp .env.production.example .env   # edit secrets
docker compose -f docker-compose.prod.yml up -d --build
```
