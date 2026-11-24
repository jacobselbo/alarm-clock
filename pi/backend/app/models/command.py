from typing import Literal, Optional
from pydantic import BaseModel
from .alarm import AlarmRead


class MessageCommand(BaseModel):
    text: str
    sender: Optional[str] = "Server"
    duration_seconds: int = 30
    priority: Literal["normal", "urgent"] = "normal"


class MediaCommand(BaseModel):
    url: str
    caption: Optional[str] = None
    media_type: Literal["image", "gif"] = "image"
    duration_seconds: int = 30


class ActiveDisplayState(BaseModel):
    type: Literal["clock", "alarm", "message", "media"] = "clock"
    alarm: Optional[AlarmRead] = None
    message: Optional[MessageCommand] = None
    media: Optional[MediaCommand] = None
    expires_at: Optional[str] = None
