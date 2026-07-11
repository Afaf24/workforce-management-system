# AI HR Assistant Service (FastAPI)

This microservice wraps the OpenAI API and exposes a single endpoint that the
ASP.NET Core backend calls to power the AI HR Assistant feature.

## Setup

```bash
cd ai-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# edit .env and add your real OPENAI_API_KEY
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

The service will be live at `http://localhost:8000`.
Interactive API docs (Swagger UI): `http://localhost:8000/docs`.

## Endpoints

- `GET /health` — health check, no auth required.
- `POST /api/v1/assistant/ask` — main AI assistant endpoint. Requires header
  `X-Internal-Api-Key` matching `INTERNAL_API_KEY` in `.env`. This is what the
  .NET backend calls; it is not meant to be called directly by the frontend.

## How grounding works

The .NET backend gathers the employee's real leave balances and attendance
summary from PostgreSQL, then sends them along with the question to this
service. `app/services/openai_service.py` builds a system prompt that
includes the official HR policy text (`app/services/hr_policy.py`) plus this
real employee data, so the model answers from facts instead of guessing.

## Testing without a real OpenAI key

If `OPENAI_API_KEY` is left blank or invalid, calls to OpenAI will fail and
the service returns a friendly fallback message rather than crashing — see
the `try/except` block in `ask_assistant()`. This lets you demo the rest of
the system (login, employees, attendance, leave) even before wiring up a key.
