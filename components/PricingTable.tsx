'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function PricingTable() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasProPrice, setHasProPrice] = useState(false)

  useEffect(() => {
    // Check if Stripe price ID is available
    setHasProPrice(Boolean(process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID))

    const supabase = createClient()
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
      })
    }
  }, [])

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = '/auth?redirect=/pricing'
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()

      if (data.disabled) {
        alert('Pro upgrade coming soon!')
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Free Plan */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Free
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
          Everything you need to focus
        </p>
        <div className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
          $0
          <span className="text-base font-normal text-slate-500">/month</span>
        </div>

        <ul className="space-y-3 mb-8">
          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Unlimited focus blocks
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Start and end check-ins
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Interruption tracking
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Basic daily metrics
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            7-day session history
          </li>
        </ul>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Currently active
        </div>
      </div>

      {/* Pro Plan */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border-2 border-primary-500 relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
          Recommended
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Pro
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
          For serious deep workers
        </p>
        <div className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
          $9
          <span className="text-base font-normal text-slate-500">/month</span>
        </div>

        <ul className="space-y-3 mb-8">
          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Everything in Free
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Unlimited session history
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Weekly trend insights
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Best focus times analysis
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Export data (CSV)
          </li>
        </ul>

        {hasProPrice ? (
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full px-6 py-3 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 rounded-lg transition-colors"
          >
            {loading ? 'Loading...' : 'Upgrade to Pro'}
          </button>
        ) : (
          <div className="text-center px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-lg">
            Pro coming soon
          </div>
        )}
      </div>
    </div>
  )
}
