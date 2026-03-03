"""
Quick ChromaDB connection check.
Run: python scripts/check_chroma.py
"""
import os, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from dotenv import load_dotenv
load_dotenv()

api_key  = os.getenv("CHROMA_API_KEY", "")
tenant   = os.getenv("CHROMA_TENANT", "")
database = os.getenv("CHROMA_DATABASE", "")

print(f"CHROMA_API_KEY  : {api_key[:12]}..." if api_key else "CHROMA_API_KEY  : MISSING")
print(f"CHROMA_TENANT   : {tenant}")
print(f"CHROMA_DATABASE : {database}")
print()

if not api_key or not tenant:
    print("ERROR: Missing config. Set CHROMA_API_KEY and CHROMA_TENANT in .env")
    sys.exit(1)

try:
    import chromadb
    print(f"chromadb version: {chromadb.__version__}")
    print("Connecting...")
    client = chromadb.CloudClient(api_key=api_key, tenant=tenant, database=database)
    print(f"Connected! Listing collections...")
    cols = client.list_collections()
    print(f"Collections: {[c.name for c in cols]}")
    col = client.get_or_create_collection("my_collection")
    count = col.count()
    print(f"'my_collection' document count: {count}")
    print("ChromaDB is working correctly.")
except Exception as e:
    print(f"FAILED: {e}")
    print()
    print("Possible causes:")
    print("  1. API key does not belong to this tenant")
    print("  2. Tenant was deleted or is in a different Chroma account")
    print("  3. Go to https://app.trychroma.com and verify the tenant ID + API key match")
