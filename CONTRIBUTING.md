# SortMail — Contributing Guide

> For collaborators and contributors working on this codebase.  
> Read this before writing any code.

---

## Team Setup

### Prerequisites

```bash
# Backend
python 3.11+
pip install -r backend/requirements.txt

# Frontend
node 18+
cd frontend && npm install

# Local services
docker-compose up -d   # starts PostgreSQL + Redis
```

### Environment files

Copy `.env.example` → `backend/.env` and fill in:
- `DATABASE_URL` — Railway PostgreSQL (ask team lead for prod URL)
- `GEMINI_API_KEY` — Google AI Studio key
- `REDIS_URL` — Redis connection
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth credentials
- `SECRET_KEY` — any random 32-char string for local dev

For frontend, `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Running locally

```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## Git Workflow

### Branch naming

```
feat/your-feature-name      # new feature
fix/what-you-fixed          # bug fix
chore/what-you-cleaned      # cleanup, deps, no behavior change
docs/what-you-documented    # docs only
```

### Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add dark mode toggle
fix: prevent double sync on tab focus
chore: bump Pydantic to 2.6
docs: update architecture.md with SSE flow
```

### Pull Request rules

1. **Never push directly to `main`.** Always use a PR.
2. **Always push to `dev` branch** — `main` is production-only.
3. PR title = same format as commit message.
4. Before opening a PR, run:
   ```bash
   cd backend && ruff check .
   cd frontend && npm run build
   ```
5. At least **1 review** required before merging.
6. Squash merge (not rebase) to keep `dev` history clean.

---

## Backend Conventions

### File structure

```
backend/
  api/routes/    ← One file per resource (threads.py, tasks.py, etc.)
  core/          ← Business logic (no HTTP concerns)
  models/        ← SQLAlchemy ORM models
  contracts/     ← Pydantic boundary models (cross-layer communication)
  schemas/       ← Pydantic request/response schemas for API endpoints
```

### Adding a new API endpoint

1. Add the route to the appropriate file in `api/routes/`
2. Use `Depends(get_current_user)` — no unprotected endpoints
3. Use `Depends(get_db)` for DB access
4. Return a Pydantic response model — never return raw ORM objects
5. Add the endpoint path to the frontend `endpoints` object in `frontend/src/lib/api.ts`
6. **Never call Gmail API in a request handler** — only in background tasks via `BackgroundTasks`

```python
# ✅ Correct pattern
@router.get("/something", response_model=SomeResponse)
async def get_something(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SomeModel).where(...))
    return SomeResponse(...)
```

### Adding a new model column

1. Add the column to the model in `models/`
2. Create an Alembic migration: `alembic revision --autogenerate -m "add column X to Y"`
3. Test the migration locally before opening a PR
4. **Never use `init_db()` (which calls `create_all`) to add columns — always use Alembic**

```bash
cd backend
alembic revision --autogenerate -m "add intelligence_status to threads"
alembic upgrade head
```

### Router setup

Every APIRouter must disable redirect_slashes:
```python
router = APIRouter(redirect_slashes=False)
```
This prevents FastAPI's 307 redirect that breaks axios cross-origin requests.

---

## Frontend Conventions

### All API calls go through `lib/api.ts`

```typescript
// ✅ Correct
import { api, endpoints } from '@/lib/api';
const { data } = await api.get(endpoints.threads);

// ❌ Never do this
const { data } = await axios.get('https://sortmail-production.up.railway.app/api/threads');
```

### Adding a new page

1. Create `frontend/src/app/your-page/page.tsx`
2. Add `'use client';` at the top (all our pages are Client Components)
3. Wrap with `<AppShell>` for consistent navigation
4. Create a React Query hook in `hooks/useYourThing.ts` for data fetching
5. Never fetch data directly in the component — always use a hook

### Adding a new React Query hook

```typescript
// hooks/useSomething.ts
import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';

export function useSomething(id: string) {
    return useQuery({
        queryKey: ['something', id],
        queryFn: async () => {
            const { data } = await api.get(`${endpoints.something}/${id}`);
            return data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5,  // 5 minutes
    });
}
```

### Invalidating cache after mutations

```typescript
const queryClient = useQueryClient();
// After a mutation succeeds:
queryClient.invalidateQueries({ queryKey: ['threads'] });
```

---

## Intelligence Pipeline Conventions

The intelligence pipeline follows a strict layering:

```
gemini_engine.py     — ONLY file that calls Gemini API
     ↓
pipeline.py          — orchestrates (calls engine + all modules)
     ↓
summarizer.py        — pure extractor function (no API calls)
intent_classifier.py — pure extractor function
deadline_extractor.py— pure extractor function
entity_extractor.py  — pure extractor function
```

**Rules:**
- Never add LLM calls to any file other than `gemini_engine.py`
- Module functions receive `intel_json: dict` and return their extracted data
- All modules must handle missing/null keys gracefully — Gemini may not always return all fields

---

## Testing

```bash
# Backend (when tests exist)
cd backend
pytest tests/ -v

# Frontend type check
cd frontend
npx tsc --noEmit

# Lint
cd backend && ruff check .
cd frontend && npm run lint
```

---

## Deployment

| Environment | Branch | Auto-deploy |
|-------------|--------|-------------|
| Production  | `main` | Railway (backend) + Vercel (frontend) |
| Staging/Dev | `dev`  | (Manual if needed) |

**Never manually edit production environment variables without telling the team.**

Env vars live in:
- Railway dashboard → Variables for backend
- Vercel dashboard → Environment Variables for frontend
