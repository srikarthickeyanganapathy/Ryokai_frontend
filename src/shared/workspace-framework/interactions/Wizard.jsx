import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

/**
 * Wizard
 * ─────────────────────────────────────────────────────────
 * Multi-step workflow UX primitive.
 * Renders a step indicator + content panel + navigation buttons.
 *
 * The PAGE owns step state and step content.
 * Wizard only renders the shell.
 *
 * @param {Array<{id, label}>} steps — Step definitions
 * @param {number} currentStep — Active step index (0-based)
 * @param {function} onNext — Next step handler
 * @param {function} onBack — Previous step handler
 * @param {function} [onComplete] — Final step completion handler
 * @param {boolean} [canProgress=true] — Whether Next is enabled
 * @param {React.ReactNode} children — Current step content
 */
export function Wizard({
  steps = [],
  currentStep = 0,
  onNext,
  onBack,
  onComplete,
  canProgress = true,
  className,
  children,
}) {
  const isLast = currentStep === steps.length - 1
  const isFirst = currentStep === 0

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Step Indicator */}
      {steps.length > 1 && (
        <div className="flex items-center gap-2 mb-6 px-1">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors shrink-0',
                    idx < currentStep
                      ? 'bg-[var(--success)] text-white'
                      : idx === currentStep
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]'
                  )}
                >
                  {idx < currentStep ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={cn(
                    'text-[12px] font-medium hidden sm:block',
                    idx === currentStep ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-px max-w-12',
                    idx < currentStep ? 'bg-[var(--success)]' : 'bg-[var(--border-subtle)]'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border-subtle)]">
        <button
          onClick={onBack}
          disabled={isFirst}
          className={cn(
            'px-4 py-2 text-[13px] font-medium rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors',
            isFirst ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
          )}
        >
          Back
        </button>
        <button
          onClick={isLast ? onComplete : onNext}
          disabled={!canProgress}
          className={cn(
            'px-4 py-2 text-[13px] font-semibold rounded-[var(--radius-md)] transition-colors',
            'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]',
            !canProgress && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isLast ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  )
}
