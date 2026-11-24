import React from 'react'
import { Clock, Settings, Sun, Volume2, VolumeX } from 'lucide-react'
import './SettingsPage.css'

interface SettingsPageProps {
  alarmVolume: number
  brightness: number
  is24Hour: boolean
  onChangeVolume: (volume: number) => void
  onChangeBrightness: (brightness: number) => void
  onChange24Hour: (is24Hour: boolean) => void
}

export function SettingsPage({
  alarmVolume,
  brightness,
  is24Hour,
  onChangeVolume,
  onChangeBrightness,
  onChange24Hour,
}: SettingsPageProps) {
  return (
    <main className="subpage-container">
      <div className="subpage-header">
        <div className="subpage-title">
          <Settings size={32} className="subpage-title-icon" />
          <div>
            <h1>Settings</h1>
            <p>Display, sound, and time format preferences</p>
          </div>
        </div>
      </div>

      <div className="settings-list">
        {/* Alarm Volume */}
        <section className="page-card setting-row">
          <div className="setting-header">
            <div className="setting-label-group">
              {alarmVolume === 0 ? (
                <VolumeX size={28} className="setting-icon" />
              ) : (
                <Volume2 size={28} className="setting-icon" />
              )}
              <div>
                <label htmlFor="alarm-volume-slider" className="setting-title">
                  Alarm Volume
                </label>
                <p className="setting-subtitle">Adjust loudness for ringing alarms</p>
              </div>
            </div>
            <span className="setting-value-badge">{alarmVolume}%</span>
          </div>
          <input
            id="alarm-volume-slider"
            type="range"
            min={0}
            max={100}
            step={1}
            value={alarmVolume}
            aria-valuetext={`${alarmVolume} percent`}
            style={
              {
                '--attr-min': 0,
                '--attr-max': 100,
                '--control-value': alarmVolume,
              } as React.CSSProperties
            }
            onChange={(e) => onChangeVolume(Number(e.target.value))}
            className="touch-range-slider"
          />
        </section>

        {/* Device Brightness */}
        <section className="page-card setting-row">
          <div className="setting-header">
            <div className="setting-label-group">
              <Sun size={28} className="setting-icon" />
              <div>
                <label htmlFor="device-brightness-slider" className="setting-title">
                  Device Brightness
                </label>
                <p className="setting-subtitle">Dim the display for bedside use</p>
              </div>
            </div>
            <span className="setting-value-badge">{brightness}%</span>
          </div>
          <input
            id="device-brightness-slider"
            type="range"
            min={10}
            max={100}
            step={1}
            value={brightness}
            aria-valuetext={`${brightness} percent`}
            style={
              {
                '--attr-min': 10,
                '--attr-max': 100,
                '--control-value': brightness,
              } as React.CSSProperties
            }
            onChange={(e) => onChangeBrightness(Number(e.target.value))}
            className="touch-range-slider"
          />
        </section>

        {/* 12hr / 24hr Clock */}
        <section className="page-card setting-row setting-row-inline">
          <div className="setting-label-group">
            <Clock size={28} className="setting-icon" />
            <div>
              <span className="setting-title">Clock Format</span>
              <p className="setting-subtitle">Choose 12-hour or 24-hour time display</p>
            </div>
          </div>
          <div className="segmented-control" role="group" aria-label="Clock Format">
            <button
              type="button"
              className={`segmented-btn ${!is24Hour ? 'selected' : ''}`}
              aria-pressed={!is24Hour}
              onClick={() => onChange24Hour(false)}
            >
              12-Hour
            </button>
            <button
              type="button"
              className={`segmented-btn ${is24Hour ? 'selected' : ''}`}
              aria-pressed={is24Hour}
              onClick={() => onChange24Hour(true)}
            >
              24-Hour
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
