# Pi Alarm Clock - Backend

FastAPI backend running locally on the Raspberry Pi, backed by **SQLModel** and **SQLite**.

## Architecture & Directory Structure

```
pi/backend/
├── app/
│   ├── __init__.py
│   ├── database.py       # SQLite connection, engine & table initialization
│   ├── state.py          # In-memory display state & background alarm checking loop
│   ├── models/
│   │   ├── __init__.py
│   │   ├── alarm.py      # SQLModel Alarm table and Pydantic schemas
│   │   └── command.py    # Command & display schemas (Message, Media, DisplayState)
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── alarms.py     # Alarm CRUD, toggle, snooze & dismiss
│   │   ├── commands.py   # Remote server endpoints (/api/commands/message, media, dismiss)
│   │   └── status.py     # System health & current display state (/api/health, /api/status)
│   └── main.py           # FastAPI app instance, CORS & router registration
├── data/
│   └── alarm_clock.db    # SQLite database file (automatically created)
├── main.py               # Root entrypoint re-exporting app
├── pyproject.toml        # Project dependencies managed via uv
└── README.md
```

## Features
- **Database Persistence**: Uses `SQLModel` with SQLite (`data/alarm_clock.db`) for robust persistence across reboots.
- **Modular Routers**: Endpoints separated by domain into `routers/alarms.py`, `routers/commands.py`, and `routers/status.py`.
- **Background Alarm Loop**: Continuously checks scheduled alarms every minute and triggers when matching day/time occurs.
- **Display Command API**: Dedicated endpoints for the remote server to push custom messages, photos, and GIFs to the Pi screen.

## Requirements
- Python 3.11+
- [uv](https://github.com/astral-sh/uv)

## Running the Backend

From this directory:
```bash
# Sync dependencies
uv sync

# Run the server with auto-reload
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at:
- `http://localhost:8000/docs`
