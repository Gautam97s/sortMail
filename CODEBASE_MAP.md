# SortMail — Codebase Map

> Every file, what it does, and who owns it. Keep this updated when you add files.

---

## Backend (`/backend`)

### `app/`
| File | What it does |
|------|-------------|
| `main.py` | FastAPI app entry point. Registers all routers. CORS, middleware, lifespan. |
| `config.py` | Settings from `.env` — `DATABASE_URL`, `GEMINI_API_KEY`, `REDIS_URL`, etc. |

### `api/routes/`
| File | Prefix | What it does |
|------|--------|-------------|
| `auth.py` | `/api/auth` | Google OAuth flow, session cookie, `/me`, logout |
| `threads.py` | `/api/threads` | List threads from DB (no Gmail call), get thread detail |
| `emails.py` | `/api/emails` | POST `/sync` (background incremental), GET `/sync/status` |
| `events.py` | `/api/events` | GET `/stream` — SSE endpoint for real-time push |
| `tasks.py` | `/api/tasks` | CRUD for tasks |
| `drafts.py` | `/api/drafts` | AI draft generation (credit-gated) |
| `reminders.py` | `/api/reminders` | Waiting-for / follow-up reminders |
| `notifications.py` | `/api/notifications` | In-app notifications |
| `credits.py` | `/api/credits` | Credit balance, transactions |
| `accounts.py` | `/api/connected-accounts` | List connected Gmail/Outlook accounts |
| `dashboard.py` | `/api/dashboard` | Dashboard stats aggregate |
| `admin_users.py` | `/api/admin` | Admin: list users, impersonate |
| `admin_credits.py` | `/api/admin/credits` | Admin: adjust credit balances |

### `api/dependencies.py`
- `get_current_user()` — extracts user from session cookie, throws 401 if invalid
- Used as `Depends(get_current_user)` in every protected route

### `api/middleware/`
- `security.py` — `SecurityHeadersMiddleware`, `RateLimitMiddleware`, `RequestIDMiddleware`

### `core/ingestion/`
| File | What it does |
|------|-------------|
| `sync_service.py` | **Main sync orchestrator.** `sync_user_emails()` runs full or incremental sync. After saving each thread, triggers intel pipeline in background. |
| `email_fetcher.py` | Fetches threads from Gmail API, parses MIME recursively → `EmailThreadV1` contracts |
| `gmail_client.py` | Raw Gmail API wrapper: `get_thread()`, `get_history()`, `get_attachment()` |
| `attachment_extractor.py` | Downloads attachment bytes → stores to local disk |
| `rate_limiter.py` | Per-user Gmail API rate limiting |

### `core/intelligence/`
| File | What it does |
|------|-------------|
| `gemini_engine.py` | **ONLY LLM caller.** Single Gemini Flash call. Returns full intel JSON. |
| `pipeline.py` | **Orchestrator.** Loads thread from DB, calls gemini_engine, passes JSON to all modules, saves to DB, auto-creates tasks, publishes SSE. |
| `summarizer.py` | Pure function: `extract_summary(intel_json)` → string |
| `intent_classifier.py` | Pure function: `extract_intent(intel_json)` → (intent, urgency_score) |
| `deadline_extractor.py` | Pure function: `extract_deadlines(intel_json)` → list of deadline dicts |
| `entity_extractor.py` | Pure functions: `extract_entities()`, `extract_action_items()` |
| `email_intel.py` | Legacy orchestrator — kept for backwards compat, but `pipeline.py` is now used |
| `attachment_intel.py` | Stub — attachment intelligence not yet implemented |

### `core/storage/`
| File | What it does |
|------|-------------|
| `database.py` | SQLAlchemy async engine, `async_session`, `async_session_factory`, `get_db()` |

### `core/redis.py`
- `get_redis()` — returns a redis.asyncio client
- Used by events.py (SSE pub/sub) and rate limiter

### `models/`
| File | Table | Key Columns |
|------|-------|------------|
| `user.py` | `users` | id, email, name, role, credit_balance |
| `thread.py` | `threads` | id, user_id, external_id, subject, participants, labels, is_unread, summary, intent, urgency_score, intel_json, intel_generated_at |
| `thread.py` | `messages` | id, thread_id, from_address, body_text, sent_at, is_from_user |
| `task.py` | `tasks` | id, user_id, source_thread_id, title, priority_level, due_date, status, source_type, ai_confidence |
| `attachment.py` | `attachments` | id, message_id, user_id, filename, mime_type, storage_path |
| `connected_account.py` | `connected_accounts` | id, user_id, provider, last_history_id, last_sync_at, sync_status, initial_sync_done |

### `contracts/`
> Contracts are Pydantic models that define the boundary between layers (Ingestion → Intelligence → Workflow).
> **Never import models directly across layers — use contracts.**

| File | What it defines |
|------|----------------|
| `ingestion.py` | `EmailThreadV1`, `EmailMessage`, `AttachmentRef` |
| `intelligence.py` | `ThreadIntelV1`, `ExtractedDeadline`, `ExtractedEntity` |
| `workflow.py` | `TaskDTOv1`, `DraftDTOv1` |
| `enums.py` | `IntentType`, `PriorityLevel`, `TaskStatus` |

---

## Frontend (`/frontend/src`)

### `app/` (Next.js pages)
| Path | What it renders |
|------|----------------|
| `/` | Landing page |
| `/inbox` | Thread list. Uses `useThreads` + `useSmartSync` + `useRealtimeEvents` |
| `/inbox/[threadId]` | Thread detail. Uses `useThreadDetail`. All client-side. |
| `/dashboard` | Stats overview |
| `/tasks` | Task list |
| `/drafts` | Draft list |

### `hooks/`
| Hook | What it does |
|------|-------------|
| `useThreads.ts` | React Query: `GET /api/threads`. Cache 5 min, no refetch-on-focus. |
| `useSmartSync.ts` | Checks `/sync/status`, triggers background sync if stale (> 5 min), polls until done, invalidates cache |
| `useRealtimeEvents.ts` | Opens SSE `EventSource` to `/api/events/stream`. Invalidates queries on `intel_ready` / `new_emails` |
| `useThreadDetail.ts` | React Query: `GET /api/threads/{id}`. Returns thread + intel + tasks + draft |

### `lib/api.ts`
- Central axios instance with `baseURL`, `withCredentials: true`
- `endpoints` object — ALL API paths defined here, nowhere else

### `components/`
| Component | What it does |
|-----------|-------------|
| `layout/AppShell` | Sidebar nav, header, auth guard |
| `ui/*` | shadcn/ui primitives (Button, Card, Badge, etc.) |

---

## Config Files

| File | What it configures |
|------|-------------------|
| `backend/.env` | `DATABASE_URL`, `GEMINI_API_KEY`, `REDIS_URL`, `SECRET_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_USE_MOCK_DATA` |
| `.github/workflows/ci.yml` | CI: ruff lint (non-blocking), Next.js build check |
| `backend/pyproject.toml` | Python project config, ruff settings |
| `docker-compose.yml` | Local dev: postgres + redis |

---

## Key Invariants (Rules Everyone Must Follow)

1. **`gemini_engine.py` is the only file that calls the Gemini API.** All other intelligence modules are pure functions.
2. **Never call Gmail API in a request handler.** All Gmail calls happen in `sync_service.py` via background tasks.
3. **All API endpoints must use `Depends(get_current_user)`.** No unprotected endpoints except `/api/auth/*` and `/health`.
4. **All frontend API paths go through `lib/api.ts` `endpoints` object.** No hardcoded URLs elsewhere.
5. **Contracts, not models, cross layer boundaries.** `core/ingestion` → `core/intelligence` via `EmailThreadV1`, not raw `Thread` model.
6. **`redirect_slashes=False` on all routers.** Prevents Next.js SSR and axios from hitting 307 redirects.
