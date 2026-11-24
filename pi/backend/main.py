"""
Entrypoint for the FastAPI application.
Re-exports `app` from `app.main` so running:
  uvicorn main:app
or
  uvicorn app.main:app
both work seamlessly.
"""
from app.main import app

__all__ = ["app"]
