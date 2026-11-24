# Pi Alarm Clock - Frontend

React + TypeScript + Vite frontend for the Raspberry Pi Alarm Clock.

## Features
- **Modern Digital Clock Face**: Real-time clock display with 12h/24h toggle, date, and next alarm pill indicator.
- **Pi Touchscreen / Kiosk Ready**: High contrast, dark mode aesthetic with large readable fonts and touch-friendly controls.
- **Active Alarm Screen**: Visual ringer modal with one-touch "Snooze" (+9 mins) and "Dismiss".
- **Remote Commands Display**: Automatically displays custom messages, photos, and GIFs pushed by the server.
- **Alarm Management Drawer**: Add, toggle, and delete recurring alarms with day-of-week selectors.
- **Server Command Simulator**: Built-in test panel to simulate commands that the remote server will send.

## Running in Development

```bash
npm install
npm run dev
```

The app will be available on:
- Local: `http://localhost:5173`
- Network: `http://<raspberry-pi-ip>:5173` (configured with `host: true` in `vite.config.ts`)

API requests to `/api/*` are automatically proxied to the backend at `http://127.0.0.1:8000`.

## Building for Production

```bash
npm run build
```

The compiled assets will be in `dist/`.
