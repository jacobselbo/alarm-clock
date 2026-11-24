import React, { useState } from 'react'
import { AlarmClock, Bell, Plus, Trash2 } from 'lucide-react'
import type { Alarm } from '../types'
import { ALL_DAYS, formatAlarmTime } from '../utils/time'
import './AlarmsPage.css'

interface AlarmsPageProps {
  alarms: Alarm[]
  enabledAlarmsCount: number
  is24Hour: boolean
  onToggleAlarm: (id: string) => void
  onDeleteAlarm: (id: string) => void
  onAddAlarm: (alarm: { time: string; label: string; days: string[] }) => Promise<boolean>
}

export function AlarmsPage({
  alarms,
  enabledAlarmsCount,
  is24Hour,
  onToggleAlarm,
  onDeleteAlarm,
  onAddAlarm,
}: AlarmsPageProps) {
  const [newTime, setNewTime] = useState('07:00')
  const [newLabel, setNewLabel] = useState('Morning Alarm')
  const [newDays, setNewDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri'])

  const toggleDay = (day: string) => {
    setNewDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const created = await onAddAlarm({
      time: newTime,
      label: newLabel || 'Alarm',
      days: newDays,
    })
    if (created) {
      setNewLabel('Alarm')
    }
  }

  return (
    <main className="subpage-container">
      <div className="subpage-header">
        <div className="subpage-title">
          <AlarmClock size={32} className="subpage-title-icon" />
          <div>
            <h1>Alarms</h1>
            <p>
              {enabledAlarmsCount} active {enabledAlarmsCount === 1 ? 'alarm' : 'alarms'}
            </p>
          </div>
        </div>
      </div>

      <div className="alarms-page-grid">
        <section className="page-card alarms-list-card">
          <h2 className="section-heading">Scheduled Alarms</h2>
          {alarms.length === 0 ? (
            <div className="empty-alarms-state">
              <Bell size={44} />
              <p>No alarms set yet. Create one on the right.</p>
            </div>
          ) : (
            <div className="alarm-list">
              {alarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className={`alarm-card ${alarm.enabled ? '' : 'disabled'}`}
                >
                  <div>
                    <div className="alarm-info-time">
                      {formatAlarmTime(alarm.time, is24Hour)}
                    </div>
                    <div className="alarm-info-label">{alarm.label}</div>
                    <div className="alarm-info-days">
                      {alarm.days.length === 7 ? 'Every day' : alarm.days.join(', ')}
                    </div>
                  </div>
                  <div className="alarm-card-actions">
                    <label className="toggle-switch" aria-label={`Toggle ${alarm.label}`}>
                      <input
                        type="checkbox"
                        checked={alarm.enabled}
                        onChange={() => onToggleAlarm(alarm.id)}
                      />
                      <span className="toggle-slider" />
                    </label>
                    <button
                      type="button"
                      className="touch-icon-delete"
                      onClick={() => onDeleteAlarm(alarm.id)}
                      aria-label={`Delete ${alarm.label}`}
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="page-card add-alarm-card">
          <h2 className="section-heading">Add Alarm</h2>
          <form onSubmit={handleSubmit} className="add-alarm-form">
            <div className="form-group">
              <label htmlFor="new-alarm-time">Time</label>
              <input
                id="new-alarm-time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-alarm-label">Label</label>
              <input
                id="new-alarm-label"
                type="text"
                placeholder="e.g. Workout, School"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Repeat Days</label>
              <div className="days-selector">
                {ALL_DAYS.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    className={`day-chip ${newDays.includes(d.key) ? 'selected' : ''}`}
                    onClick={() => toggleDay(d.key)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="touch-btn touch-btn-primary">
              <Plus size={24} />
              <span>Add Alarm</span>
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
