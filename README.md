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
| Frontend | React (Vite) |

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

API: http://localhost:3000/api

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

## Seed credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@taskboard.local` | `Admin123!` |
| Member | `member@taskboard.local` | `Member123!` |

## Deploy to Vercel

### Backend (recommended: set Root Directory to `backend`)

1. **Vercel → Import Project** → this repo  
2. **Framework Preset:** Other  
3. **Root Directory:** `backend` ← **Important**  
4. **Build Command:** `npm run vercel-build`  
5. **Output Directory:** (leave empty)  
6. **Install Command:** `npm install`  

**Environment Variables:**

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase Transaction pooler (port `6543`)<br>Example: `postgresql://user:pass@host.supabase.com:6543/postgres?pgbouncer=true` |
| `JWT_SECRET` | Long random string (generate with `openssl rand -base64 32`) |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | Your frontend URL, e.g. `https://task-board-frontend.vercel.app` |

7. **Deploy**

Test: `https://your-api.vercel.app/api/health`

### Alternative: Deploy from root

If you can't set Root Directory, the root `vercel.json` will deploy from the monorepo root, but **setting Root Directory to `backend` is simpler and recommended**.

### Frontend

1. Deploy `frontend` folder separately (or set Root Directory to `frontend`)  
2. Set `VITE_API_URL=https://your-api.vercel.app/api`  

### Database migrations

Run migrations from your local machine (not on Vercel):

```bash
cd backend
npx prisma migrate deploy
npm run prisma:seed
```

## Features

- JWT authentication (Admin/Member roles)
- Project CRUD with member management (owner/admin only)
- Kanban task board (To Do / In Progress / Done)
- Task filters: status, priority, assignee, search
- Pagination, sorting
- Task status audit log (bonus)
- Swagger API docs at `/docs`

## Docs

- [Requirements](./task.md)
- [Database design](./docs/db-design.md)
