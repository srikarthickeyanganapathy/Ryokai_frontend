import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Pin, Plus, Trash2, Search, StickyNote, Calendar, FileText, Clock,
  Sparkles, TrendingUp, Hash, Edit3, ArrowUpDown, Layers, CheckCircle2,
  Lightbulb, BookOpen, Zap, Archive
} from '@/shared/ui/Icons'
import { Button } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { Input } from '@/shared/ui/Input'
import { Badge } from '@/shared/ui/Badge'
import { cn } from '@/shared/lib/cn'
import { useNotes, useDeleteNote, useUpdateNote } from '@/note'
import { NotePanel } from '@/note'
import { PageShell, PageHero, PageToolbar, PageContent, PageStats } from '@/shared/ui/PageShell'
import { PageState } from '@/shared/ui/PageState'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { InteractiveCard } from '@/shared/ui/InteractiveCard'

/* ──────────────────────────────────────────────────────────
 * Color System — maps note.color to gradient + accent styles
 * ────────────────────────────────────────────────────────── */
const COLOR_THEMES = {
  default: {
    bg: 'var(--bg-elevated)',
    glow: 'transparent',
    accent: 'var(--text-primary)',
    chip: 'var(--bg-subtle)',
    border: 'var(--border-subtle)',
    gradient: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-subtle))',
    dotColor: 'var(--text-muted)',
  },
  amber: {
    bg: 'rgba(245, 158, 11, 0.04)',
    glow: 'rgba(245, 158, 11, 0.12)',
    accent: '#F59E0B',
    chip: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.2)',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(245,158,11,0.02))',
    dotColor: '#F59E0B',
  },
  rose: {
    bg: 'rgba(244, 63, 94, 0.04)',
    glow: 'rgba(244, 63, 94, 0.12)',
    accent: '#F43F5E',
    chip: 'rgba(244, 63, 94, 0.1)',
    border: 'rgba(244, 63, 94, 0.2)',
    gradient: 'linear-gradient(135deg, rgba(244,63,94,0.06), rgba(244,63,94,0.02))',
    dotColor: '#F43F5E',
  },
  sky: {
    bg: 'rgba(14, 165, 233, 0.04)',
    glow: 'rgba(14, 165, 233, 0.12)',
    accent: '#0EA5E9',
    chip: 'rgba(14, 165, 233, 0.1)',
    border: 'rgba(14, 165, 233, 0.2)',
    gradient: 'linear-gradient(135deg, rgba(14,165,233,0.06), rgba(14,165,233,0.02))',
    dotColor: '#0EA5E9',
  },
  violet: {
    bg: 'rgba(139, 92, 246, 0.04)',
    glow: 'rgba(139, 92, 246, 0.12)',
    accent: '#8B5CF6',
    chip: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(139, 92, 246, 0.2)',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(139,92,246,0.02))',
    dotColor: '#8B5CF6',
  },
}

const SORT_OPTIONS = [
  { id: 'updated', label: 'Last Updated', icon: Clock },
  { id: 'created', label: 'Date Created', icon: Calendar },
  { id: 'title', label: 'Title A→Z', icon: Hash },
  { id: 'words', label: 'Word Count', icon: FileText },
]

/* ──────────────────────────────────────────────────────────
 * MiniMarkdownPreview — lightweight inline markdown rendering
 * for card previews (strips code blocks, shows structure)
 * ────────────────────────────────────────────────────────── */
function MiniMarkdownPreview({ content, maxLines = 4 }) {
  const preview = useMemo(() => {
    if (!content?.trim()) return []
    const lines = content.split('\n').slice(0, maxLines * 2)
    const result = []
    for (const line of lines) {
      if (result.length >= maxLines) break
      if (!line.trim()) continue
      if (line.startsWith('```')) continue
      if (line.startsWith('# ')) { result.push({ type: 'h1', text: line.replace('# ', '') }); continue }
      if (line.startsWith('## ')) { result.push({ type: 'h2', text: line.replace('## ', '') }); continue }
      if (line.startsWith('### ')) { result.push({ type: 'h3', text: line.replace('### ', '') }); continue }
      if (line.startsWith('> ')) { result.push({ type: 'quote', text: line.replace('> ', '') }); continue }
      if (line.startsWith('- [ ] ') || line.startsWith('* [ ] ')) { result.push({ type: 'todo', text: line.replace(/^[-*]\s+\[ \]\s+/, ''), done: false }); continue }
      if (line.startsWith('- [x] ') || line.startsWith('* [x] ')) { result.push({ type: 'todo', text: line.replace(/^[-*]\s+\[x\]\s+/, ''), done: true }); continue }
      if (line.startsWith('- ') || line.startsWith('* ')) { result.push({ type: 'bullet', text: line.replace(/^[-*]\s+/, '') }); continue }
      result.push({ type: 'text', text: line })
    }
    return result
  }, [content, maxLines])

  if (preview.length === 0) {
    return <span className="text-[11px] italic text-[var(--text-muted)]">Empty note — click to start writing...</span>
  }

  const formatInline = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-[var(--text-primary)]">{part.slice(2, -2)}</strong>
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="space-y-0.5">
      {preview.map((line, i) => {
        switch (line.type) {
          case 'h1': return <div key={i} className="text-[12px] font-bold text-[var(--text-primary)] truncate">{formatInline(line.text)}</div>
          case 'h2': return <div key={i} className="text-[12px] font-semibold text-[var(--text-primary)] truncate">{formatInline(line.text)}</div>
          case 'h3': return <div key={i} className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide truncate">{formatInline(line.text)}</div>
          case 'quote': return <div key={i} className="text-[11px] italic text-[var(--text-secondary)] border-l-2 border-[var(--accent)] pl-2 truncate">{formatInline(line.text)}</div>
          case 'todo': return (
            <div key={i} className={cn("flex items-center gap-1.5 text-[11px]", line.done ? "text-[var(--text-muted)] line-through" : "text-[var(--text-secondary)]")}>
              <span className={cn("w-3 h-3 rounded border shrink-0 flex items-center justify-center", line.done ? "bg-[var(--success)] border-[var(--success)]" : "border-[var(--border-subtle)]")}>
                {line.done && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
              </span>
              <span className="truncate">{formatInline(line.text)}</span>
            </div>
          )
          case 'bullet': return <div key={i} className="text-[11px] text-[var(--text-secondary)] flex gap-1.5 truncate"><span className="text-[var(--accent)]">•</span><span className="truncate">{formatInline(line.text)}</span></div>
          default: return <div key={i} className="text-[11px] text-[var(--text-secondary)] truncate">{formatInline(line.text)}</div>
        }
      })}
      {content && content.split('\n').length > maxLines * 2 && (
        <div className="text-[10px] text-[var(--text-muted)] italic pt-0.5">+{content.split('\n').length - maxLines * 2} more lines</div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
 * NoteCard — premium note card with markdown preview,
 * color theming, hover actions, and metadata
 * ────────────────────────────────────────────────────────── */
function NoteCard({ note, index, onOpen, onDelete, onTogglePin, isPinnedSection }) {
  const theme = COLOR_THEMES[note.color] || COLOR_THEMES.default
  const wordCount = useMemo(() => (note.content || '').split(/\s+/).filter(Boolean).length, [note.content])
  const hasChecklist = useMemo(() => /^[-*]\s+\[[ x]\]\s+/m.test(note.content || ''), [note.content])
  const checklistTotal = useMemo(() => {
    const matches = (note.content || '').match(/^[-*]\s+\[[ x]\]\s+/gm)
    return matches ? matches.length : 0
  }, [note.content])
  const checklistDone = useMemo(() => {
    const matches = (note.content || '').match(/^[-*]\s+\[x\]\s+/gm)
    return matches ? matches.length : 0
  }, [note.content])
  const hasCode = useMemo(() => note.content?.includes('```'), [note.content])
  const hasQuote = useMemo(() => /^>\s/m.test(note.content || ''), [note.content])
  const updatedDate = useMemo(() => {
    if (!note.updatedAt) return null
    const d = new Date(note.updatedAt)
    const now = new Date()
    const diffH = (now - d) / (1000 * 60 * 60)
    if (diffH < 1) return 'Just now'
    if (diffH < 24) return `${Math.floor(diffH)}h ago`
    if (diffH < 48) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }, [note.updatedAt])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 24 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <InteractiveCard
        onClick={() => onOpen(note)}
        className={cn('h-full p-4 group relative')}
        style={{
          background: theme.gradient,
          borderColor: theme.border,
        }}
      >
        {/* Color dot indicator */}
        <div
          className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-70"
          style={{ backgroundColor: theme.dotColor }}
        />

        {/* Pin badge for pinned section */}
        {isPinnedSection && (
          <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-md z-10">
            <Pin className="w-2.5 h-2.5 text-white fill-white" />
          </div>
        )}

        {/* Header: Title + Actions */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className="w-1 h-4 rounded-full shrink-0"
              style={{ backgroundColor: theme.accent }}
            />
            <Heading
              level={4}
              className="line-clamp-1 text-[13px] font-semibold tracking-tight text-[var(--text-primary)]"
            >
              {note.title || 'Untitled Note'}
            </Heading>
          </div>
          <div className={cn(
            "flex items-center gap-0.5 shrink-0 transition-opacity",
            isPinnedSection ? "opacity-80" : "opacity-0 group-hover:opacity-100"
          )}>
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin(note) }}
              className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
              title={note.isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin className={cn('w-3 h-3', note.isPinned ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-muted)]')} />
            </button>
            <button
              onClick={(e) => onDelete(e, note.id)}
              className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-[var(--danger-soft)] transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-3 h-3 text-[var(--text-muted)] hover:text-[var(--danger)]" />
            </button>
          </div>
        </div>

        {/* Markdown preview body */}
        <div className="min-h-[3.5em] mb-3">
          <MiniMarkdownPreview content={note.content} maxLines={4} />
        </div>

        {/* Feature tags */}
        {(hasChecklist || hasCode || hasQuote) && (
          <div className="flex items-center gap-1 mb-2.5 flex-wrap">
            {hasChecklist && checklistTotal > 0 && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold"
                style={{ backgroundColor: theme.chip, color: theme.accent }}
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
                {checklistDone}/{checklistTotal}
              </span>
            )}
            {hasCode && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold"
                style={{ backgroundColor: theme.chip, color: theme.accent }}
              >
                <Hash className="w-2.5 h-2.5" /> Code
              </span>
            )}
            {hasQuote && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold"
                style={{ backgroundColor: theme.chip, color: theme.accent }}
              >
                <Lightbulb className="w-2.5 h-2.5" /> Quote
              </span>
            )}
          </div>
        )}

        {/* Footer: metadata */}
        <div className="flex items-center gap-2.5 pt-2.5 border-t text-[10px] text-[var(--text-tertiary)]" style={{ borderColor: theme.border }}>
          <span className="flex items-center gap-1">
            <FileText className="w-2.5 h-2.5" />
            <span className="font-mono tabular-nums">{wordCount}</span>
            <span className="text-[var(--text-muted)]">words</span>
          </span>
          {updatedDate && (
            <span className="flex items-center gap-1 ml-auto">
              <Clock className="w-2.5 h-2.5" />
              {updatedDate}
            </span>
          )}
        </div>

        {/* Hover glow effect */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ boxShadow: `0 4px 20px ${theme.glow}` }}
        />
      </InteractiveCard>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────────────
 * NoteSkeleton — loading placeholder
 * ────────────────────────────────────────────────────────── */
function NoteSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[180px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 flex flex-col animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-[var(--bg-subtle)]" />
            <div className="h-4 w-2/3 bg-[var(--bg-subtle)] rounded-md" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="h-2.5 w-full bg-[var(--bg-subtle)] rounded" />
            <div className="h-2.5 w-4/5 bg-[var(--bg-subtle)] rounded" />
            <div className="h-2.5 w-3/5 bg-[var(--bg-subtle)] rounded" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
            <div className="h-2.5 w-12 bg-[var(--bg-subtle)] rounded" />
            <div className="h-2.5 w-10 bg-[var(--bg-subtle)] rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
 * EmptyState — creative empty state with onboarding nudge
 * ────────────────────────────────────────────────────────── */
function NotesEmptyState({ searchQuery, onAction, hasFilters }) {
  if (hasFilters) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-subtle)]/30"
      >
        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mb-4">
          <Search className="w-6 h-6 text-[var(--text-tertiary)]" />
        </div>
        <Heading level={3} className="text-[16px] font-bold tracking-tight mb-1.5 text-[var(--text-primary)]">
          No notes match your search
        </Heading>
        <Text variant="muted" className="text-[13px] max-w-sm mb-5 leading-relaxed">
          Try a different keyword or clear your filters to see all notes.
        </Text>
        <Button variant="outline" size="sm" onClick={onAction} className="h-8 text-[12px] gap-1.5">
          <Archive className="w-3.5 h-3.5" /> Clear Filters
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden flex flex-col items-center justify-center py-20 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl bg-gradient-to-b from-[var(--bg-subtle)]/40 to-[var(--bg-elevated)]"
    >
      {/* Decorative floating note icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-[0.04]"
            initial={{ y: 0, rotate: 0 }}
            animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            style={{ left: `${15 + i * 18}%`, top: `${10 + (i % 3) * 25}%` }}
          >
            <StickyNote className="w-12 h-12 text-[var(--text-primary)]" />
          </motion.div>
        ))}
      </div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-16 h-16 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center mb-5 shadow-lg"
      >
        <Lightbulb className="w-7 h-7 text-[var(--accent)]" />
      </motion.div>

      <Heading level={3} className="relative z-10 text-[18px] font-bold tracking-tight mb-2 text-[var(--text-primary)]">
        Your notebook is a blank canvas
      </Heading>
      <Text variant="muted" className="relative z-10 text-[13px] max-w-md mb-6 leading-relaxed">
        Capture ideas, draft specs, keep checklists, or jot down meeting notes.
        Everything is private to your workspace.
      </Text>

      {/* Quick-start suggestion chips */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 mb-6 max-w-md">
        {[
          { icon: CheckCircle2, label: 'Project checklist', color: 'var(--success)' },
          { icon: BookOpen, label: 'Meeting notes', color: 'var(--info)' },
          { icon: Lightbulb, label: 'Brainstorm dump', color: 'var(--warning)' },
          { icon: Hash, label: 'Code snippet', color: 'var(--accent)' },
        ].map((chip) => (
          <button
            key={chip.label}
            onClick={onAction}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)] transition-all text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] cursor-pointer group"
          >
            <chip.icon className="w-3 h-3" style={{ color: chip.color }} />
            {chip.label}
          </button>
        ))}
      </div>

      <Button onClick={onAction} size="sm" className="relative z-10 h-9 text-[13px] gap-2 font-semibold">
        <Plus className="w-4 h-4" />
        Create Your First Note
      </Button>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────────────
 * StatChip — compact stat for the stats strip
 * ────────────────────────────────────────────────────────── */
function StatChip({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}15` }}
      >
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <div className="text-[16px] font-bold text-[var(--text-primary)] tabular-nums leading-none font-mono">{value}</div>
        <div className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mt-1 truncate">{label}</div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
 * NotesPage — Enhanced with creative UI
 * ══════════════════════════════════════════════════════════ */
export function NotesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: notes = [], isLoading } = useNotes()
  const deleteNote = useDeleteNote()
  const updateNote = useUpdateNote()
  const { confirm, dialog } = useConfirmDialog()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('updated')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [activeNote, setActiveNote] = useState(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const handleDeleteNote = async (e, noteId) => {
    e.stopPropagation()
    const confirmed = await confirm({
      title: 'Delete Note?',
      description: 'Are you sure you want to delete this note? This action cannot be undone.',
      danger: true,
    })
    if (confirmed) deleteNote.mutate(noteId)
  }

  const openNew = () => { setActiveNote(null); setIsPanelOpen(true) }
  const openEdit = (note) => { setActiveNote(note); setIsPanelOpen(true) }

  const closePanel = () => {
    setIsPanelOpen(false)
    setActiveNote(null)
    if (searchParams.has('openNoteId')) {
      setSearchParams(params => { params.delete('openNoteId'); return params }, { replace: true })
    }
  }

  const openNoteId = searchParams.get('openNoteId')
  useEffect(() => {
    if (openNoteId && notes?.length > 0) {
      const targetNote = notes.find(n => String(n.id) === String(openNoteId))
      if (targetNote && (!activeNote || activeNote.id !== targetNote.id)) {
        queueMicrotask(() => { setActiveNote(targetNote); setIsPanelOpen(true) })
      }
    }
  }, [openNoteId, notes, activeNote])

  const togglePin = (note) => updateNote.mutate({ id: note.id, payload: { ...note, isPinned: !note.isPinned } })

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes
    const q = searchQuery.toLowerCase()
    return notes.filter(n =>
      n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)
    )
  }, [notes, searchQuery])

  const sortedNotes = useMemo(() => {
    const sorted = [...filteredNotes]
    switch (sortBy) {
      case 'title':
        return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
      case 'created':
        return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      case 'words':
        return sorted.sort((a, b) =>
          (b.content || '').split(/\s+/).filter(Boolean).length -
          (a.content || '').split(/\s+/).filter(Boolean).length
        )
      case 'updated':
      default:
        return sorted.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    }
  }, [filteredNotes, sortBy])

  const pinnedNotes = useMemo(() => sortedNotes.filter(n => n.isPinned), [sortedNotes])
  const otherNotes = useMemo(() => sortedNotes.filter(n => !n.isPinned), [sortedNotes])

  /* ── Stats ── */
  const stats = useMemo(() => {
    const totalWords = notes.reduce((acc, n) => acc + (n.content || '').split(/\s+/).filter(Boolean).length, 0)
    const checklists = notes.filter(n => /^[-*]\s+\[[ x]\]\s+/m.test(n.content || '')).length
    const withCode = notes.filter(n => n.content?.includes('```')).length
    return {
      total: notes.length,
      words: totalWords,
      checklists,
      code: withCode,
    }
  }, [notes])

  const pageState = isLoading ? 'loading' : (filteredNotes.length === 0 ? 'empty' : 'ready')
  const hasFilters = searchQuery.trim().length > 0

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSortBy('updated')
  }, [])

  return (
    <PageShell maxWidth="default" workspaceMode="PERSONAL">
      <PageHero
        title="Private Notes & Scratchpad"
        subtitle="Capture ideas, draft specs, and keep checklists in your personal workspace."
        eyebrow="Personal"
        icon={StickyNote}
      >
        <Button onClick={openNew} size="sm" className="gap-1.5 h-8 text-[12px] shrink-0 font-semibold shadow-xs">
          <Plus className="w-3.5 h-3.5" />
          New Note
        </Button>
      </PageHero>

      {/* Stats Strip */}
      {!isLoading && notes.length > 0 && (
        <PageStats>
          <StatChip icon={StickyNote} label="Total Notes" value={stats.total} accent="var(--accent)" />
          <StatChip icon={FileText} label="Total Words" value={stats.words.toLocaleString()} accent="var(--info)" />
          <StatChip icon={CheckCircle2} label="Checklists" value={stats.checklists} accent="var(--success)" />
          <StatChip icon={Hash} label="With Code" value={stats.code} accent="var(--warning)" />
        </PageStats>
      )}

      <PageToolbar>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search notes by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-[12px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <span className="text-[14px]">×</span>
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1.5 px-3 h-8 text-[12px] font-medium rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--accent-border)] transition-colors cursor-pointer text-[var(--text-secondary)]"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span className="hidden sm:inline">Sort:</span>
              {SORT_OPTIONS.find(s => s.id === sortBy)?.label}
            </button>
            <AnimatePresence>
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowSortMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1 w-44 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg shadow-xl z-30 overflow-hidden py-1"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => { setSortBy(opt.id); setShowSortMenu(false) }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-1.5 text-[12px] transition-colors cursor-pointer text-left",
                          sortBy === opt.id
                            ? "bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                        )}
                      >
                        <opt.icon className="w-3.5 h-3.5" />
                        {opt.label}
                        {sortBy === opt.id && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </PageToolbar>

      <PageContent>
        <PageState
          state={pageState}
          stateProps={{
            loadingVariant: 'cards',
            onAction: openNew,
            actionLabel: 'New Note',
          }}
        >
          {isLoading ? (
            <NoteSkeleton />
          ) : filteredNotes.length === 0 ? (
            <NotesEmptyState
              searchQuery={searchQuery}
              onAction={hasFilters ? clearFilters : openNew}
              hasFilters={hasFilters}
            />
          ) : (
            <div className="space-y-8">
              {/* Pinned Notes */}
              {pinnedNotes.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-[var(--accent-soft)] flex items-center justify-center">
                        <Pin className="w-3 h-3 fill-[var(--accent)] text-[var(--accent)]" />
                      </div>
                      <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                        Pinned
                      </span>
                    </div>
                    <Badge variant="secondary" size="xs" className="font-mono text-[10px]">
                      {pinnedNotes.length}
                    </Badge>
                    <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                      {pinnedNotes.map((note, idx) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          index={idx}
                          onOpen={openEdit}
                          onDelete={handleDeleteNote}
                          onTogglePin={togglePin}
                          isPinnedSection
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}

              {/* Other Notes */}
              {otherNotes.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-[var(--bg-subtle)] flex items-center justify-center">
                        <Layers className="w-3 h-3 text-[var(--text-muted)]" />
                      </div>
                      <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        {pinnedNotes.length > 0 ? 'Other Notes' : 'All Notes'}
                      </span>
                    </div>
                    <Badge variant="secondary" size="xs" className="font-mono text-[10px]">
                      {otherNotes.length}
                    </Badge>
                    <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                      {otherNotes.map((note, idx) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          index={idx}
                          onOpen={openEdit}
                          onDelete={handleDeleteNote}
                          onTogglePin={togglePin}
                          isPinnedSection={false}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}
            </div>
          )}
        </PageState>
      </PageContent>

      <NotePanel note={activeNote} isOpen={isPanelOpen} onClose={closePanel} />
      {dialog}
    </PageShell>
  )
}

export default NotesPage
