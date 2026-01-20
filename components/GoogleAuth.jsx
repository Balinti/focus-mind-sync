'use client'

import { useEffect, useState, useCallback } from 'react'

// Hardcoded Supabase configuration - DO NOT use env vars
const SUPABASE_URL = 'https://api.srv936332.hstgr.cloud'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE'
const APP_SLUG = 'focus-mind-sync'

let supabaseClient = null
let supabaseLoading = false
let supabaseLoadPromise = null

// Load Supabase client dynamically via CDN
function loadSupabase() {
  if (supabaseClient) return Promise.resolve(supabaseClient)
  if (supabaseLoadPromise) return supabaseLoadPromise

  supabaseLoading = true
  supabaseLoadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Cannot load Supabase on server'))
      return
    }

    // Check if already loaded
    if (window.supabase) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      supabaseLoading = false
      resolve(supabaseClient)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js'
    script.async = true
    script.onload = () => {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      supabaseLoading = false
      resolve(supabaseClient)
    }
    script.onerror = () => {
      supabaseLoading = false
      reject(new Error('Failed to load Supabase'))
    }
    document.head.appendChild(script)
  })

  return supabaseLoadPromise
}

// Track user login - upsert to user_tracking table
async function trackUserLogin(client, user) {
  if (!client || !user?.email) return

  try {
    const now = new Date().toISOString()

    // Try to get existing record
    const { data: existing } = await client
      .from('user_tracking')
      .select('login_cnt')
      .eq('user_email', user.email)
      .eq('app', APP_SLUG)
      .single()

    if (existing) {
      // Update existing record - increment login count
      await client
        .from('user_tracking')
        .update({
          login_cnt: existing.login_cnt + 1,
          last_login_ts: now
        })
        .eq('user_email', user.email)
        .eq('app', APP_SLUG)
    } else {
      // Insert new record
      await client
        .from('user_tracking')
        .insert({
          user_email: user.email,
          app: APP_SLUG,
          login_cnt: 1,
          last_login_ts: now
        })
    }
  } catch (err) {
    console.error('Error tracking user login:', err)
  }
}

export function GoogleAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState(null)

  useEffect(() => {
    let mounted = true

    loadSupabase()
      .then((supabase) => {
        if (!mounted) return
        setClient(supabase)

        // Get initial user
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (mounted) {
            setUser(user)
            setLoading(false)
          }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return
          const currentUser = session?.user ?? null
          setUser(currentUser)

          // Track login on SIGNED_IN event
          if (event === 'SIGNED_IN' && currentUser) {
            trackUserLogin(supabase, currentUser)
          }
        })

        return () => {
          subscription?.unsubscribe()
        }
      })
      .catch((err) => {
        console.error('Failed to load Supabase:', err)
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!client) {
      console.error('Supabase client not loaded')
      return
    }

    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      })
      if (error) throw error
    } catch (err) {
      console.error('Google sign-in error:', err)
    }
  }, [client])

  const signOut = useCallback(async () => {
    if (!client) return

    try {
      await client.auth.signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }, [client])

  if (loading) {
    return (
      <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg"></div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600 dark:text-slate-300 hidden sm:inline">
          {user.email}
        </span>
        <button
          onClick={signOut}
          className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-sm"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Sign in with Google
    </button>
  )
}

// Export functions for use elsewhere if needed
export { loadSupabase, trackUserLogin, SUPABASE_URL, SUPABASE_ANON_KEY, APP_SLUG }
