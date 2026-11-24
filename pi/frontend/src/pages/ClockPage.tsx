import { AlarmClock, Bell } from 'lucide-react'
import type { Alarm } from '../types'
import { formatAlarmTime } from '../utils/time'
import './ClockPage.css'

interface ClockPageProps {
  displayHours: string
  minutes: string
  seconds: string
  ampm: string
  dateString: string
  is24Hour: boolean
  nextAlarm: Alarm | null
  enabledAlarmsCount: number
  onOpenAlarms: () => void
}

export function ClockPage({
  displayHours,
  minutes,
  seconds,
  ampm,
  dateString,
  is24Hour,
  nextAlarm,
  enabledAlarmsCount,
  onOpenAlarms,
}: ClockPageProps) {
  return (
    <>
      <main className="main-display">
        <div className="time-wrapper">
          <span className="time-main">
            {displayHours}:{minutes}
          </span>
          <span className="time-seconds">{seconds}</span>
          {!is24Hour && <span className="time-ampm">{ampm}</span>}
        </div>

        <div className="date-display">{dateString}</div>

        <div className={`next-alarm-pill ${nextAlarm ? '' : 'none'}`}>
          <Bell size={20} />
          {nextAlarm ? (
            <span>
              Next Alarm:{' '}
              <strong>{formatAlarmTime(nextAlarm.time, is24Hour)}</strong> —{' '}
              {nextAlarm.label}
            </span>
          ) : (
            <span>No upcoming alarms active</span>
          )}
        </div>
      </main>

      <footer className="bottom-bar">
        <button
          type="button"
          className="touch-btn touch-btn-alarm-cta"
          onClick={onOpenAlarms}
        >
          <AlarmClock size={30} />
          <span>Alarms</span>
          <span className="alarm-count-badge">{enabledAlarmsCount}</span>
        </button>
      </footer>
    </>
  )
}
