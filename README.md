# Task Board

Production-minded team task board (NestJS + Prisma + Supabase Postgres).

## Stack

| Layer | Choice |
|-------|--------|
| Backend | NestJS |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) or Docker Postgres |
| Auth | JWT + bcrypt |
| API docs | Swagger at `/docs` |
| Frontend | TBD |

## Progress

- [x] Requirements & DB design
- [x] NestJS API (auth, projects, tasks)
- [x] Swagger
- [x] Pagination, sorting, search
- [x] Task status audit log
- [x] Docker Compose
- [x] Seed users (Admin + Member)
- [x] Automated backend tests
- [ ] Frontend
- [ ] Real-time updates
- [ ] Public deployment

## Architecture

```
Client → NestJS (/api) → Prisma → PostgreSQL (Supabase / Docker)
                ↘ Swagger UI (/docs)
```

- **Auth:** register / login issue JWT; routes protected by default
- **Roles:** `ADMIN` (global) and `MEMBER`
- **Access:** users only see projects they belong to (admins see all)
- **Members:** project owner or admin can add/remove members
- **Tasks:** filter by status / priority / assignee; status changes written to `TaskStatusHistory`

## Backend setup

```bash
cd backend
npm install
```

1. Copy env: `copy .env.example .env` (Windows) and set `DATABASE_URL` + `JWT_SECRET`
2. Migrate & generate:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

3. Run API:

```bash
npm run start:dev
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000/api | REST API |
| http://localhost:3000/docs | Swagger UI |
| http://localhost:3000/api/health | Health check |

## Seed credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@taskboard.local` | `Admin123!` |
| Member | `member@taskboard.local` | `Member123!` |

## API overview

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public → JWT |
| GET | `/api/auth/me` | Current user |
| CRUD | `/api/projects` | List supports `page`, `limit`, `search`, `sortBy`, `sortOrder` |
| POST/DELETE | `/api/projects/:id/members` | Owner or admin |
| CRUD | `/api/projects/:projectId/tasks` | Filters: `status`, `priority`, `assigneeId` |
| GET | `/api/projects/:projectId/tasks/:taskId/history` | Audit log |

Authorize in Swagger with: `Bearer <accessToken>`

## Tests

```bash
cd backend
npm test
```

## Docker Compose (local Postgres + API)

From repo root (optional if using Supabase):

```bash
docker compose up --build
```

Local DB URL example:

```env
DATABASE_URL="postgresql://taskboard:taskboard@localhost:5432/taskboard"
```

## Environment variables

See `backend/.env.example`:

- `DATABASE_URL` — Postgres connection string
- `JWT_SECRET` — signing secret
- `JWT_EXPIRES_IN` — e.g. `7d`
- `PORT` — default `3000`

## Docs

- [Requirements](./task.md)
- [Database design](./docs/db-design.md)
