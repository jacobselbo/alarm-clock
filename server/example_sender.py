#!/usr/bin/env python3
"""
Example command sender demonstrating how the server can push
messages or media to the Raspberry Pi alarm clock.
"""
import sys
import json
import urllib.request

PI_HOST = "http://localhost:8000"


def send_message(text: str, sender: str = "Server", duration: int = 30):
    url = f"{PI_HOST}/api/commands/message"
    payload = json.dumps({
        "text": text,
        "sender": sender,
        "duration_seconds": duration,
    }).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        print(f"Message sent: {resp.read().decode('utf-8')}")


def send_media(media_url: str, caption: str = "", media_type: str = "image", duration: int = 30):
    url = f"{PI_HOST}/api/commands/media"
    payload = json.dumps({
        "url": media_url,
        "caption": caption,
        "media_type": media_type,
        "duration_seconds": duration,
    }).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        print(f"Media sent: {resp.read().decode('utf-8')}")


if __name__ == "__main__":
    print(f"Sending test command to {PI_HOST}...")
    try:
        send_message("Hello from the remote server!", sender="Home Automation")
    except Exception as e:
        print(f"Failed to connect to Pi (is backend running?): {e}")
