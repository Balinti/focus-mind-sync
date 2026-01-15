'use client'

import Link from 'next/link'

interface SoftSignupPromptProps {
  onDismiss: () => void
}

export function SoftSignupPrompt({ onDismiss }: SoftSignupPromptProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl max-w-sm w-full">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Nice work on your first focus block!
          </h3>

          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            Create a free account to save your progress and track your focus metrics over time.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/auth"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              Create free account
            </Link>
            <button
              onClick={onDismiss}
              className="w-full px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
