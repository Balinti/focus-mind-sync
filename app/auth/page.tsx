'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSessions, clearSessions } from '@/lib/storage'
import type { User } from '@supabase/supabase-js'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const redirect = searchParams.get('redirect') || '/dashboard'

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) {
      setCheckingAuth(false)
      return
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setCheckingAuth(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const migrateLocalData = async (userId: string) => {
    const localSessions = getSessions()
    if (localSessions.length === 0) return

    try {
      const response = await fetch('/api/auth/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: localSessions }),
      })

      if (response.ok) {
        clearSessions()
      }
    } catch (err) {
      console.error('Migration error:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    if (!supabase) {
      setError('Authentication service not available')
      setLoading(false)
      return
    }

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          await migrateLocalData(data.user.id)
          router.push(redirect)
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          await migrateLocalData(data.user.id)
          router.push(redirect)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    if (supabase) {
      await supabase.auth.signOut()
      router.push('/')
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Show account page if user is logged in
  if (user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
            Account
          </h1>

          <div className="mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">Signed in as</p>
            <p className="text-slate-900 dark:text-white font-medium">{user.email}</p>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  // Check if Supabase is configured
  const supabase = createClient()
  if (!supabase) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
            Authentication Coming Soon
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Account features are being set up. For now, your focus sessions are saved locally in your browser.
          </p>
          <a
            href="/app"
            className="inline-flex px-6 py-3 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            Continue to Focus
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
          {mode === 'signup' ? 'Create an account' : 'Sign in'}
        </h1>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 rounded-lg transition-colors"
          >
            {loading ? 'Loading...' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}
