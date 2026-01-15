'use client'

import { useState } from 'react'

interface StartCheckInProps {
  onSubmit: (data: { outcome: string; blocker: string }) => void
  onCancel: () => void
}

export function StartCheckInForm({ onSubmit, onCancel }: StartCheckInProps) {
  const [outcome, setOutcome] = useState('')
  const [blocker, setBlocker] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!outcome.trim()) return
    onSubmit({ outcome: outcome.trim(), blocker: blocker.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg max-w-md w-full">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Start Check-in
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          What do you want to accomplish? *
        </label>
        <textarea
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="e.g., Finish the login feature implementation"
          autoFocus
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Any potential blockers? (optional)
        </label>
        <input
          type="text"
          value={blocker}
          onChange={(e) => setBlocker(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g., Waiting for API docs"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!outcome.trim()}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          Start Focus
        </button>
      </div>
    </form>
  )
}

interface EndCheckInProps {
  outcome: string
  onSubmit: (data: { result: 'done' | 'partial' | 'blocked'; nextStep: string }) => void
  onCancel: () => void
}

export function EndCheckInForm({ outcome, onSubmit, onCancel }: EndCheckInProps) {
  const [result, setResult] = useState<'done' | 'partial' | 'blocked' | null>(null)
  const [nextStep, setNextStep] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!result) return
    onSubmit({ result, nextStep: nextStep.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg max-w-md w-full">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        End Check-in
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Goal: {outcome}
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          How did it go? *
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setResult('done')}
            className={`px-3 py-3 text-sm font-medium rounded-lg border-2 transition-colors ${
              result === 'done'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            Done
          </button>
          <button
            type="button"
            onClick={() => setResult('partial')}
            className={`px-3 py-3 text-sm font-medium rounded-lg border-2 transition-colors ${
              result === 'partial'
                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            Partial
          </button>
          <button
            type="button"
            onClick={() => setResult('blocked')}
            className={`px-3 py-3 text-sm font-medium rounded-lg border-2 transition-colors ${
              result === 'blocked'
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            Blocked
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          What&apos;s your next step? (optional)
        </label>
        <input
          type="text"
          value={nextStep}
          onChange={(e) => setNextStep(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g., Review and merge PR"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!result}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          Complete
        </button>
      </div>
    </form>
  )
}
