from pathlib import Path
from typing import Generator
from sqlmodel import Session, SQLModel, create_engine, select

from app.models.alarm import Alarm

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATABASE_FILE = DATA_DIR / "alarm_clock.db"

# Ensure data directory exists
DATA_DIR.mkdir(parents=True, exist_ok=True)

sqlite_url = f"sqlite:///{DATABASE_FILE}"
connect_args = {"check_same_thread": False}

engine = create_engine(sqlite_url, echo=False, connect_args=connect_args)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)

    # Seed default alarms if table is empty
    with Session(engine) as session:
        statement = select(Alarm)
        existing_alarm = session.exec(statement).first()
        if not existing_alarm:
            default_alarms = [
                Alarm(
                    time="07:00",
                    label="Morning Alarm",
                    days=["mon", "tue", "wed", "thu", "fri"],
                    enabled=True,
                ),
                Alarm(
                    time="08:30",
                    label="Weekend Alarm",
                    days=["sat", "sun"],
                    enabled=False,
                ),
            ]
            for alarm in default_alarms:
                session.add(alarm)
            session.commit()


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
