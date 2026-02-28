# Team A — Backend Core
# First Week TODO List

## Day 1-2: Database Setup
- [ ] Review all models in `backend/models/`
- [ ] Create initial Alembic migration: `alembic revision --autogenerate -m "initial"`
- [ ] Test migration: `alembic upgrade head`
- [ ] Verify all 13 tables created in PostgreSQL

## Day 3-4: Auth Skeleton
- [ ] Get Google Cloud Console project
- [ ] Configure OAuth consent screen
- [ ] Get client ID + secret → add to `.env`
- [ ] Implement `oauth_google.py`:
  - [ ] `get_authorization_url()`
  - [ ] `exchange_code_for_tokens()`
  - [ ] `get_user_info()`
- [ ] Test: `/api/auth/google` returns correct OAuth URL

## Day 5-6: JWT + Session
- [ ] Implement JWT creation in `jwt.py`
- [ ] Implement JWT validation middleware
- [ ] Store user in DB after OAuth callback
- [ ] Test: Login → get JWT → access protected route

## Day 7: Integration
- [ ] Test full auth flow end-to-end
- [ ] Document any blockers
- [ ] Prepare for Week 2 demo

---

## Key Files to Edit

```
backend/core/auth/
├── jwt.py              ← EDIT: Real implementation
├── oauth_google.py     ← EDIT: Real Google OAuth
└── oauth_microsoft.py  ← Week 3 (skip for now)

backend/models/
├── user.py             ← REVIEW: Check fields
└── connected_account.py ← REVIEW: Check fields

backend/api/routes/
└── auth.py             ← EDIT: Real endpoints
```

---

## Test Commands

```bash
# Run backend
cd backend
uvicorn app.main:app --reload

# Test health
curl http://localhost:8000/health

# Test auth URL
curl http://localhost:8000/api/auth/google

# Run tests
pytest tests/ -v
```

---

## Environment Variables Needed

```env
# .env file
DATABASE_URL=postgresql://sortmail:sortmail@localhost:5432/sortmail
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
JWT_SECRET=generate-a-random-string
```
