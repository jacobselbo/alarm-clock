export interface Alarm {
  id: string
  time: string // "HH:MM"
  label: string
  days: string[] // ["mon", "tue", ...]
  enabled: boolean
  sound?: string
}

export interface MessageCommand {
  text: string
  sender?: string
  duration_seconds?: number
  priority?: 'normal' | 'urgent'
}

export interface MediaCommand {
  url: string
  caption?: string
  media_type: 'image' | 'gif'
  duration_seconds?: number
}

export interface ActiveDisplayState {
  type: 'clock' | 'alarm' | 'message' | 'media'
  alarm?: Alarm
  message?: MessageCommand
  media?: MediaCommand
  expires_at?: string
}

export interface StatusResponse {
  current_time: string
  current_date: string
  display: ActiveDisplayState
}
