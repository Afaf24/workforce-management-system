# AI-Powered HR Management System

A graduation project: an HR management system with employee management,
attendance tracking, leave management, and an AI HR Assistant powered by OpenAI.

## Architecture

```
ai-hr-system/
├── backend/        ASP.NET Core 8 Web API (Clean Architecture, C#, EF Core, PostgreSQL)
├── frontend/        Next.js 14 + TypeScript + Tailwind CSS + shadcn-style UI
├── ai-service/      Python FastAPI microservice wrapping the OpenAI API
├── database/        Raw SQL schema (reference / manual setup)
├── docs/            ERD and other diagrams
└── docker-compose.yml   Spins up PostgreSQL locally
```

The three services talk to each other like this:

```
Browser → Next.js (3000) → ASP.NET Core API (5000) → PostgreSQL (5432)
                                     │
                                     └──→ FastAPI AI service (8000) → OpenAI API
```

The frontend never calls the AI service directly — only the backend does, using
a shared internal API key, so your OpenAI key is never exposed to the browser.

## Prerequisites

Install these locally (none of this runs in the sandbox that built it):

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org) and npm
- [Python 3.10+](https://python.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (easiest way to run PostgreSQL) — or a local PostgreSQL 16 install
- An OpenAI API key (for the AI Assistant feature) — https://platform.openai.com/api-keys

## 1. Open in VS Code

Unzip the project, then in VS Code: `File → Open Folder` → select the `ai-hr-system` folder.
Recommended extensions: **C# Dev Kit**, **ESLint**, **Python**, **Tailwind CSS IntelliSense**.

## 2. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` and automatically runs `database/schema.sql`
to create tables and seed demo data on first start.

(Backend note: the backend's own `DbSeeder` will also run EF Core migrations and
seed on first launch in Development mode, so you technically don't *need* the raw
SQL file if you let the backend create its own schema via migrations — see step 3.)

## 3. Run the backend (ASP.NET Core API)

```bash
cd backend
dotnet restore
dotnet ef database update --project src/HRSystem.Infrastructure --startup-project src/HRSystem.API
dotnet run --project src/HRSystem.API
```

If `dotnet ef` isn't installed: `dotnet tool install --global dotnet-ef`

The API runs at `http://localhost:5000` (check the console output for the exact port).
Swagger UI: `http://localhost:5000/swagger`.

Before running, open `backend/src/HRSystem.API/appsettings.json` and:
- Set a real `Jwt:Secret` (any long random string, 32+ characters)
- Confirm `ConnectionStrings:DefaultConnection` matches your Postgres setup
- Set `AIService:InternalApiKey` to match the value you'll put in the AI service's `.env`

## 4. Run the AI microservice (FastAPI)

```bash
cd ai-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:
- `OPENAI_API_KEY` — your real OpenAI key
- `INTERNAL_API_KEY` — must match `AIService:InternalApiKey` in the backend's appsettings.json

```bash
uvicorn app.main:app --reload --port 8000
```

Runs at `http://localhost:8000`. Docs: `http://localhost:8000/docs`.

## 5. Run the frontend (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local
```

Confirm `.env.local` has:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Runs at `http://localhost:3000`.

## Demo login credentials

Seeded automatically by the backend on first run (Development environment):

| Role | Email | Password |
|---|---|---|
| HR Manager | hr.manager@company.com | Passw0rd! |
| Department Manager | dept.manager@company.com | Passw0rd! |
| Employee | employee@company.com | Passw0rd! |

## Run order summary

1. `docker compose up -d` (database)
2. Backend (`dotnet run`) — auto-migrates and seeds
3. AI service (`uvicorn ...`)
4. Frontend (`npm run dev`)

Open `http://localhost:3000` and log in with one of the demo accounts above.

## Notes on what was and wasn't tested

This codebase was written and manually reviewed for correctness, but the sandbox
it was built in has no outbound access to NuGet, npm, or PyPI, so it could not be
compiled or run end-to-end before delivery. Review each project's own README and
run the commands above locally — that's the real first build/run. If you hit a
compile error, it's most likely a small package-version mismatch; check the
`.csproj`/`package.json`/`requirements.txt` files first.

## Tech stack

- **Backend:** ASP.NET Core 8, C#, Clean Architecture, EF Core, PostgreSQL, JWT auth, FluentValidation, BCrypt
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn-style components, lucide-react
- **AI Service:** Python 3.10+, FastAPI, OpenAI API, Pydantic
- **Database:** PostgreSQL 16
