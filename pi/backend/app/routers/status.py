from datetime import datetime
from fastapi import APIRouter, Depends
from sqlmodel import Session, func, select

from app.database import get_session
from app.models.alarm import Alarm
from app.state import get_active_display

router = APIRouter(prefix="/api", tags=["status"])


@router.get("/health")
def get_health(session: Session = Depends(get_session)):
    alarms_count = session.exec(select(func.count()).select_from(Alarm)).one()
    return {
        "status": "healthy",
        "pi_time": datetime.now().isoformat(),
        "database": "sqlite",
        "alarms_count": alarms_count,
    }


@router.get("/status")
def get_status():
    now = datetime.now()
    return {
        "current_time": now.strftime("%H:%M:%S"),
        "current_date": now.strftime("%Y-%m-%d"),
        "display": get_active_display(),
    }
