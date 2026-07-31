# Task Board

Production-minded team task board (NestJS + Prisma + Supabase Postgres + React frontend planned).

## Stack

| Layer | Choice |
|-------|--------|
| Backend | NestJS |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | JWT + bcrypt (app-level, not Supabase Auth) |
| API docs | Swagger / OpenAPI |
| Frontend | TBD (React / Next.js) |

## Repository layout

```
task-board/
├── backend/          # NestJS API
│   └── prisma/       # Schema & migrations
├── docs/             # Design notes
│   └── db-design.md  # ER diagram & access rules
├── task.md           # Functional requirements
└── README.md
```

## Progress

- [x] Requirements (`task.md`)
- [x] Database design (`docs/db-design.md`)
- [x] NestJS backend scaffold (`backend/`)
- [x] Prisma schema (`backend/prisma/schema.prisma`)
- [ ] Prisma migrate against Supabase
- [ ] Swagger API docs
- [ ] Auth, projects, tasks APIs
- [ ] Frontend
- [ ] Tests & seed data

## Docs

- [Functional requirements](./task.md)
- [Database design](./docs/db-design.md)

## Backend setup

```bash
cd backend
npm install
```

### Configure Supabase

1. Ensure `backend/.env` has your Supabase `DATABASE_URL` (Project Settings → Database → URI).
2. Use **Session mode** (port `5432`) for migrations.

### Generate client & create migration

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

This creates `prisma/migrations/...` and applies tables to Supabase.

### Run API

```bash
npm run start:dev
```

API default: `http://localhost:3000`

## Database models

| Model | Purpose |
|-------|---------|
| `User` | Auth user with `ADMIN` / `MEMBER` role |
| `Project` | Board owned by a user |
| `ProjectMember` | Who can access a project |
| `Task` | Task with status, priority, assignee |
| `TaskStatusHistory` | Audit log for status changes (bonus) |
