import os
from google import genai
from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

print("Listing models:")
for m in client.models.list():
    print(m.name)
