# Raspberry Pi Alarm Clock

An interactive alarm clock designed to run on a Raspberry Pi with a touchscreen or HDMI display, paired with a remote command server.

## Architecture

```
alarm-clock/
├── pi/
│   ├── backend/        # Python FastAPI service (managed with uv)
│   │   ├── main.py     # REST API for alarms, status, & remote commands
│   │   ├── data/       # Persisted alarm storage (alarms.json)
│   │   └── pyproject.toml
│   └── frontend/       # React + TypeScript + Vite app
│       ├── src/        # Full-screen clock, alarms manager, & command receiver
│       └── vite.config.ts
└── server/             # Bare-bones server for sending commands (ignored for now)
```

---

## 1. Raspberry Pi Setup (`pi/`)

The Raspberry Pi runs both the FastAPI backend and the React frontend (or serves the built static frontend).

### Backend (`pi/backend`)

The backend is built with FastAPI and uses [`uv`](https://github.com/astral-sh/uv) for fast package management.

```bash
cd pi/backend

# Install dependencies
uv sync

# Start the API server
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### Frontend (`pi/frontend`)

The frontend is a touch-friendly React UI designed for the Pi screen in kiosk mode.

```bash
cd pi/frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

- Local display: `http://localhost:5173`
- Network display: `http://<pi-ip-address>:5173`

> **Pi Kiosk Tip:** On Raspberry Pi OS, you can launch Chromium in full-screen kiosk mode at boot:
> ```bash
> chromium-browser --kiosk --noerrdialogs --disable-infobars http://localhost:5173
> ```

---

## 2. Remote Server (`server/`)

*(Currently placeholder — to be implemented)*

The server will be responsible for triggering commands to the Pi, such as:
- Custom morning messages ("Meeting at 9:00 AM", "Happy Birthday!")
- Daily weather or motivational GIFs / photos
- Remote alert triggers

See [`server/README.md`](file:///Users/selbo/Documents/Programming/alarm-clock/server/README.md) for details on available command endpoints.
