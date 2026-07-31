# Task Board

Production-minded team task board (NestJS + Prisma + Supabase Postgres + React frontend planned).

## Stack

| Layer | Choice |
|-------|--------|
| Backend | NestJS |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | JWT + bcrypt (app-level, not Supabase Auth) |
| Frontend | TBD (React / Next.js) |

## Repository layout

```
task-board/
├── backend/          # NestJS API
├── docs/             # Design notes
│   └── db-design.md  # ER diagram & access rules
├── task.md           # Functional requirements
└── README.md
```

## Progress

- [x] Requirements (`task.md`)
- [x] Database design (`docs/db-design.md`)
- [ ] NestJS backend scaffold
- [ ] Prisma schema & migrations
- [ ] Auth, projects, tasks APIs
- [ ] Frontend
- [ ] Tests & seed data

## Docs

- [Functional requirements](./task.md)
- [Database design](./docs/db-design.md)

## Setup

Coming next after the backend scaffold and Prisma schema are in place.
