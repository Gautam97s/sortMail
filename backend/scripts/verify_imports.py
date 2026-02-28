import sys
import os
import importlib
import pkgutil

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Mock environment variables for Settings
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://user:pass@localhost/db")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
os.environ.setdefault("OPENAI_API_KEY", "sk-mock-key")
os.environ.setdefault("GOOGLE_CLIENT_ID", "mock-client-id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "mock-client-secret")
os.environ.setdefault("GOOGLE_REDIRECT_URI", "http://localhost:3000/auth/callback/google")
os.environ.setdefault("MICROSOFT_REDIRECT_URI", "http://localhost:3000/auth/callback/microsoft")
os.environ.setdefault("JWT_SECRET", "mock-jwt-secret")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")
os.environ.setdefault("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
os.environ.setdefault("ENCRYPTION_KEY", "mock-encryption-key-must-be-32-bytes-long!")


def check_imports():
    print("Verifying imports for backend modules...")
    
    # modules_to_check = [
    #     "api.routes.auth",
    #     "api.routes.emails",
    #     "api.routes.threads",
    #     "api.routes.tasks",
    #     "api.routes.drafts",
    #     "api.routes.reminders",
    #     "api.routes.dashboard",
    #     "api.routes.admin_credits",
    #     "models",
    #     "contracts"
    # ]

    # Dynamically find all routes
    import api.routes
    package = api.routes
    modules_to_check = []
    for _, name, _ in pkgutil.iter_modules(package.__path__):
        modules_to_check.append(f"api.routes.{name}")

    modules_to_check.extend(["models", "contracts"])

    failed = []
    
    for module_name in modules_to_check:
        try:
            print(f"Checking {module_name}...", end=" ")
            importlib.import_module(module_name)
            print("OK")
        except Exception as e:
            print(f"FAILED: {e}")
            failed.append((module_name, str(e)))
    
    if failed:
        print("\nPropblems found:")
        for m, err in failed:
            print(f"  {m}: {err}")
        sys.exit(1)
    else:
        print("\nAll checked modules imported key.")
        sys.exit(0)

if __name__ == "__main__":
    check_imports()
