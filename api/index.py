import os
import sys
from pathlib import Path

# Add project root to sys.path so 'backend' can be imported
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Ensure NLTK uses /tmp on serverless environments
nltk_data_dir = os.environ.get("NLTK_DATA", os.path.join(os.environ.get("TMPDIR", "/tmp"), "nltk_data"))
try:
    os.makedirs(nltk_data_dir, exist_ok=True)
except Exception:
    pass

import nltk
if nltk_data_dir not in nltk.data.path:
    nltk.data.path.insert(0, nltk_data_dir)

# Import the FastAPI application
from backend.server import app

# In Vercel, requests to /api/xyz might arrive at the ASGI app as /api/xyz or as /xyz.
# Since backend.server defines routes starting with /api/ (e.g. /api/ytb-t01),
# we ensure that requests without the /api prefix are routed correctly.
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class VercelRouteMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.scope.get("path", "")
        # If Vercel stripped '/api' from the incoming path, add it back so it matches the FastAPI routes
        if not path.startswith("/api") and path != "/health" and path != "/docs" and path != "/openapi.json":
            request.scope["path"] = "/api" + path
        response = await call_next(request)
        return response

app.add_middleware(VercelRouteMiddleware)
