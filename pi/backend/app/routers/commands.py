from datetime import datetime, timedelta
from fastapi import APIRouter

from app.models.command import ActiveDisplayState, MediaCommand, MessageCommand
from app.state import set_active_display

router = APIRouter(prefix="/api/commands", tags=["commands"])


@router.post("/message")
def post_message(cmd: MessageCommand):
    expires_at = datetime.now() + timedelta(seconds=cmd.duration_seconds)
    display_state = ActiveDisplayState(
        type="message",
        message=cmd,
        expires_at=expires_at.isoformat(),
    )
    set_active_display(display_state)
    return {"message": "Message sent to Pi display", "expires_at": expires_at.isoformat()}


@router.post("/media")
def post_media(cmd: MediaCommand):
    expires_at = datetime.now() + timedelta(seconds=cmd.duration_seconds)
    display_state = ActiveDisplayState(
        type="media",
        media=cmd,
        expires_at=expires_at.isoformat(),
    )
    set_active_display(display_state)
    return {"message": "Media sent to Pi display", "expires_at": expires_at.isoformat()}


@router.post("/dismiss")
def dismiss_display():
    set_active_display(ActiveDisplayState(type="clock"))
    return {"message": "Display cleared to clock"}
