'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getLocalMetrics, type Metrics } from '@/lib/metrics'
import { getSessions, type FocusSession } from '@/lib/storage'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()

      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Load from Supabase for authenticated users
          const { data: dbSessions } = await supabase
            .from('focus_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

          if (dbSessions && dbSessions.length > 0) {
            setSessions(dbSessions)
            // Calculate metrics from Supabase sessions
            const allSessions = await supabase
              .from('focus_sessions')
              .select('*')
              .eq('user_id', user.id)

            if (allSessions.data) {
              const { calculateMetrics } = await import('@/lib/metrics')
              setMetrics(calculateMetrics(allSessions.data))
            }
          } else {
            // Fallback to local data
            setMetrics(getLocalMetrics())
            setSessions(getSessions().slice(-20).reverse())
          }
        } else {
          // Load local data for anonymous users
          setMetrics(getLocalMetrics())
          setSessions(getSessions().slice(-20).reverse())
        }
      } else {
        // No Supabase, use local data
        setMetrics(getLocalMetrics())
        setSessions(getSessions().slice(-20).reverse())
      }

      setLoading(false)
    }

    loadData()
  }, [])

  const formatDuration = (session: FocusSession) => {
    if (!session.ended_at) return '-'
    const start = new Date(session.started_at)
    const end = new Date(session.ended_at)
    return `${Math.round((end.getTime() - start.getTime()) / 60000)} min`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        {!user && (
          <Link
            href="/auth"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Sign in to save progress
          </Link>
        )}
      </div>

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Today</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {metrics.todayMinutes}
              <span className="text-base font-normal text-slate-500 ml-1">min</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {metrics.todayBlocks} blocks
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">This Week</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {metrics.thisWeekMinutes}
              <span className="text-base font-normal text-slate-500 ml-1">min</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {metrics.thisWeekBlocks} blocks
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Streak</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {metrics.streak}
              <span className="text-base font-normal text-slate-500 ml-1">days</span>
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Interruptions</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {metrics.todayInterruptions}
              <span className="text-base font-normal text-slate-500 ml-1">today</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {metrics.totalInterruptions} total
            </p>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Sessions
          </h2>
        </div>

        {sessions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              No focus sessions yet
            </p>
            <Link
              href="/app"
              className="inline-flex px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              Start your first focus block
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {sessions.map((session) => (
              <div key={session.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {session.outcome}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {formatDate(session.started_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {formatDuration(session)}
                    </span>
                    {session.result && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        session.result === 'done'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : session.result === 'partial'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {session.result}
                      </span>
                    )}
                    {session.interruptions_count > 0 && (
                      <span className="text-xs text-orange-600 dark:text-orange-400">
                        {session.interruptions_count} interruption{session.interruptions_count > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
