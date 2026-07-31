# Task Board

Production-minded team task board (NestJS + Prisma + Supabase + React).

## Stack

| Layer | Choice |
|-------|--------|
| Backend | NestJS (Vercel serverless) |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | JWT + bcryptjs |
| API docs | Swagger at `/docs` |
| Frontend | React (Vite) on Vercel |

## Quick start (local)

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Seed credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@taskboard.local` | `Admin123!` |
| Member | `member@taskboard.local` | `Member123!` |

## Deploy backend on Vercel

### Option A (recommended): Root Directory = `backend`

1. Vercel → New Project → this repo  
2. **Root Directory:** `backend`  
3. Framework: Other  
4. Build Command: `npm run vercel-build`  
5. Install Command: `npm install`  
6. Environment variables:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Supabase **Transaction** pooler URI (port `6543`) + `?pgbouncer=true` |
| `JWT_SECRET` | long random string |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | your frontend origin, e.g. `https://your-app.vercel.app` |

7. Deploy. Test: `https://<api>.vercel.app/api/health`

`vercel-build` runs Prisma generate, Nest build, then copies `dist` → `api/dist` so the serverless function can load the app.

### Option B: deploy from repo root

Use the root `vercel.json` (build runs inside `backend/`). Same env vars as above.

### After backend is live

Set frontend `VITE_API_URL=https://<api>.vercel.app/api` and redeploy the frontend.

Run migrations against Supabase from your machine (not on Vercel):

```bash
cd backend
npx prisma migrate deploy
npm run prisma:seed
```

## Docs

- [Requirements](./task.md)
- [Database design](./docs/db-design.md)
