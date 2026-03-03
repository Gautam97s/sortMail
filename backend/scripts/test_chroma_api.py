import requests

url = "http://localhost:8000/api/documents/"
data = {
    "ids": ["1", "2"],
    "documents": ["Hello Chroma from FastAPI!", "Second doc with different metadata"],
    "metadatas": [{ "category": "technology" }, { "category": "example" }]
}
try:
    response = requests.post(url, json=data)
    print("Status:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print(f"Error: {e}")
