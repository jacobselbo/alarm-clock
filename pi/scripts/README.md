# Raspberry Pi Scripts

## `update.sh`

Checks GitHub Releases for a newer bundled release (`alarm-clock-pi.tar.gz`), downloads and verifies it, preserves your local SQLite database (`backend/data/alarm_clock.db`), installs Python dependencies with `uv`, and restarts the server.

### Usage

```bash
./update.sh -r <owner>/<repo>
```

#### Options
- `-r, --repo <owner/repo>`: GitHub repository (or set `GITHUB_REPO` env var; auto-detected if run inside a git clone).
- `-d, --dir <path>`: Installation directory (default: `~/alarm-clock-pi`).
- `-p, --port <port>`: Port for Uvicorn (default: `8000`).
- `-s, --service <name>`: Optional systemd service name to restart via `sudo systemctl restart <name>`.
- `-f, --force`: Reinstall even if already on the latest version.
- `--check-only`: Check for updates without downloading or installing.

### Automating Checks with Cron

To check for updates every hour on the Raspberry Pi:

```cron
0 * * * * /home/pi/alarm-clock-pi/scripts/update.sh -r <owner>/<repo> >> /home/pi/alarm-clock-pi/update.log 2>&1
```
