# Railway Log Sanitization - Security Update

## Summary

This update removes sensitive data leaks from Railway logs by implementing:

1. **Automatic Log Sanitization** - Removes API keys, tokens, credentials from all logs
2. **Production-Mode Logging** - Suppresses debug logs and verbose output in production
3. **Exception Masking** - Hides internal errors in production error responses
4. **HTTP Header Filtering** - Prevents sensitive headers from appearing in access logs
5. **Configuration Hardening** - Sets DEBUG=False by default

## Changes Made

### 1. New Log Sanitization Module (`core/logging/sanitizer.py`)
- **SensitiveDataSanitizer**: Intercepts all logging and removes:
  - API keys and tokens (including JWT tokens)
  - Database connection strings
  - AWS/Azure credentials
  - Email addresses (masked)
  - OAuth secrets
  - Encryption keys
  - Credit card numbers
  - Internal IP addresses

- **setup_secure_logging()**: Configures logging based on environment:
  - **Production**: WARNING level only (no DEBUG logs)
  - **Staging**: INFO level
  - **Development**: DEBUG level (for troubleshooting)

### 2. Config Changes (`app/config.py`)
- **DEBUG: bool = False** (was True) - Disabled by default for security
- Only enable DEBUG in development environments

### 3. Main.py Updates (`app/main.py`)
- Replaced print() statements with logger calls
- Integrated SensitiveDataSanitizer into logging setup
- Updated exception handler to hide internal errors in production
- Added SanitizedAccessLogMiddleware to filter sensitive headers

### 4. Security Middleware Update (`api/middleware/security.py`)
- Added **SanitizedAccessLogMiddleware** to suppress logging of:
  - Authorization headers
  - Cookies
  - API keys
  - CSRF tokens
  - Internal service tokens

## Environment Variable Setup for Railway Deployment

### 1. Verify These Variables Are Set:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# JWT & Security
JWT_SECRET=<strong-random-value>           # Generate: openssl rand -hex 32
ENCRYPTION_KEY=<base64-32-bytes>           # Generate: python -c "import secrets; import base64; print(base64.b64encode(secrets.token_bytes(32)).decode())"
INTERNAL_SERVICE_TOKEN=<strong-random>     # Generate: openssl rand -hex 32

# OAuth Secrets
GOOGLE_CLIENT_SECRET=<from-console>
MICROSOFT_CLIENT_SECRET=<from-console>

# Environment
ENVIRONMENT=production                      # Or staging/development
DEBUG=false                                 # CRITICAL: Ensure false in production

# Disable API Docs in Production
DISABLE_API_DOCS_IN_PRODUCTION=true
```

### 2. What NOT to Log

The sanitizer will automatically redact (even if they somehow appear in logs):
- `DATABASE_URL=postgresql://user:***REDACTED***:5432/db`
- `JWT_SECRET=***REDACTED***`
- `Authorization: Bearer ey***REDACTED***`
- `X-Internal-Service-Token: ***REDACTED***`
- `api_key: ***REDACTED***`

## Railway-Specific Configuration

### 1. Suppress Uvicorn Access Logs

When deploying with Uvicorn, suppress verbose HTTP access logs:

```bash
# Option A: Set via environment variable in Railway
PYTHONUNBUFFERED=1

# Option B: Update run command in railway.json or Dockerfile:
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "warning"]
```

OR in Dockerfile:
```dockerfile
ENV PYTHONUNBUFFERED=1
# Suppress uvicorn access logs in production
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "warning", "--access-log"]
```

### 2. Monitor Railway Logs

Check that logs no longer contain:
```bash
# ❌ BAD (Before sanitization):
ERROR|api|DatabaseError: postgresql://user:mysecret@db.internal:5432/sortmail
ERROR|api|JWT_SECRET=my-secret-key-12345

# ✅ GOOD (After sanitization):
ERROR|api|DatabaseError: postgresql://user:***REDACTED***:5432/sortmail
ERROR|api|JWT_SECRET=***REDACTED***
```

## Testing the Sanitization

```bash
# Test locally that logs are sanitized:
DATABASE_URL="postgresql://user:mypassword@localhost:5432/db" \
ENVIRONMENT=production \
DEBUG=false \
python -c "from core.logging.sanitizer import SensitiveDataSanitizer; s = SensitiveDataSanitizer(); print(s._sanitize_string('postgresql://user:mypassword@localhost:5432/db'))"

# Expected output:
# postgresql://user:***REDACTED***:5432/db
```

## Logging Levels Reference

- **DEBUG**: Detailed troubleshooting info (development only)
- **INFO**: General informational messages (staging/development)
- **WARNING**: Warning messages and errors (production)
- **CRITICAL**: Critical errors only

### Log Level by Environment

| Environment | Log Level | Purpose |
|-------------|-----------|---------|
| development | DEBUG | Full debugging visibility |
| staging | INFO | Important events only |
| production | WARNING | Warnings and errors only |

## Security Checklist Before Deploying to Railway

- [ ] DEBUG=false is set in Railway environment
- [ ] ENVIRONMENT=production is set
- [ ] DISABLE_API_DOCS_IN_PRODUCTION=true is set
- [ ] INTERNAL_SERVICE_TOKEN is set to a strong random value
- [ ] All API keys/secrets are stored in Railway secrets (not in code)
- [ ] Database URL is in secrets (not hardcoded)
- [ ] Verified sensitive data doesn't appear in Railway logs
- [ ] Ran a test request and checked Railway logs for leaks
- [ ] Confirmed /docs endpoint returns 404 in production

## Production Deployment Checklist

```bash
# 1. Rebuild backend and test imports
cd backend
python -c "from app.main import app; print('✅ Backend imports OK')"

# 2. Build frontend
cd ../frontend
npm run build

# 3. Review none of these appear in logs:
#    - JWT_SECRET
#    - API keys
#    - Database URLs
#    - Bearer tokens
#    - Email addresses (should be masked)

# 4. Deploy to Railway
# 5. Monitor logs for 5 minutes
# 6. Confirm no sensitive data leaks
```

## Rollback Instructions

If issues occur:

1. Set `ENVIRONMENT=development` temporarily to see debug logs
2. Check backend logs for import errors: `docker logs <container>`
3. Verify PostgreSQL connectivity
4. Revert config.py DEBUG flag if needed

## Performance Impact

- **Minimal**: Sanitization runs once per log entry
- **Regex matching**: O(n) where n = log message length
- **Production**: Disabled expensive DEBUG logging anyway

## Questions?

- Check Railway logs in the Railway dashboard
- Review `core/logging/sanitizer.py` for what's being redacted
- Test locally with `DEBUG=true` for detailed output
