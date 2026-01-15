import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

interface SessionInput {
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

function validateSession(session: unknown): session is SessionInput {
  if (!session || typeof session !== 'object') return false
  const s = session as Record<string, unknown>

  return (
    typeof s.id === 'string' &&
    typeof s.started_at === 'string' &&
    (s.ended_at === null || typeof s.ended_at === 'string') &&
    typeof s.planned_minutes === 'number' &&
    typeof s.outcome === 'string' &&
    (s.blocker_text === null || typeof s.blocker_text === 'string') &&
    (s.result === null || ['done', 'partial', 'blocked'].includes(s.result as string)) &&
    (s.next_step === null || typeof s.next_step === 'string') &&
    typeof s.interruptions_count === 'number' &&
    typeof s.created_at === 'string'
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessions } = body

    if (!Array.isArray(sessions)) {
      return NextResponse.json({ error: 'Invalid sessions format' }, { status: 400 })
    }

    // Validate each session
    const validSessions: SessionInput[] = []
    for (const session of sessions) {
      if (validateSession(session)) {
        validSessions.push(session)
      }
    }

    if (validSessions.length === 0) {
      return NextResponse.json({ message: 'No valid sessions to migrate' })
    }

    // Transform sessions for database insert
    const dbSessions = validSessions.map(session => ({
      user_id: user.id,
      started_at: session.started_at,
      ended_at: session.ended_at,
      planned_minutes: session.planned_minutes,
      outcome: session.outcome,
      blocker_text: session.blocker_text,
      result: session.result,
      next_step: session.next_step,
      interruptions_count: session.interruptions_count,
      created_at: session.created_at,
    }))

    // Upsert sessions (insert, skip on conflict with same user_id + created_at)
    const { error } = await supabase
      .from('focus_sessions')
      .upsert(dbSessions, {
        onConflict: 'user_id,created_at',
        ignoreDuplicates: true,
      })

    if (error) {
      console.error('Migration error:', error)
      return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Migration successful',
      migrated: validSessions.length,
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
  }
}
