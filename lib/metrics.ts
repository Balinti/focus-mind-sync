// Metrics calculation helpers

import { FocusSession, getSessions } from './storage'

export interface Metrics {
  todayMinutes: number
  thisWeekMinutes: number
  blocksCompleted: number
  todayBlocks: number
  thisWeekBlocks: number
  totalInterruptions: number
  todayInterruptions: number
  streak: number
}

function isToday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr)
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  return date >= startOfWeek
}

function getSessionMinutes(session: FocusSession): number {
  if (!session.ended_at) return 0
  const start = new Date(session.started_at)
  const end = new Date(session.ended_at)
  return Math.round((end.getTime() - start.getTime()) / 60000)
}

export function calculateMetrics(sessions: FocusSession[]): Metrics {
  const completedSessions = sessions.filter(s => s.ended_at && s.result)

  const todaySessions = completedSessions.filter(s => isToday(s.started_at))
  const thisWeekSessions = completedSessions.filter(s => isThisWeek(s.started_at))

  const todayMinutes = todaySessions.reduce((sum, s) => sum + getSessionMinutes(s), 0)
  const thisWeekMinutes = thisWeekSessions.reduce((sum, s) => sum + getSessionMinutes(s), 0)

  const totalInterruptions = completedSessions.reduce((sum, s) => sum + s.interruptions_count, 0)
  const todayInterruptions = todaySessions.reduce((sum, s) => sum + s.interruptions_count, 0)

  // Calculate streak (consecutive days with at least one completed session)
  const streak = calculateStreak(completedSessions)

  return {
    todayMinutes,
    thisWeekMinutes,
    blocksCompleted: completedSessions.length,
    todayBlocks: todaySessions.length,
    thisWeekBlocks: thisWeekSessions.length,
    totalInterruptions,
    todayInterruptions,
    streak,
  }
}

function calculateStreak(sessions: FocusSession[]): number {
  if (sessions.length === 0) return 0

  // Get unique days with sessions
  const daysWithSessions = new Set<string>()
  sessions.forEach(s => {
    const date = new Date(s.started_at)
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    daysWithSessions.add(dateKey)
  })

  // Check from today backwards
  let streak = 0
  const today = new Date()
  let checkDate = new Date(today)

  // First check if today has a session
  const todayKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`
  if (!daysWithSessions.has(todayKey)) {
    // Check yesterday - streak might still be active
    checkDate.setDate(checkDate.getDate() - 1)
    const yesterdayKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`
    if (!daysWithSessions.has(yesterdayKey)) {
      return 0
    }
  }

  // Count consecutive days
  while (true) {
    const dateKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`
    if (daysWithSessions.has(dateKey)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

export function getLocalMetrics(): Metrics {
  const sessions = getSessions()
  return calculateMetrics(sessions)
}
