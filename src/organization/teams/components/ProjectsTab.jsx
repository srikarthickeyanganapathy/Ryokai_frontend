 import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, FolderKanban, MoreVertical, CheckCircle2 } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { SearchInput } from '@/shared/ui/SearchInput'
import { Avatar, AvatarFallback } from '@/shared/ui/Avatar'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PillNav } from '@/shared/ui/PillNav'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'
import { ProjectCard } from '@/project/components/ProjectCard'
import { cn } from '@/shared/lib/cn'

/* ============================================================
   components/ProjectsTab.jsx -- Work segment (projects side).
   Uses the project's own shared ProjectCard for each card
   (health ring, progress, due, navigation), wrapped with a
   status menu (real onStatusChange) and the team member stack.
   ============================================================ */

function hashHue(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h) % 360
}

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
]

export function ProjectsTab({ teamProjects, members, hasProjectIdOnTasks, tasksForProject, canCreateProject, isReadOnly, onCreateProject, onStatusChange }) {
  const [query, setQuery] = useState('')
  const [statusTab, setStatusTab] = useState('all')

  const counts = useMemo(() => ({
    all: teamProjects.length,
    ACTIVE: teamProjects.filter(p => String(p.status || '').toUpperCase() === 'ACTIVE').length,
    COMPLETED: teamProjects.filter(p => String(p.status || '').toUpperCase() === 'COMPLETED').length,
    ARCHIVED: teamProjects.filter(p => String(p.status || '').toUpperCase() === 'ARCHIVED').length,
  }), [teamProjects])

  const visible = useMemo(() => {
    let list = teamProjects
    if (statusTab !== 'all') list = list.filter(p => String(p.status || '').toUpperCase() === statusTab)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    }
    return list
  }, [teamProjects, statusTab, query])

  const handleStatus = (projectId, newStatus) => {
    if (isReadOnly) return
    onStatusChange?.(projectId, newStatus)
  }

  return (
    <div className="pt-4">
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Search projects..." debounceMs={0} className="w-[200px] sm:w-[240px]" />
        <PillNav filters={STATUS_TABS} value={statusTab} onChange={setStatusTab} counts={counts} />
        <span className="flex-1" />
        {canCreateProject && !isReadOnly && (
          <Button variant="primary" size="sm" className="gap-1.5 h-7 text-[11px]" onClick={onCreateProject}>
            <Plus className="w-3.5 h-3.5" /> New project
          </Button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-xs)]">
          <EmptyState icon={FolderKanban} title={query ? 'No matches found' : 'No projects yet'} description={query ? 'Try a different search.' : 'Projects this team owns will show here.'} className="min-h-[180px]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visible.map((p, i) => {
            const status = String(p.status || '').toUpperCase()
            const taskCount = tasksForProject ? tasksForProject(p.id).length : null
            const done = status === 'COMPLETED'
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.2) }}
                className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-xs)] overflow-hidden hover:border-[var(--accent-border)] transition-colors relative">
                {/* status menu */}
                {!isReadOnly && (
                  <div className="absolute right-2.5 top-2.5 z-40">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-7 h-7 rounded-lg bg-[var(--bg-card)]/90 backdrop-blur border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[130px] p-1" align="end">
                        {['ACTIVE', 'COMPLETED', 'ARCHIVED'].map(s => (
                          <button key={s} onClick={() => handleStatus(p.id, s)}
                            className={cn('w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[var(--bg-subtle)] cursor-pointer', status === s && 'text-[var(--accent)] font-bold')}>
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* their shared ProjectCard, chrome stripped */}
                <div className="[&_.project-card]:border-0 [&_.project-card]:shadow-none [&_.project-card]:rounded-none">
                  <ProjectCard project={p} />
                </div>

                {/* footer */}
                <div className="flex items-center gap-2 px-4 pb-3 pt-1">
                  {(members || []).length > 0 && (
                    <div className="flex -space-x-1.5">
                      {members.slice(0, 4).map(m => (
                        <Avatar key={m.username || m.id} className="w-5 h-5 border-2 border-[var(--bg-card)]" title={m.username || m.name}>
                          <AvatarFallback className="text-[7px] font-bold" style={{ background: `hsl(${hashHue(m.username || m.name)} 65% 48%)`, color: '#fff' }}>
                            {(m.username || m.name || '?').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  )}
                  {taskCount != null && (
                    <span className="text-[10.5px] text-[var(--text-muted)] tabular-nums">{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
                  )}
                  {done && <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-bold text-[var(--success)]"><CheckCircle2 className="w-3 h-3" /> Done</span>}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProjectsTab
