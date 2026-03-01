# Sortmail Integration Guide (Frontend & Backend)

This document outlines the architecture and integration patterns established for the Sortmail application.

## 🏗️ System Architecture

Sortmail follows a decoupled architecture with a **FastAPI** backend and a **Next.js** frontend.

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy (PostgreSQL), Redis (AI Queue), Uvicorn.
- **Frontend**: React 18, Next.js 14, Tailwind CSS, GSAP (Animations), Lucide React.
- **Intelligence**: Google Gemini (AI Engine), ChromaDB (Vector Search).

## 📡 API Communication

### Base URL
- **Local Development**: `http://localhost:8000`
- **Frontend Access**: The frontend uses `process.env.NEXT_PUBLIC_API_URL` to point to the backend.

### Authentication Flow
Authentication is handled via JWT stored in **HttpOnly, SameSite=Lax** cookies.

1. **OAuth (Google/Outlook)**:
   - Frontend: `GET /api/auth/{provider}` returns an `auth_url`.
   - Backend: Handles callback, creates/updates user, and sets `access_token` cookie.
   - Redirect: User is redirected back to `/dashboard`.

2. **Session Persistence**:
   - The frontend `useDashboard` and `useThreads` hooks check `/api/auth/me`.
   - If unauthorized (401), the frontend redirects to `/login`.

## ⚙️ Environment Configuration

### Backend `.env` Essentials
```bash
DATABASE_URL="postgresql://..." # Supabase/Postgres
CORS_ORIGINS='["http://localhost:3000"]' # MUST be a JSON list
JWT_SECRET="your-secure-key"
REDIS_URL="rediss://..." # For AI worker
GEMINI_API_KEY="your-key"
```

### Frontend `.env.local`
```bash
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

## 🛠️ Local Development Setup

### 1. Start Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📝 Key Integration Points

| Feature | Backend Endpoint | Frontend Service/Hook |
| :--- | :--- | :--- |
| **Authentication** | `/api/auth/` | `src/lib/api.ts` |
| **Dashboard Stats** | `/api/dashboard/` | `useDashboard()` |
| **Email Threads** | `/api/threads/` | `useThreads()` |
| **AI Summaries** | `/api/ai/summarize` | `SummaryPanel.tsx` |
| **Tasks** | `/api/tasks/` | `useTasks()` |

## 🛡️ Security Notes
- **CORS**: Correctly configured to allow `localhost:3000` in development and designated domains in production.
- **CSRF**: Mitigated by HttpOnly cookies and SameSite settings.
- **Data Integrity**: Mock data in `frontend/src/data/threads.ts` and `mockData.ts` is synchronized with `backend/contracts/` to ensure typing consistency.
