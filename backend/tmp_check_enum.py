import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
url = os.environ.get('DATABASE_URL').replace('postgresql+asyncpg://', 'postgresql://')
conn = psycopg2.connect(url)
cur = conn.cursor()
cur.execute("SELECT data_type, udt_name FROM information_schema.columns WHERE table_name = 'drafts' AND column_name = 'status';")
print(cur.fetchone())
cur.close()
conn.close()
