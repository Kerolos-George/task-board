# Task Board

Production-minded team task board (NestJS + Prisma + Supabase + React).

## Stack

| Layer | Choice |
|-------|--------|
| Backend | NestJS |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) or Docker Postgres |
| Auth | JWT + bcrypt |
| API docs | Swagger at `/docs` |
| Frontend | React (Vite) + React Router |

## Progress

- [x] Requirements & DB design
- [x] NestJS API (auth, projects, tasks)
- [x] Swagger + request logging
- [x] Pagination, sorting, search, audit log
- [x] Docker Compose + seed users + tests
- [x] React frontend (login, register, projects, task board)
- [ ] Real-time updates
- [ ] Public deployment

## Quick start

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```

API: http://localhost:3000/api · Swagger: http://localhost:3000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

Copy `frontend/.env.example` → `.env` if needed (`VITE_API_URL=http://localhost:3000/api`).

## Seed credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@taskboard.local` | `Admin123!` |
| Member | `member@taskboard.local` | `Member123!` |

## Frontend features

- Login & registration with client-side validation
- Project list (search, create)
- Project detail: members (owner/admin), edit/delete
- Kanban task board (To Do / In Progress / Done)
- Task create/edit with filters (status, priority, assignee, search)
- Loading, empty, success, and error states
- Responsive layout

## Docs

- [Requirements](./task.md)
- [Database design](./docs/db-design.md)
