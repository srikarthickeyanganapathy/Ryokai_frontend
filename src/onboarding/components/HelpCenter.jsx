import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Rocket, ListChecks, FolderKanban, Building2, Users, Gauge,
  ChevronRight, ChevronDown, ExternalLink,
} from 'lucide-react'
import { Modal, ModalContent, ModalTitle } from '@/shared/ui/Modal'
import { cn } from '@/shared/lib/cn'

/**
 * Help Center -- "How Ryokai works". Reopenable product education organized by
 * topic. Every entry links into real application pages (no simulated
 * walkthroughs). Content adapts to the three workspace modes.
 */

const SECTIONS = [
  {
    key: 'getting-started',
    icon: Rocket,
    title: 'Getting Started',
    topics: [
      {
        q: 'What is Ryokai?',
        a: 'Ryokai is a workspace for organizing work: projects, tasks, checklists, priorities, and due dates -- for yourself, a small crew, or a whole organization.',
      },
      {
        q: 'Understanding workspaces',
        a: 'Personal is your individual workspace for your own work. Crews are lightweight shared workspaces for small groups. Organizations add members, teams, roles, and permissions for structured work.',
      },
      {
        q: 'Creating your first project',
        a: 'Projects group related tasks around one outcome. Open Projects and use "New Project" -- your workspace may already contain a starter project you can edit or replace.',
        link: { label: 'Go to Projects', to: '/app/projects' },
      },
      {
        q: 'Creating your first task',
        a: 'Tasks are the individual pieces of work you complete. Open Tasks and create one -- add a description, a priority, a due date, and checklist steps.',
        link: { label: 'Go to Tasks', to: '/app/tasks' },
      },
    ],
  },
  {
    key: 'tasks',
    icon: ListChecks,
    title: 'Tasks',
    topics: [
      {
        q: 'Task workflow',
        a: 'A task moves from Todo to In Progress, then to Done. In organizations, completed work is Submitted for review and gets Approved or Rejected by someone else -- assignees never review their own work.',
      },
      { q: 'Statuses', a: 'Todo, In Progress, In Review, Done. Personal and crew tasks finish at Done; organization tasks finish at Approved.' },
      { q: 'Priorities', a: 'Low, Medium, High, and Urgent. Priority drives ordering and highlights across the Tasks page and Dashboard.' },
      { q: 'Due dates', a: 'Set a due date on any task; overdue and due-soon tasks surface on the Tasks page, Dashboard, and Calendar.', link: { label: 'Open Calendar', to: '/app/calendar' } },
      { q: 'Checklists', a: 'Break a task into smaller steps without creating separate tasks. Checking items off advances the task progress ring.' },
      { q: 'Task views', a: 'The Tasks page offers List, Table, and Kanban views. Nebula visualizes relationships between connected tasks.', link: { label: 'Open Nebula', to: '/app/nebula' } },
    ],
  },
  {
    key: 'projects',
    icon: FolderKanban,
    title: 'Projects',
    topics: [
      { q: 'Creating projects', a: 'Use "New Project" on the Projects page. Name it, describe the outcome, and start adding tasks to it.' },
      { q: 'Organizing tasks', a: 'Attach tasks to a project when creating or editing them. Projects keep related work discoverable in one place.' },
      { q: 'Tracking project progress', a: 'Project pages summarize completion across their tasks so you can see how close the outcome is.' },
    ],
  },
  {
    key: 'personal',
    icon: Gauge,
    title: 'Personal',
    topics: [
      { q: 'Personal workspace', a: 'Personal is your individual workspace: your projects, your tasks, your priorities and due dates. Work here is visible only to you.' },
    ],
  },
  {
    key: 'crew',
    icon: Users,
    title: 'Crew',
    topics: [
      { q: 'Crew collaboration', a: 'A Crew is a small group with shared projects and tasks. Members create shared work, assign it to each other or leave it unassigned for anyone to claim, and track progress together.' },
      { q: 'Claiming work', a: 'Unassigned crew tasks wait as Todo until a member claims them, which moves them to In Progress.' },
    ],
  },
  {
    key: 'organization',
    icon: Building2,
    title: 'Organization',
    topics: [
      { q: 'Organization structure', a: 'Organizations contain members, teams, projects, and tasks. Work is assigned between members -- a task is assigned by one member to another.' },
      { q: 'Members and invites', a: 'Invite members from the organization administration page. Until others join, an organization cannot have assigned tasks -- which is why yours starts with guidance instead of assignments.', link: { label: 'Open Organizations', to: '/app/organizations' } },
      { q: 'Roles and permissions', a: 'Organization roles define who can view, create, assign, and approve work. Manage them under Roles & Permissions.', link: { label: 'Open Roles & Permissions', to: '/app/roles-permissions' } },
      { q: 'Task assignment', a: 'In an organization, tasks are assigned member-to-member and reviewed by a different member. Self-assignment is not part of the org workflow.' },
    ],
  },
]

export function HelpCenter({ open, onOpenChange }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState({ 'getting-started': true })
  const [topic, setTopic] = useState({ 'getting-started': 0 })

  if (!open) return null

  const toggle = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  const openTopic = (key, i) =>
    setTopic((prev) => ({ ...prev, [key]: i }))

  const goTo = (to) => {
    onOpenChange?.(false)
    navigate(to)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl">
        <div className="flex items-center justify-between pr-8">
          <ModalTitle className="text-[17px]">How Ryokai works</ModalTitle>
        </div>
        <p className="text-[13px] text-[var(--text-secondary)]">
          Short answers with links into the real product -- jump straight to wherever you want to try things.
        </p>

        <div className="mt-4 space-y-2 max-h-[52vh] overflow-y-auto custom-scrollbar pr-1">
          {SECTIONS.map((section) => {
            const Icon = section.icon
            const isOpen = !!expanded[section.key]
            return (
              <div
                key={section.key}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/30 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(section.key)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--bg-hover)]/50 transition-colors"
                >
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center">
                    <Icon className="h-4 w-4 text-[var(--text-secondary)]" strokeWidth={1.5} />
                  </div>
                  <span className="flex-1 text-[13px] font-semibold text-[var(--text-primary)]">
                    {section.title}
                  </span>
                  {isOpen
                    ? <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
                    : <ChevronRight className="h-4 w-4 text-[var(--text-secondary)]" />}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 space-y-1">
                        {section.topics.map((t, i) => {
                          const active = topic[section.key] === i
                          return (
                            <div key={t.q}>
                              <button
                                type="button"
                                onClick={() => openTopic(section.key, i)}
                                className={cn(
                                  'w-full text-left text-[12.5px] px-3 py-1.5 rounded-lg transition-colors',
                                  active
                                    ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]/50'
                                )}
                              >
                                {t.q}
                              </button>
                              {active && (
                                <motion.div
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="px-3 pb-2 pt-1 text-[12.5px] leading-relaxed text-[var(--text-secondary)]"
                                >
                                  {t.a}
                                  {t.link && (
                                    <button
                                      type="button"
                                      onClick={() => goTo(t.link.to)}
                                      className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--text-primary)] underline underline-offset-4 decoration-[var(--border-default)] hover:decoration-current transition-colors"
                                    >
                                      {t.link.label} <ExternalLink className="h-3 w-3" />
                                    </button>
                                  )}
                                </motion.div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </ModalContent>
    </Modal>
  )
}

