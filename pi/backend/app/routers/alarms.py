from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models.alarm import Alarm, AlarmCreate, AlarmRead, AlarmUpdate
from app.models.command import ActiveDisplayState
from app.state import get_active_display, set_active_display

router = APIRouter(prefix="/api/alarms", tags=["alarms"])


@router.get("", response_model=List[AlarmRead])
def list_alarms(session: Session = Depends(get_session)):
    statement = select(Alarm)
    alarms = session.exec(statement).all()
    return alarms


@router.post("", response_model=AlarmRead)
def create_alarm(alarm_in: AlarmCreate, session: Session = Depends(get_session)):
    alarm = Alarm.model_validate(alarm_in)
    session.add(alarm)
    session.commit()
    session.refresh(alarm)
    return alarm


@router.get("/{alarm_id}", response_model=AlarmRead)
def get_alarm(alarm_id: str, session: Session = Depends(get_session)):
    alarm = session.get(Alarm, alarm_id)
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    return alarm


@router.put("/{alarm_id}", response_model=AlarmRead)
def update_alarm(alarm_id: str, updated_in: AlarmUpdate, session: Session = Depends(get_session)):
    alarm = session.get(Alarm, alarm_id)
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")

    update_data = updated_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(alarm, key, value)

    session.add(alarm)
    session.commit()
    session.refresh(alarm)
    return alarm


@router.delete("/{alarm_id}")
def delete_alarm(alarm_id: str, session: Session = Depends(get_session)):
    alarm = session.get(Alarm, alarm_id)
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    session.delete(alarm)
    session.commit()
    return {"message": "Alarm deleted", "id": alarm_id}


@router.post("/{alarm_id}/toggle", response_model=AlarmRead)
def toggle_alarm(alarm_id: str, session: Session = Depends(get_session)):
    alarm = session.get(Alarm, alarm_id)
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    alarm.enabled = not alarm.enabled
    session.add(alarm)
    session.commit()
    session.refresh(alarm)
    return alarm


@router.post("/active/dismiss")
def dismiss_active_alarm():
    current_display = get_active_display()
    if current_display.type == "alarm":
        set_active_display(ActiveDisplayState(type="clock"))
    return {"message": "Alarm dismissed"}


@router.post("/active/snooze")
def snooze_active_alarm(minutes: int = 9, session: Session = Depends(get_session)):
    current_display = get_active_display()
    snooze_until = datetime.now() + timedelta(minutes=minutes)
    snooze_time = snooze_until.strftime("%H:%M")
    label = f"Snoozed ({current_display.alarm.label if current_display.alarm else 'Alarm'})"

    snoozed_alarm = Alarm(
        time=snooze_time,
        label=label,
        days=["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
        enabled=True,
    )
    session.add(snoozed_alarm)
    session.commit()
    session.refresh(snoozed_alarm)

    set_active_display(ActiveDisplayState(type="clock"))
    return {
        "message": f"Snoozed for {minutes} minutes",
        "snoozed_until": snooze_time,
    }
