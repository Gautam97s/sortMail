# SortMail — AI Prompting Guide

> How to safely use AI assistants (Cursor, Claude, Gemini, Copilot) on this codebase.  
> This guide prevents the most common AI-caused bugs: wrong variable names, model modifications, and broken assumptions.

---

## The Golden Rule

**Before asking AI to write or modify any code, paste the relevant file contents into the prompt.** Never let AI assume what a function or model looks like — it will hallucinate.

---

## Category 1: Variable & Field Name Hallucinations

AI assistants frequently make up field names that don't exist. These cause silent bugs at runtime.

### The Danger

```python
# AI wrote this — WRONG
task.priority = "urgent"       # ← field is called priority_level (string), not priority
task.due = datetime.today()    # ← field is called due_date (Date, not DateTime)
task.completed = True          # ← field is called status = "done", no completed bool
```

### How to Prevent It

Always paste the model definition before asking AI to create/update a record:

**Prompt template:**
```
Here is the exact SQLAlchemy model I'm working with:

[paste models/task.py contents here]

Now write code to create a new task with priority "do_now" and due_date="2026-03-01".
```

### Current field names to know

**`models/thread.py > Thread`:**
- `id` (not thread_id)
- `external_id` (Gmail thread ID)
- `is_unread` — int (0 or 1), not bool
- `has_attachments` — bool
- `intel_json` — JSONB dict, not a string
- `intel_generated_at` — DateTime, not `intel_at` or `processed_at`
- `last_email_at` — DateTime (not `last_updated` or `updated_at`)
- `urgency_score` — int 0-100 (not `priority_score`)

**`models/task.py > Task`:**
- `priority_level` — string values: `"do_now"`, `"do_today"`, `"can_wait"` (NOT `urgent/high/medium/low`)
- `priority_score` — int 0-100
- `status` — Enum: `pending`, `todo`, `in_progress`, `done`, `cancelled`
- `task_type` — Enum: `general`, `email`, `follow_up`, `meeting`
- `source_thread_id` — FK to threads.id (not thread_id)
- `ai_confidence` — int (not float; use 85 not 0.85)
- `due_date` — Date (not DateTime)

**`models/connected_account.py`:**
- `last_history_id` — string (not int)
- `last_sync_at` — DateTime (not `synced_at`)
- `sync_status` — string: `"idle"`, `"syncing"`, `"failed"`

---

## Category 2: Don't Modify Models Without a Migration

**Never ask AI to add a column to a model and just run `init_db()`.** This will drop and recreate tables in production.

### Safe workflow

1. If you need a new column, say explicitly: "Don't run init_db or create_all. Just show me the column definition and the Alembic migration."
2. Run:
   ```bash
   cd backend
   alembic revision --autogenerate -m "add xyz to table"
   alembic upgrade head
   ```
3. Test locally before merging.

**Prompt template:**
```
I need to add a column 'processed_at' (DateTime, nullable) to the Thread model.
Show me only:
1. The column definition to add to models/thread.py
2. The Alembic migration command to run
Do NOT suggest init_db(), create_all(), or drop_all().
```

---

## Category 3: Don't Hallucinate Contract Fields

Contracts (`contracts/`) are the boundary between layers. AI often invents fields that don't exist.

### Prevention

When working with contracts, paste the contract class into your prompt:

**Prompt template:**
```
Here is EmailThreadV1 from contracts/ingestion.py:

[paste contracts/ingestion.py]

Write a function that takes an EmailThreadV1 and returns the sender's name.
```

**Known contracts and their real fields:**

`EmailThreadV1`:
- `thread_id`, `external_id`, `subject`, `participants`, `messages`, `attachments`
- `labels`, `is_unread`, `is_starred`, `last_updated`, `provider`

`EmailMessage`:
- `message_id`, `from_address`, `to_addresses`, `cc_addresses`, `subject`
- `body_text`, `sent_at`, `is_from_user`, `labels`

`ThreadIntelV1`:
- `thread_id`, `summary`, `intent`, `urgency_score`, `main_ask`
- `decision_needed`, `extracted_deadlines`, `entities`, `attachment_summaries`
- `suggested_action`, `suggested_reply_points`, `model_version`, `processed_at`

---

## Category 4: Don't Let AI Invent API Endpoints

AI will generate `GET /api/emails/{id}` when the real endpoint is `GET /api/threads/{id}`. This wastes hours of debugging.

### Prevention

Paste `frontend/src/lib/api.ts` into your prompt when writing frontend code:

**Prompt template:**
```
Here is our complete API endpoint map (lib/api.ts):

[paste lib/api.ts]

Write a React Query hook that fetches the thread detail.
```

**Current real endpoints (from `lib/api.ts`):**
```
threads         → /api/threads
tasks           → /api/tasks
emailSync       → /api/emails/sync
emailSyncStatus → /api/emails/sync/status
eventStream     → /api/events/stream
authMe          → /api/auth/me
drafts          → /api/drafts
contacts        → /api/threads/contacts
```

---

## Category 5: Don't Break the Intelligence Pipeline Structure

The intelligence pipeline has a strict structure. AI will try to "simplify" it by combining files, which breaks the architecture.

**What AI will try to do (WRONG):**
```python
# AI merges everything into one file — don't do this
async def analyze_thread(thread):
    response = await gemini.generate(...)  # Making LLM call outside gemini_engine.py
    return summary, intent, tasks
```

**What is correct:**
```python
# gemini_engine.py — the ONLY LLM caller
async def run_intelligence(thread_id, subject, participants, messages) -> dict: ...

# summarizer.py — pure function, no LLM calls
def extract_summary(intel_json: dict) -> str: ...

# pipeline.py — calls engine once, distributes to modules
async def process_thread_intelligence(thread_id, user_id, db): ...
```

**Prompt template for intelligence work:**
```
Here is the intelligence pipeline structure. Follow it strictly:

1. gemini_engine.py — single Gemini Flash call, returns full JSON
2. summarizer.py, intent_classifier.py, deadline_extractor.py, entity_extractor.py
   — pure extractor functions, receive intel_json dict, return their slice
3. pipeline.py — orchestrates: loads DB, calls gemini_engine, passes to each module

Here are the current files:
[paste relevant files]

Now [your task here]. Do NOT add any Gemini API calls outside of gemini_engine.py.
```

---

## Category 6: Don't Hardcode URLs or Bypass Auth

**AI will often write:**
```typescript
// ❌ Hardcoded URL — NEVER do this
const res = await fetch('https://sortmail-production.up.railway.app/api/threads');

// ❌ No credentials — will break in production
const res = await axios.get('/api/threads');
```

**Always use:**
```typescript
// ✅ Use the central api instance
import { api, endpoints } from '@/lib/api';
const { data } = await api.get(endpoints.threads);
// api already has: baseURL, withCredentials: true
```

**Prompt template:**
```
Here is our axios instance and endpoints (lib/api.ts):

[paste lib/api.ts]

Write a function to POST to the sync endpoint. Use the api instance, not fetch or raw axios.
```

---

## Category 7: Session / Auth Assumptions

Our auth uses **session cookies**, not JWT tokens in headers. AI will often write:

```typescript
// ❌ AI assumes JWT Bearer token
headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
```

**Our actual auth:**
- Backend: session cookie set on login, validated via `Depends(get_current_user)`
- Frontend: `withCredentials: true` on axios — cookie is sent automatically
- Never store tokens in localStorage

---

## Safe Prompting Template

Copy this template for most backend tasks:

```
I'm working on the SortMail codebase (FastAPI backend + Next.js frontend).

Context files:
---
[paste the 1-3 most relevant files COMPLETE, not truncated]
---

Task: [describe exactly what you want]

Constraints:
- Do NOT modify any SQLAlchemy model columns; if needed, just tell me what migration to run
- Use the existing `Depends(get_current_user)` and `Depends(get_db)` patterns
- Do NOT add Gemini API calls outside of core/intelligence/gemini_engine.py
- Do NOT hardcode API URLs; use the endpoints object from lib/api.ts
- Return complete file diffs, not partial snippets
- Ask me to clarify if you're uncertain about any field name or behavior
```

---

## Red Flags to Watch For

When reviewing AI-generated code, reject it if you see:

| Red flag | Problem |
|----------|---------|
| `thread.thread_id` when accessing the Thread model | Model uses `.id`, not `.thread_id` |
| `priority="urgent"` in a Task | Should be `priority_level="do_now"` |
| `ai_confidence=0.85` | Must be int: `ai_confidence=85` |
| `import os; os.getenv("GEMINI_API_KEY")` | Use `from app.config import settings; settings.GEMINI_API_KEY` |
| `axios.create({ baseURL: "https://..." })` | Use existing `api` from `lib/api.ts` |
| Any `create_all()` or `drop_all()` | Use Alembic migrations only |
| LLM call outside `gemini_engine.py` | Breaks the intelligence pipeline architecture |
| `import threading` or `asyncio.run()` inside a route | Use FastAPI's `BackgroundTasks` instead |
