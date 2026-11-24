export const ALL_DAYS = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
]

export function readStoredBoolean(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : raw === 'true'
  } catch {
    return fallback
  }
}

export function readStoredNumber(key: string, fallback: number, min: number, max: number): number {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed = Number(raw)
    if (Number.isNaN(parsed)) return fallback
    return Math.min(max, Math.max(min, parsed))
  } catch {
    return fallback
  }
}

export function formatAlarmTime(time24: string, is24Hour: boolean): string {
  if (is24Hour) return time24
  const [hStr, mStr] = time24.split(':')
  const h = Number(hStr)
  if (Number.isNaN(h) || !mStr) return time24
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${mStr} ${period}`
}
