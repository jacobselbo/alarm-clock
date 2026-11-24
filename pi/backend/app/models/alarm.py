import uuid
from typing import List, Optional
from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel


class AlarmBase(SQLModel):
    time: str = Field(index=True)  # Format: "HH:MM"
    label: str = Field(default="Alarm")
    days: List[str] = Field(
        default_factory=lambda: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        sa_column=Column(JSON, nullable=False),
    )
    enabled: bool = Field(default=True, index=True)
    sound: str = Field(default="chime")


class Alarm(AlarmBase, table=True):
    __tablename__ = "alarms"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
    )


class AlarmCreate(SQLModel):
    time: str
    label: str = "Alarm"
    days: List[str] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    enabled: bool = True
    sound: str = "chime"


class AlarmRead(AlarmBase):
    id: str


class AlarmUpdate(SQLModel):
    time: Optional[str] = None
    label: Optional[str] = None
    days: Optional[List[str]] = None
    enabled: Optional[bool] = None
    sound: Optional[str] = None
