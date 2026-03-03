import os
import sys
from collections import defaultdict

# Add the backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

def check_routes():
    routes = []
    for route in app.routes:
        if hasattr(route, 'methods'):
            for method in route.methods:
                routes.append(f"{method} {route.path}")

    route_counts = defaultdict(int)
    for route in routes:
        route_counts[route] += 1

    duplicates = {route: count for route, count in route_counts.items() if count > 1}

    print("--- ALL REGISTERED ROUTES ---")
    for route in sorted(routes):
        print(route)

    print("\n--- DUPLICATES ---")
    if duplicates:
        for route, count in duplicates.items():
            print(f"DUPLICATE: {route} (registered {count} times)")
    else:
        print("No duplicate routes found!")

if __name__ == "__main__":
    check_routes()
