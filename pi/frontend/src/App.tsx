import { useEffect, useState, useMemo } from 'react'
import { ArrowLeft, Radio, Settings } from 'lucide-react'
import { ActiveOverlays } from './components/ActiveOverlays'
import { ServerSimulatorDrawer } from './components/ServerSimulatorDrawer'
import { AlarmsPage } from './pages/AlarmsPage'
import { ClockPage } from './pages/ClockPage'
import { SettingsPage } from './pages/SettingsPage'
import type { Alarm, ActiveDisplayState, StatusResponse } from './types'
import { readStoredBoolean, readStoredNumber } from './utils/time'
import './App.css'

type PageView = 'clock' | 'alarms' | 'settings'

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [activeDisplay, setActiveDisplay] = useState<ActiveDisplayState>({ type: 'clock' })
  const [isBackendConnected, setIsBackendConnected] = useState(false)

  const [activePage, setActivePage] = useState<PageView>('clock')
  const [showCommandDrawer, setShowCommandDrawer] = useState(false)

  // Persisted settings
  const [is24Hour, setIs24Hour] = useState(() => readStoredBoolean('alarmClock.is24Hour', false))
  const [alarmVolume, setAlarmVolume] = useState(() =>
    readStoredNumber('alarmClock.alarmVolume', 80, 0, 100)
  )
  const [brightness, setBrightness] = useState(() =>
    readStoredNumber('alarmClock.brightness', 100, 10, 100)
  )

  useEffect(() => {
    try {
      localStorage.setItem('alarmClock.is24Hour', String(is24Hour))
    } catch {
      // Ignore storage errors in restricted environments
    }
  }, [is24Hour])

  useEffect(() => {
    try {
      localStorage.setItem('alarmClock.alarmVolume', String(alarmVolume))
    } catch {
      // Ignore storage errors
    }
  }, [alarmVolume])

  useEffect(() => {
    try {
      localStorage.setItem('alarmClock.brightness', String(brightness))
    } catch {
      // Ignore storage errors
    }
  }, [brightness])

  // Local live clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchAlarms = async () => {
    try {
      const res = await fetch('/api/alarms')
      if (res.ok) {
        const data = await res.json()
        setAlarms(data)
      }
    } catch (e) {
      console.warn('Failed to fetch alarms:', e)
    }
  }

  // Poll Backend Status
  useEffect(() => {
    fetchAlarms()

    const pollStatus = async () => {
      try {
        const res = await fetch('/api/status')
        if (res.ok) {
          const data: StatusResponse = await res.json()
          setActiveDisplay(data.display)
          setIsBackendConnected(true)
        } else {
          setIsBackendConnected(false)
        }
      } catch {
        setIsBackendConnected(false)
      }
    }

    pollStatus()
    const pollInterval = setInterval(pollStatus, 2000)
    return () => clearInterval(pollInterval)
  }, [])

  const toggleAlarm = async (id: string) => {
    try {
      const res = await fetch(`/api/alarms/${id}/toggle`, { method: 'POST' })
      if (res.ok) {
        const updated = await res.json()
        setAlarms((prev) => prev.map((a) => (a.id === id ? updated : a)))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const deleteAlarm = async (id: string) => {
    try {
      const res = await fetch(`/api/alarms/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAlarms((prev) => prev.filter((a) => a.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const addAlarm = async (alarm: { time: string; label: string; days: string[] }) => {
    try {
      const res = await fetch('/api/alarms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time: alarm.time,
          label: alarm.label,
          days: alarm.days,
          enabled: true,
        }),
      })
      if (res.ok) {
        const created = await res.json()
        setAlarms((prev) => [...prev, created])
        return true
      }
    } catch (err) {
      console.error(err)
    }
    return false
  }

  const dismissAlarm = async () => {
    await fetch('/api/alarms/active/dismiss', { method: 'POST' })
    setActiveDisplay({ type: 'clock' })
  }

  const snoozeAlarm = async () => {
    await fetch('/api/alarms/active/snooze?minutes=9', { method: 'POST' })
    setActiveDisplay({ type: 'clock' })
    fetchAlarms()
  }

  const dismissCommand = async () => {
    await fetch('/api/commands/dismiss', { method: 'POST' })
    setActiveDisplay({ type: 'clock' })
  }

  const enabledAlarmsCount = useMemo(
    () => alarms.filter((a) => a.enabled).length,
    [alarms]
  )

  const nextAlarm = useMemo(() => {
    const enabledAlarms = alarms.filter((a) => a.enabled)
    if (!enabledAlarms.length) return null
    return [...enabledAlarms].sort((a, b) => a.time.localeCompare(b.time))[0]
  }, [alarms])

  const hoursRaw = currentTime.getHours()
  const minutes = String(currentTime.getMinutes()).padStart(2, '0')
  const seconds = String(currentTime.getSeconds()).padStart(2, '0')
  const ampm = hoursRaw >= 12 ? 'PM' : 'AM'
  const displayHours = is24Hour
    ? String(hoursRaw).padStart(2, '0')
    : String(hoursRaw % 12 || 12)

  const dateString = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const brightnessDimOpacity = Math.max(0, Math.min(0.85, ((100 - brightness) / 100) * 0.94))

  return (
    <div className="clock-container">
      <header className="top-bar">
        <div className="top-bar-left">
          {activePage === 'clock' ? (
            <div className="pi-status-badge">
              <span className={`status-dot ${isBackendConnected ? '' : 'offline'}`} />
              <span>{isBackendConnected ? 'Pi Backend Connected' : 'Connecting to Pi...'}</span>
            </div>
          ) : (
            <button
              type="button"
              className="touch-btn touch-btn-secondary"
              onClick={() => setActivePage('clock')}
            >
              <ArrowLeft size={24} />
              <span>Back to Clock</span>
            </button>
          )}
        </div>

        <div className="nav-actions">
          {activePage === 'clock' && (
            <button
              type="button"
              className={`touch-btn touch-btn-secondary ${showCommandDrawer ? 'active' : ''}`}
              onClick={() => setShowCommandDrawer((prev) => !prev)}
              title="Simulate Remote Server Commands"
            >
              <Radio size={22} />
              <span>Server Sim</span>
            </button>
          )}

          {activePage !== 'settings' && (
            <button
              type="button"
              className="touch-btn touch-btn-secondary"
              onClick={() => {
                setShowCommandDrawer(false)
                setActivePage('settings')
              }}
              aria-label="Open Settings"
            >
              <Settings size={24} />
              <span>Settings</span>
            </button>
          )}
        </div>
      </header>

      {activePage === 'clock' && (
        <ClockPage
          displayHours={displayHours}
          minutes={minutes}
          seconds={seconds}
          ampm={ampm}
          dateString={dateString}
          is24Hour={is24Hour}
          nextAlarm={nextAlarm}
          enabledAlarmsCount={enabledAlarmsCount}
          onOpenAlarms={() => {
            setShowCommandDrawer(false)
            setActivePage('alarms')
          }}
        />
      )}

      {activePage === 'alarms' && (
        <AlarmsPage
          alarms={alarms}
          enabledAlarmsCount={enabledAlarmsCount}
          is24Hour={is24Hour}
          onToggleAlarm={toggleAlarm}
          onDeleteAlarm={deleteAlarm}
          onAddAlarm={addAlarm}
        />
      )}

      {activePage === 'settings' && (
        <SettingsPage
          alarmVolume={alarmVolume}
          brightness={brightness}
          is24Hour={is24Hour}
          onChangeVolume={setAlarmVolume}
          onChangeBrightness={setBrightness}
          onChange24Hour={setIs24Hour}
        />
      )}

      <ActiveOverlays
        activeDisplay={activeDisplay}
        fallbackTime={`${displayHours}:${minutes}`}
        is24Hour={is24Hour}
        onSnoozeAlarm={snoozeAlarm}
        onDismissAlarm={dismissAlarm}
        onDismissCommand={dismissCommand}
      />

      {showCommandDrawer && (
        <ServerSimulatorDrawer onClose={() => setShowCommandDrawer(false)} />
      )}

      {brightnessDimOpacity > 0 && (
        <div
          className="brightness-overlay"
          style={{ opacity: brightnessDimOpacity }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
