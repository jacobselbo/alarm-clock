import { Bell } from 'lucide-react'
import type { ActiveDisplayState } from '../types'
import { formatAlarmTime } from '../utils/time'
import './ActiveOverlays.css'

interface ActiveOverlaysProps {
  activeDisplay: ActiveDisplayState
  fallbackTime: string
  is24Hour: boolean
  onSnoozeAlarm: () => void
  onDismissAlarm: () => void
  onDismissCommand: () => void
}

export function ActiveOverlays({
  activeDisplay,
  fallbackTime,
  is24Hour,
  onSnoozeAlarm,
  onDismissAlarm,
  onDismissCommand,
}: ActiveOverlaysProps) {
  if (activeDisplay.type === 'clock') {
    return null
  }

  return (
    <>
      {activeDisplay.type === 'alarm' && (
        <div className="overlay-container">
          <div className="alarm-ringing-card">
            <Bell size={72} className="ringing-bell-icon" />
            <div className="alarm-ringing-time">
              {activeDisplay.alarm?.time
                ? formatAlarmTime(activeDisplay.alarm.time, is24Hour)
                : fallbackTime}
            </div>
            <div className="alarm-ringing-label">
              {activeDisplay.alarm?.label || 'Alarm Ringing!'}
            </div>
            <div className="alarm-actions">
              <button type="button" className="btn-snooze" onClick={onSnoozeAlarm}>
                Snooze (+9 min)
              </button>
              <button type="button" className="btn-dismiss" onClick={onDismissAlarm}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {activeDisplay.type === 'message' && (
        <div className="overlay-container">
          <div className="remote-message-card">
            <div className="remote-message-sender">
              Message from {activeDisplay.message?.sender || 'Server'}
            </div>
            <div className="remote-message-text">{activeDisplay.message?.text}</div>
            <button
              type="button"
              className="touch-btn touch-btn-primary"
              onClick={onDismissCommand}
              style={{ margin: '0 auto' }}
            >
              Dismiss Message
            </button>
          </div>
        </div>
      )}

      {activeDisplay.type === 'media' && (
        <div className="overlay-container">
          <div className="remote-media-card">
            {activeDisplay.media?.url && (
              <img
                src={activeDisplay.media.url}
                alt="Remote media"
                className="remote-media-img"
              />
            )}
            {activeDisplay.media?.caption && (
              <div className="remote-media-caption">{activeDisplay.media.caption}</div>
            )}
            <button
              type="button"
              className="touch-btn touch-btn-primary"
              onClick={onDismissCommand}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  )
}
