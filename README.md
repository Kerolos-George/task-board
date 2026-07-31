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
Swagger: http://localhost:3000/docs

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

### Deploy Backend

1. **Create new Vercel project** → Import from Git → this repo
2. **Project Settings:**
   - **Name:** `task-board-api` (or any name)
   - **Framework:** Other
   - **Root Directory:** `backend` ← **Important**
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** (leave empty)
   - **Install Command:** `npm install`

3. **Environment Variables:**

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Supabase Transaction pooler (port `6543`)<br>`postgresql://user:pass@host.supabase.com:6543/postgres?pgbouncer=true` |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | Your frontend URL (set after frontend deploy)<br>Example: `https://task-board-app.vercel.app` |

4. **Deploy**

After deploy:
- API: `https://your-api.vercel.app/api/health`
- Swagger: `https://your-api.vercel.app/docs`

### Deploy Frontend (separate project)

1. **Create another Vercel project** → same repo
2. **Project Settings:**
   - **Name:** `task-board-app` (or any name)
   - **Framework:** Vite
   - **Root Directory:** `frontend` ← **Important**
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Environment Variables:**

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your backend API URL<br>Example: `https://task-board-api.vercel.app/api` |

4. **Deploy**

### Update backend FRONTEND_URL

After frontend deploys, go back to backend project → Settings → Environment Variables → Update `FRONTEND_URL` with your frontend URL → Redeploy

### Database migrations

Run from your local machine (not on Vercel):

```bash
cd backend
npx prisma migrate deploy
npm run prisma:seed
```

## Features

- JWT authentication (Admin/Member roles)
- Project CRUD with member management
- Kanban task board (To Do / In Progress / Done)
- Task filters: status, priority, assignee, search
- Pagination, sorting
- Task status audit log
- Swagger API docs

## Docs

- [Requirements](./task.md)
- [Database design](./docs/db-design.md)
