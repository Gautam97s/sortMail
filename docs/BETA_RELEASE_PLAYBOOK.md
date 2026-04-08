# SortMail Beta Release Playbook (Core Features Only)

This playbook keeps core features live for testers while preserving unfinished work for internal accounts.

## 1. Release Channel and Version

- Release tag: `v0.1.0-beta`
- Frontend package version: `0.1.0-beta`
- Backend app version: `0.1.0-beta`

## 2. Feature Gating Strategy

SortMail now supports frontend feature gating with internal tester override:

- External testers see only enabled features.
- Admin users and allowlisted emails always get access.

Environment variables (frontend):

```env
NEXT_PUBLIC_APP_VERSION=0.1.0-beta
NEXT_PUBLIC_RELEASE_CHANNEL=beta
NEXT_PUBLIC_INTERNAL_TESTER_EMAILS=you@yourdomain.com,teammate@yourdomain.com

# Feature gates
NEXT_PUBLIC_ENABLE_CHATBOT=false
NEXT_PUBLIC_ENABLE_SEMANTIC_SEARCH=true
NEXT_PUBLIC_ENABLE_ATTACHMENT_INTEL=true
NEXT_PUBLIC_ENABLE_EXPERIMENTS_CONSOLE=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS_CENTER=true
```

Notes:

- Keep `NEXT_PUBLIC_ENABLE_CHATBOT=false` for external beta while still testing it via internal allowlist.
- Use separate envs for production and local development.

## 3. Monitoring Endpoints

Backend now exposes:

- `GET /health` (comprehensive checks)
  - API
  - Database
  - Redis
  - Vector store
  - AI worker
- `GET /health/simple` (fast uptime probe)

Expected `GET /health` shape:

```json
{
  "status": "healthy",
  "version": "0.1.0-beta",
  "environment": "production",
  "checks": {
    "api": "healthy",
    "database": "healthy",
    "redis": "healthy",
    "vector_store": "healthy",
    "ai_worker": "healthy"
  }
}
```

## 4. Monitoring Stack (Lean)

- Error tracking: Sentry
- Uptime: UptimeRobot (`/health/simple`)
- Service health: `/health` in admin monitoring panel
- Logs: structured backend logs to stdout or Better Stack

## 5. Release Steps

1. Set production env with beta gates.
2. Deploy backend and verify:
   - `/health/simple` returns `ok`
   - `/health` reports healthy/degraded with detailed checks
3. Deploy frontend and verify hidden/gated features from non-internal account.
4. Verify internal override from admin or allowlisted account.
5. Tag release:

```bash
git tag -a v0.1.0-beta -m "Core beta release"
git push origin v0.1.0-beta
```

## 6. What Is Safe for Beta Now

Ship enabled core modules only:

- Email engine
- Attachment intelligence
- Auto draft
- Task engine (priority/reminder/Kanban)
- Credits and Stripe flows
- Admin metrics (`/admin`)

Gate everything else with feature flags instead of deleting code.
