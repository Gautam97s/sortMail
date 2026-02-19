import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.getcwd())

from app.main import lifespan
from fastapi import FastAPI

async def main():
    print("Testing startup...")
    app = FastAPI(lifespan=lifespan)
    # Trigger lifespan
    async with lifespan(app):
        print("Startup successful")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        import traceback
        with open("error.log", "w") as f:
            traceback.print_exc(file=f)
        print("Error occurred, check error.log")
