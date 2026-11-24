import asyncio
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.database import init_db
from app.routers import alarms, commands, status
from app.state import alarm_checker_loop


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and create tables
    init_db()
    # Start background alarm checker task
    checker_task = asyncio.create_task(alarm_checker_loop())
    yield
    # Cleanup on shutdown
    checker_task.cancel()


app = FastAPI(
    title="Raspberry Pi Alarm Clock API",
    version="0.2.0",
    description="FastAPI backend powered by SQLModel and SQLite for Raspberry Pi alarm clock",
    lifespan=lifespan,
)

# Enable CORS for local development and Pi kiosk browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(status.router)
app.include_router(alarms.router)
app.include_router(commands.router)

# Serve bundled React frontend in production if static/ directory is present
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
if STATIC_DIR.is_dir():
    assets_dir = STATIC_DIR / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_frontend(full_path: str):
        if full_path.startswith("api/") or full_path == "api":
            raise HTTPException(status_code=404, detail="API endpoint not found")

        requested_file = (STATIC_DIR / full_path).resolve()
        if full_path and requested_file.is_file() and requested_file.is_relative_to(STATIC_DIR.resolve()):
            return FileResponse(requested_file)

        index_file = STATIC_DIR / "index.html"
        if index_file.is_file():
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend not found")
