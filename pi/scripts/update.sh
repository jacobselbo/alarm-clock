#!/usr/bin/env bash
set -euo pipefail

# Raspberry Pi Alarm Clock - Auto-Updater & Runner
# Checks GitHub Releases for a newer bundled release, downloads and installs it
# while preserving the local SQLite database, and restarts the server.

GITHUB_REPO="${GITHUB_REPO:-}"
INSTALL_DIR="${INSTALL_DIR:-$HOME/alarm-clock-pi}"
PORT="${PORT:-8000}"
SYSTEMD_SERVICE="${SYSTEMD_SERVICE:-}"
ASSET_NAME="alarm-clock-pi.tar.gz"
FORCE=false
CHECK_ONLY=false

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Check for a new Raspberry Pi Alarm Clock release on GitHub, download, install, and restart.

Options:
  -r, --repo <owner/repo>   GitHub repository (or set GITHUB_REPO env var)
  -d, --dir <path>          Installation directory (default: $INSTALL_DIR)
  -p, --port <port>         Port to run uvicorn on (default: $PORT)
  -s, --service <name>      Optional systemd service name to restart
  -f, --force               Force download & reinstall even if already on latest version
      --check-only          Only check if a new release is available without installing
  -h, --help                Show this help message
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -r|--repo)
      GITHUB_REPO="$2"
      shift 2
      ;;
    -d|--dir)
      INSTALL_DIR="$2"
      shift 2
      ;;
    -p|--port)
      PORT="$2"
      shift 2
      ;;
    -s|--service)
      SYSTEMD_SERVICE="$2"
      shift 2
      ;;
    -f|--force)
      FORCE=true
      shift
      ;;
    --check-only)
      CHECK_ONLY=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

# Auto-detect GitHub repo from git remote if not provided
if [[ -z "$GITHUB_REPO" ]] && command -v git >/dev/null 2>&1; then
  REMOTE_URL="$(git remote get-url origin 2>/dev/null || true)"
  if [[ "$REMOTE_URL" =~ github\.com[:/]([^/]+/[^/.]+)(\.git)?$ ]]; then
    GITHUB_REPO="${BASH_REMATCH[1]}"
  fi
fi

if [[ -z "$GITHUB_REPO" ]]; then
  echo "Error: GITHUB_REPO is required (pass -r owner/repo or set GITHUB_REPO)." >&2
  exit 1
fi

for cmd in curl tar python3 uv; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: Required command '$cmd' not found in PATH." >&2
    exit 1
  fi
done

API_URL="https://api.github.com/repos/${GITHUB_REPO}/releases/latest"
CURL_AUTH_ARGS=()
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  CURL_AUTH_ARGS=(-H "Authorization: Bearer ${GITHUB_TOKEN}")
fi

echo "Checking latest release for ${GITHUB_REPO}..."
RELEASE_JSON="$(curl -fsSL -H "Accept: application/vnd.github+json" "${CURL_AUTH_ARGS[@]}" "$API_URL")"

# Parse tag_name, bundle URL, and optional SHA256SUMS URL using python3
PARSED_INFO="$(python3 -c '
import json, sys
data = json.loads(sys.stdin.read())
tag = data.get("tag_name", "")
assets = {a["name"]: a["browser_download_url"] for a in data.get("assets", [])}
bundle_url = assets.get(sys.argv[1], "")
sha_url = assets.get("SHA256SUMS", "")
print(tag)
print(bundle_url)
print(sha_url)
' "$ASSET_NAME" <<< "$RELEASE_JSON")"

LATEST_TAG="$(echo "$PARSED_INFO" | sed -n '1p')"
BUNDLE_URL="$(echo "$PARSED_INFO" | sed -n '2p')"
SHA_URL="$(echo "$PARSED_INFO" | sed -n '3p')"

if [[ -z "$LATEST_TAG" || -z "$BUNDLE_URL" ]]; then
  echo "Error: Could not find tag or asset '$ASSET_NAME' in latest release." >&2
  exit 1
fi

CURRENT_VERSION=""
if [[ -f "${INSTALL_DIR}/VERSION" ]]; then
  CURRENT_VERSION="$(tr -d '[:space:]' < "${INSTALL_DIR}/VERSION")"
fi

echo "Current version: ${CURRENT_VERSION:-<none>}"
echo "Latest version:  ${LATEST_TAG}"

if [[ "$CURRENT_VERSION" == "$LATEST_TAG" && "$FORCE" != true ]]; then
  echo "Already up to date (${LATEST_TAG})."
  exit 0
fi

if [[ "$CHECK_ONLY" == true ]]; then
  echo "Update available: ${CURRENT_VERSION:-<none>} -> ${LATEST_TAG}"
  exit 0
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Downloading ${ASSET_NAME} (${LATEST_TAG})..."
curl -fsSL -L "${CURL_AUTH_ARGS[@]}" -o "${TMP_DIR}/${ASSET_NAME}" "$BUNDLE_URL"

if [[ -n "$SHA_URL" ]]; then
  echo "Verifying checksum..."
  curl -fsSL -L "${CURL_AUTH_ARGS[@]}" -o "${TMP_DIR}/SHA256SUMS" "$SHA_URL"
  if command -v sha256sum >/dev/null 2>&1; then
    (cd "$TMP_DIR" && sha256sum -c SHA256SUMS)
  elif command -v shasum >/dev/null 2>&1; then
    (cd "$TMP_DIR" && shasum -a 256 -c SHA256SUMS)
  else
    echo "Warning: sha256sum/shasum not found; skipping checksum verification."
  fi
fi

EXTRACT_DIR="${TMP_DIR}/extracted"
mkdir -p "$EXTRACT_DIR"
tar -xzf "${TMP_DIR}/${ASSET_NAME}" -C "$EXTRACT_DIR"

# Stop existing process if not managed by systemd
PID_FILE="${INSTALL_DIR}/alarm-clock.pid"
if [[ -z "$SYSTEMD_SERVICE" && -f "$PID_FILE" ]]; then
  OLD_PID="$(cat "$PID_FILE" || true)"
  if [[ -n "$OLD_PID" ]] && kill -0 "$OLD_PID" 2>/dev/null; then
    echo "Stopping running alarm-clock process (PID $OLD_PID)..."
    kill "$OLD_PID" || true
    for _ in {1..10}; do
      if ! kill -0 "$OLD_PID" 2>/dev/null; then
        break
      fi
      sleep 0.5
    done
    if kill -0 "$OLD_PID" 2>/dev/null; then
      kill -9 "$OLD_PID" || true
    fi
  fi
  rm -f "$PID_FILE"
fi

echo "Installing to ${INSTALL_DIR}..."
mkdir -p "${INSTALL_DIR}/backend/data" "${INSTALL_DIR}/scripts"

# Replace code/static files while preserving backend/data/ (SQLite DB) and .venv
rm -rf "${INSTALL_DIR}/backend/app" "${INSTALL_DIR}/backend/static"
cp -r "${EXTRACT_DIR}/backend/app" "${INSTALL_DIR}/backend/"
cp -r "${EXTRACT_DIR}/backend/static" "${INSTALL_DIR}/backend/"
cp "${EXTRACT_DIR}/backend/main.py" "${INSTALL_DIR}/backend/"
cp "${EXTRACT_DIR}/backend/pyproject.toml" "${INSTALL_DIR}/backend/"
cp "${EXTRACT_DIR}/backend/uv.lock" "${INSTALL_DIR}/backend/"
cp "${EXTRACT_DIR}/backend/.python-version" "${INSTALL_DIR}/backend/"
cp "${EXTRACT_DIR}/backend/README.md" "${INSTALL_DIR}/backend/"

cp -r "${EXTRACT_DIR}/scripts/"* "${INSTALL_DIR}/scripts/"
chmod +x "${INSTALL_DIR}/scripts/"*.sh
cp "${EXTRACT_DIR}/VERSION" "${INSTALL_DIR}/VERSION"

echo "Syncing Python dependencies with uv..."
(cd "${INSTALL_DIR}/backend" && uv sync --frozen)

# Restart or launch the application
if [[ -n "$SYSTEMD_SERVICE" ]]; then
  echo "Restarting systemd service '${SYSTEMD_SERVICE}'..."
  sudo systemctl restart "$SYSTEMD_SERVICE"
else
  echo "Starting alarm-clock backend on port ${PORT}..."
  cd "${INSTALL_DIR}/backend"
  nohup uv run uvicorn main:app --host 0.0.0.0 --port "$PORT" > "${INSTALL_DIR}/alarm-clock.log" 2>&1 &
  NEW_PID=$!
  echo "$NEW_PID" > "$PID_FILE"
  echo "Started with PID ${NEW_PID}. Logs: ${INSTALL_DIR}/alarm-clock.log"
fi

echo "Successfully updated to ${LATEST_TAG}."
