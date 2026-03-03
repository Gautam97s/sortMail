import asyncio
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
url = os.environ.get('DATABASE_URL').replace('postgresql+asyncpg://', 'postgresql://')
conn = psycopg2.connect(url)
cur = conn.cursor()
try:
    cur.execute("SELECT 1 FROM emails WHERE 'test' = ANY recipients LIMIT 1")
    print("No parens worked!")
except Exception as e:
    print("No parens failed:", e)
    conn.rollback()

try:
    cur.execute("SELECT 1 FROM emails WHERE 'test' = ANY (recipients) LIMIT 1")
    print("Parens worked!")
except Exception as e:
    print("Parens failed:", e)

cur.close()
conn.close()
