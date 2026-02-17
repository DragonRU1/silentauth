# SilentAuth

A silent verification/authentication platform. Monorepo with Docker Compose orchestration.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                       │
│                                                         │
│  ┌──────────┐   ┌──────────┐   ┌────────────────────┐  │
│  │ Dashboard │   │ Verify   │   │     Backend        │  │
│  │ Next.js   │   │ Client   │   │  Express + TS      │  │
│  │ :3000     │   │ :3001    │   │  :4000             │  │
│  └─────┬─────┘   └────┬─────┘   └─────────┬──────────┘  │
│        │              │                    │             │
│        └──────────────┴────────────────────┘             │
│                                  │                      │
│                         ┌────────┴────────┐             │
│                         │   PostgreSQL    │             │
│                         │   :5432         │             │
│                         └─────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

| Service               | URL                    | Description                           |
| --------------------- | ---------------------- | ------------------------------------- |
| **Dashboard**         | http://localhost:3000   | Admin UI: orgs, projects, sessions    |
| **Verification Client** | http://localhost:3001 | End-user verification page            |
| **Backend API**       | http://localhost:4000   | REST API                              |
| **PostgreSQL**        | localhost:5432          | Database (user: silentauth)           |

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- That's it. No Node.js, no npm, no PostgreSQL needed on your machine.

### Start Everything

```bash
docker compose up --build
```

This single command will:

1. Start PostgreSQL and wait for it to be healthy.
2. Build the backend, run Prisma migrations automatically, and start the API server.
3. Build and start both Next.js frontends.

### Stop Everything

```bash
docker compose down
```

### Reset (wipe database and rebuild)

```bash
docker compose down -v
docker compose up --build
```

## Project Structure

```
SilentAut/
├── docker-compose.yml          # Orchestration
├── .env                        # Environment variables
├── tsconfig.base.json          # Shared TS config
├── packages/
│   ├── database/               # Prisma schema + client
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Database models
│   │   └── src/
│   │       └── index.ts        # PrismaClient singleton
│   ├── backend/                # Express API
│   │   ├── Dockerfile
│   │   ├── entrypoint.sh       # Auto-migration script
│   │   └── src/
│   │       ├── index.ts        # App entry point
│   │       ├── types/          # Zod schemas & TS types
│   │       ├── routes/         # Route definitions
│   │       ├── controllers/    # Request handlers
│   │       ├── services/       # Business logic
│   │       └── middleware/     # Auth, validation
│   ├── dashboard/              # Admin UI (Next.js)
│   │   ├── Dockerfile
│   │   └── src/app/
│   │       ├── page.tsx        # Login / Register
│   │       ├── projects/       # Project management
│   │       └── sessions/       # Session viewer
│   └── verification-client/    # End-user UI (Next.js)
│       ├── Dockerfile
│       └── src/app/
│           ├── page.tsx        # Landing
│           └── verify/         # Verification flow
```

## Database Schema

| Model           | Key Fields                                           |
| --------------- | ---------------------------------------------------- |
| Organization    | id, name                                             |
| User            | email, password_hash, role (ADMIN/MEMBER), org_id    |
| Project         | name, org_id                                         |
| ApiKey          | key_hash, scopes[], project_id, revoked_at           |
| ActionSession   | token (unique), status (PENDING/VERIFIED/EXPIRED), proof_data (JSON), expires_at |

## API Endpoints

### Auth

| Method | Path                  | Body                                              | Auth     |
| ------ | --------------------- | ------------------------------------------------- | -------- |
| POST   | `/api/auth/register`  | `{ name, adminEmail, adminPassword }`             | None     |
| POST   | `/api/auth/login`     | `{ email, password }`                             | None     |

### Projects

| Method | Path                  | Body           | Auth         |
| ------ | --------------------- | -------------- | ------------ |
| POST   | `/api/projects`       | `{ name }`     | Bearer token |
| GET    | `/api/projects`       | -              | Bearer token |
| GET    | `/api/projects/:id`   | -              | Bearer token |

### Sessions

| Method | Path                    | Body                          | Auth        |
| ------ | ----------------------- | ----------------------------- | ----------- |
| POST   | `/api/sessions`         | -                             | X-API-Key   |
| GET    | `/api/sessions`         | -                             | X-API-Key   |
| GET    | `/api/sessions/:token`  | -                             | None        |
| POST   | `/api/sessions/verify`  | `{ token, proofData? }`       | None        |

## Usage Walkthrough

1. **Register** -- Go to http://localhost:3000, click "Create Organization", fill in org name + email + password.
2. **Create a Project** -- Navigate to Projects, enter a project name. Copy the API key shown (it's only displayed once).
3. **Create a Session** -- Go to Sessions, paste your API key, click "+ New Session".
4. **Verify** -- Click the verification link shown for the session. It opens http://localhost:3001/verify?token=... where the end-user clicks "Confirm & Verify".
5. **Check Status** -- Back in Sessions, click "Load" to see the session status change to VERIFIED.

## Environment Variables

All variables are in `.env` at the project root. The defaults work out of the box for development.

| Variable                    | Default                                    | Used By             |
| --------------------------- | ------------------------------------------ | ------------------- |
| `POSTGRES_USER`             | silentauth                                 | postgres            |
| `POSTGRES_PASSWORD`         | silentauth_dev_pwd                         | postgres            |
| `POSTGRES_DB`               | silentauth                                 | postgres            |
| `DATABASE_URL`              | postgresql://silentauth:...@postgres:5432  | backend             |
| `JWT_SECRET`                | dev-jwt-secret-change-in-production        | backend             |
| `PORT`                      | 4000                                       | backend             |
| `NEXT_PUBLIC_API_URL`       | http://localhost:4000                       | dashboard           |
| `NEXT_PUBLIC_VERIFY_API_URL`| http://localhost:4000                       | verification-client |

## Development Notes

- **Hot reload**: Backend uses `tsx watch`, both Next.js apps run in dev mode. Source directories are mounted as Docker volumes, so changes to code are reflected immediately.
- **Prisma Studio**: Run `npx prisma studio` from `packages/database/` to browse the database with a GUI (requires Node.js locally, or exec into the backend container).
- **Migrations**: Handled automatically on backend container startup via `entrypoint.sh`. To create a new migration after schema changes, exec into the backend container and run `cd /app/packages/database && npx prisma migrate dev --name your_migration_name`.
