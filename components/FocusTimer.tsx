'use client'

import { useState, useEffect, useCallback } from 'react'
import { StartCheckInForm, EndCheckInForm } from './CheckInForm'
import { SoftSignupPrompt } from './SoftSignupPrompt'
import {
  FocusSession,
  addSession,
  updateSession,
  generateSessionId,
  getCompletedBlocksCount,
  incrementCompletedBlocks,
  getSettings,
} from '@/lib/storage'

type TimerState = 'idle' | 'start-checkin' | 'running' | 'paused' | 'end-checkin' | 'summary'

const DURATION_PRESETS = [
  { label: '50 min', minutes: 50 },
  { label: '60 min', minutes: 60 },
  { label: '90 min', minutes: 90 },
]

export function FocusTimer() {
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [selectedDuration, setSelectedDuration] = useState(50)
  const [timeRemaining, setTimeRemaining] = useState(50 * 60) // seconds
  const [interruptions, setInterruptions] = useState(0)
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)

  // Load default duration from settings
  useEffect(() => {
    const settings = getSettings()
    setSelectedDuration(settings.defaultDuration)
    setTimeRemaining(settings.defaultDuration * 60)
  }, [])

  // Timer countdown
  useEffect(() => {
    if (timerState !== 'running') return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setTimerState('end-checkin')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerState])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSelectDuration = (minutes: number) => {
    setSelectedDuration(minutes)
    setTimeRemaining(minutes * 60)
  }

  const handleStartCheckin = () => {
    setTimerState('start-checkin')
  }

  const handleStartFocus = useCallback((data: { outcome: string; blocker: string }) => {
    const session: FocusSession = {
      id: generateSessionId(),
      started_at: new Date().toISOString(),
      ended_at: null,
      planned_minutes: selectedDuration,
      outcome: data.outcome,
      blocker_text: data.blocker || null,
      result: null,
      next_step: null,
      interruptions_count: 0,
      created_at: new Date().toISOString(),
    }
    addSession(session)
    setCurrentSession(session)
    setInterruptions(0)
    setTimerState('running')
  }, [selectedDuration])

  const handleInterruption = () => {
    setInterruptions((prev) => prev + 1)
    if (currentSession) {
      updateSession(currentSession.id, { interruptions_count: interruptions + 1 })
    }
  }

  const handleEndEarly = () => {
    setTimerState('end-checkin')
  }

  const handleEndFocus = useCallback((data: { result: 'done' | 'partial' | 'blocked'; nextStep: string }) => {
    if (currentSession) {
      updateSession(currentSession.id, {
        ended_at: new Date().toISOString(),
        result: data.result,
        next_step: data.nextStep || null,
        interruptions_count: interruptions,
      })
      setCurrentSession({
        ...currentSession,
        ended_at: new Date().toISOString(),
        result: data.result,
        next_step: data.nextStep || null,
        interruptions_count: interruptions,
      })
    }
    incrementCompletedBlocks()
    setTimerState('summary')

    // Check if should show signup prompt (after first completed block)
    const completedBlocks = getCompletedBlocksCount()
    if (completedBlocks === 1) {
      setShowSignupPrompt(true)
    }
  }, [currentSession, interruptions])

  const handleStartNew = () => {
    setTimerState('idle')
    setTimeRemaining(selectedDuration * 60)
    setInterruptions(0)
    setCurrentSession(null)
  }

  const handleCancelCheckin = () => {
    setTimerState('idle')
    setTimeRemaining(selectedDuration * 60)
  }

  const getSessionDuration = () => {
    if (!currentSession?.started_at || !currentSession?.ended_at) return 0
    const start = new Date(currentSession.started_at)
    const end = new Date(currentSession.ended_at)
    return Math.round((end.getTime() - start.getTime()) / 60000)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      {timerState === 'idle' && (
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-8">
            Start a Focus Block
          </h1>

          {/* Duration Selection */}
          <div className="flex gap-3 justify-center mb-8">
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset.minutes}
                onClick={() => handleSelectDuration(preset.minutes)}
                className={`px-6 py-3 text-lg font-medium rounded-xl transition-colors ${
                  selectedDuration === preset.minutes
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="text-8xl font-mono font-bold text-slate-900 dark:text-white mb-8">
            {formatTime(timeRemaining)}
          </div>

          <button
            onClick={handleStartCheckin}
            className="px-8 py-4 text-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors shadow-lg hover:shadow-xl"
          >
            Begin Focus Block
          </button>
        </div>
      )}

      {timerState === 'start-checkin' && (
        <StartCheckInForm onSubmit={handleStartFocus} onCancel={handleCancelCheckin} />
      )}

      {(timerState === 'running' || timerState === 'paused') && (
        <div className="text-center">
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse-soft"></span>
              In Focus
            </span>
          </div>

          <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
            {currentSession?.outcome}
          </p>

          {/* Timer Display */}
          <div className="text-9xl font-mono font-bold text-slate-900 dark:text-white mb-8">
            {formatTime(timeRemaining)}
          </div>

          {/* Interruption Counter */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={handleInterruption}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Interrupted ({interruptions})
            </button>
          </div>

          <button
            onClick={handleEndEarly}
            className="px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            End Early
          </button>
        </div>
      )}

      {timerState === 'end-checkin' && currentSession && (
        <EndCheckInForm
          outcome={currentSession.outcome}
          onSubmit={handleEndFocus}
          onCancel={() => setTimerState('running')}
        />
      )}

      {timerState === 'summary' && currentSession && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
            Focus Block Complete
          </h2>

          <div className="grid grid-cols-2 gap-4 my-6 text-left">
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
              <p className="text-sm text-slate-500 dark:text-slate-400">Duration</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {getSessionDuration()} min
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
              <p className="text-sm text-slate-500 dark:text-slate-400">Interruptions</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {currentSession.interruptions_count}
              </p>
            </div>
          </div>

          <div className="text-left mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Goal</p>
            <p className="text-slate-900 dark:text-white">{currentSession.outcome}</p>
          </div>

          <div className="text-left mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Result</p>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              currentSession.result === 'done'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : currentSession.result === 'partial'
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {currentSession.result === 'done' ? 'Completed' : currentSession.result === 'partial' ? 'Partial' : 'Blocked'}
            </span>
          </div>

          {currentSession.next_step && (
            <div className="text-left mb-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Next Step</p>
              <p className="text-slate-900 dark:text-white">{currentSession.next_step}</p>
            </div>
          )}

          <button
            onClick={handleStartNew}
            className="w-full px-6 py-3 text-lg font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors"
          >
            Start Another Block
          </button>
        </div>
      )}

      {/* Soft Signup Prompt */}
      {showSignupPrompt && (
        <SoftSignupPrompt onDismiss={() => setShowSignupPrompt(false)} />
      )}
    </div>
  )
}
