'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GoogleAuth } from './GoogleAuth'

export function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-slate-900 dark:text-white">
          Focus Mind Sync
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/app"
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              isActive('/app')
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Focus
          </Link>
          <Link
            href="/dashboard"
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              isActive('/dashboard')
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/pricing"
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              isActive('/pricing')
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pricing
          </Link>

          <GoogleAuth />
        </div>
      </div>
    </nav>
  )
}
