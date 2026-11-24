import asyncio
from datetime import datetime, timedelta
from sqlmodel import Session, select

from app.database import engine
from app.models.alarm import Alarm, AlarmRead
from app.models.command import ActiveDisplayState

active_display: ActiveDisplayState = ActiveDisplayState()
last_triggered_minute: str = ""


def get_active_display() -> ActiveDisplayState:
    return active_display


def set_active_display(state: ActiveDisplayState) -> None:
    global active_display
    active_display = state


async def alarm_checker_loop():
    global active_display, last_triggered_minute
    day_map = {0: "mon", 1: "tue", 2: "wed", 3: "thu", 4: "fri", 5: "sat", 6: "sun"}

    while True:
        now = datetime.now()
        current_time_str = now.strftime("%H:%M")
        current_day = day_map[now.weekday()]

        # Expire temporary message/media commands
        if active_display.expires_at:
            try:
                exp = datetime.fromisoformat(active_display.expires_at)
                if now >= exp and active_display.type in ("message", "media"):
                    active_display = ActiveDisplayState(type="clock")
            except Exception:
                pass

        # Check if an alarm should trigger this minute
        if current_time_str != last_triggered_minute:
            try:
                with Session(engine) as session:
                    statement = select(Alarm).where(
                        Alarm.enabled == True,  # noqa: E712
                        Alarm.time == current_time_str,
                    )
                    matching_alarms = session.exec(statement).all()
                    for alarm in matching_alarms:
                        if current_day in alarm.days:
                            last_triggered_minute = current_time_str
                            active_display = ActiveDisplayState(
                                type="alarm",
                                alarm=AlarmRead.model_validate(alarm),
                                expires_at=(now + timedelta(minutes=5)).isoformat(),
                            )
                            break
            except Exception:
                pass

        await asyncio.sleep(1)
