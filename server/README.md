# Remote Server (Placeholder)

This folder will house the bare-bones server that sends commands (like custom messages, GIFs, or photos) to the Raspberry Pi alarm clock.

## Interacting with the Pi Alarm Clock

The Raspberry Pi FastAPI backend exposes the following command endpoints:

### 1. Send Custom Message
```bash
curl -X POST http://<PI_IP>:8000/api/commands/message \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Good morning! Time for coffee ☕",
    "sender": "Server",
    "duration_seconds": 30
  }'
```

### 2. Send Photo or GIF
```bash
curl -X POST http://<PI_IP>:8000/api/commands/media \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://media.giphy.com/media/mGj3SVN7xbPQ4/giphy.gif",
    "caption": "Rise and shine!",
    "media_type": "gif",
    "duration_seconds": 30
  }'
```

### 3. Clear / Dismiss Display
```bash
curl -X POST http://<PI_IP>:8000/api/commands/dismiss
```

See `example_sender.py` for a Python script demonstration.
