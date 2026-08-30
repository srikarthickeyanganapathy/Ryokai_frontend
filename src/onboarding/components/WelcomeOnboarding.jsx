import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Rocket, FolderKanban, ListChecks, CalendarClock, Users, Building2,
  ArrowRight, ArrowLeft, Check, Sparkles,
} from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'
import { useOnboardingActions, ONBOARDING_STATUS } from '../hooks/useOnboarding'

/**
 * First-run welcome experience. Lightweight and skippable — a short guided
 * intro (not a mandatory wizard) that teaches the Ryokai workflow and links
 * straight into real product pages. Shown once per user (backend state),
 * reopenable later from the Help Center.
 */

const WELCOME = {
  title: 'Welcome to Ryokai',
  description: 'Organize your work, manage projects, and keep everything connected in one workspace.',
}

const STEPS = [
  {
    key: 'tasks',
    icon: ListChecks,
    title: 'Tasks are your unit of work',
    body: 'Every task can carry a description, a priority, a due date, and a checklist that breaks it into smaller steps. Watch the progress ring fill as you check items off.',
    cta: { label: 'Open Tasks', to: '/app/tasks' },
  },
  {
    key: 'projects',
    icon: FolderKanban,
    title: 'Projects group related tasks',
    body: 'A project gathers every task that serves one outcome — a launch, a skill, a product area. Create a project, add tasks to it, and track completion at a glance.',
    cta: { label: 'Open Projects', to: '/app/projects' },
  },
  {
    key: 'workspaces',
    icon: Building2,
    title: 'Three ways to work',
    body: 'Personal is your individual workspace. Crews are small groups collaborating around shared work. Organizations add members, teams, roles, and structured task assignment.',
    cta: null,
  },
  {
    key: 'productivity',
    icon: CalendarClock,
    title: 'Stay on rhythm',
    body: 'The Dashboard summarizes your day, the Calendar shows what is due, and Focus Mode helps you work one task at a time. Your workspace came with starter tasks — edit them, complete them, or replace them with your own.',
    cta: { label: 'Open Dashboard', to: '/app' },
  },
]

export function WelcomeOnboarding({ status, onReopenMode = false }) {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { complete, skip } = useOnboardingActions()

  if (!status) return null
  const isFirstRun = status === ONBOARDING_STATUS.NOT_STARTED
  if (!isFirstRun && !onReopenMode) return null

  const isLast = step === STEPS.length - 1
  const current = STEPS[step]
  const Icon = current.icon

  const finish = () => complete.mutate()
  const dismiss = () => skip.mutate()

  const goTo = (to) => {
    // Navigating away counts as engaging with onboarding — close quietly so
    // the education never blocks exploring the real product.
    if (isFirstRun) skip.mutate()
    navigate(to)
  }

  return (
    <Modal open={true}>
      <ModalContent className="max-w-xl">
        <ModalHeader>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-[var(--accent,--text-secondary)]" strokeWidth={1.5} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Getting started
            </span>
          </div>
          <ModalTitle className="text-[20px]">
            {step === 0 ? WELCOME.title : current.title}
          </ModalTitle>
          <ModalDescription>
            {step === 0 ? WELCOME.description : current.body}
          </ModalDescription>
        </ModalHeader>

        {step > 0 && (
          <motion.div
            key={current.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/40 p-4 flex items-start gap-3"
          >
            <div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center">
              <Icon className="h-5 w-5 text-[var(--text-secondary)]" strokeWidth={1.5} />
            </div>
            <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              {current.cta && (
                <button
                  type="button"
                  onClick={() => goTo(current.cta.to)}
                  className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--text-primary)] underline underline-offset-4 decoration-[var(--border-default)] hover:decoration-current transition-colors"
                >
                  {current.cta.label} <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          {STEPS.map((s, i) => (
            <span
              key={s.key}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === step ? 'w-5 bg-[var(--text-primary)]' : 'w-1.5 bg-[var(--border-default)]'
              )}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {step === 0 ? (
              <Button variant="ghost" size="sm" onClick={dismiss} disabled={skip.isPending}>
                Skip for now
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {current.cta && step > 0 && (
              <Button variant="outline" size="sm" onClick={() => goTo(current.cta.to)}>
                {current.cta.label}
              </Button>
            )}
            {isLast ? (
              <Button variant="primary" size="sm" onClick={finish} disabled={complete.isPending}>
                <Check className="h-3.5 w-3.5" /> Get started
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setStep(step + 1)}>
                Next <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}

