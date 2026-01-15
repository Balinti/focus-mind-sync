// LocalStorage helpers for anonymous mode

export interface FocusSession {
  id: string
  started_at: string
  ended_at: string | null
  planned_minutes: number
  outcome: string
  blocker_text: string | null
  result: 'done' | 'partial' | 'blocked' | null
  next_step: string | null
  interruptions_count: number
  created_at: string
}

export interface FocusSettings {
  defaultDuration: number
  soundEnabled: boolean
}

const SESSIONS_KEY = 'fms_v1_sessions'
const SETTINGS_KEY = 'fms_v1_settings'
const COMPLETED_BLOCKS_KEY = 'fms_v1_completed_blocks'

export function getSessions(): FocusSession[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(SESSIONS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveSessions(sessions: FocusSession[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  } catch {
    // Storage may be full or disabled
  }
}

export function addSession(session: FocusSession): void {
  const sessions = getSessions()
  sessions.push(session)
  saveSessions(sessions)
}

export function updateSession(id: string, updates: Partial<FocusSession>): void {
  const sessions = getSessions()
  const index = sessions.findIndex(s => s.id === id)
  if (index !== -1) {
    sessions[index] = { ...sessions[index], ...updates }
    saveSessions(sessions)
  }
}

export function clearSessions(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(SESSIONS_KEY)
  } catch {
    // Ignore
  }
}

export function getSettings(): FocusSettings {
  if (typeof window === 'undefined') {
    return { defaultDuration: 50, soundEnabled: true }
  }
  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    return data ? JSON.parse(data) : { defaultDuration: 50, soundEnabled: true }
  } catch {
    return { defaultDuration: 50, soundEnabled: true }
  }
}

export function saveSettings(settings: FocusSettings): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Storage may be full or disabled
  }
}

export function getCompletedBlocksCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    const data = localStorage.getItem(COMPLETED_BLOCKS_KEY)
    return data ? parseInt(data, 10) : 0
  } catch {
    return 0
  }
}

export function incrementCompletedBlocks(): void {
  if (typeof window === 'undefined') return
  try {
    const count = getCompletedBlocksCount()
    localStorage.setItem(COMPLETED_BLOCKS_KEY, String(count + 1))
  } catch {
    // Ignore
  }
}

export function generateSessionId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
