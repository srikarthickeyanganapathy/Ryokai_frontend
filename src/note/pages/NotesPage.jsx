import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { format, isToday, isSameDay } from 'date-fns'
import {
  Pin, Plus, Trash2, Search, Calendar, FileText, Clock,
  Sparkles, Hash, ArrowUpDown, Layers, CheckCircle2,
  Lightbulb, BookOpen, Archive, LayoutGrid, List as ListIcon,
  PenLine, Check, Timer, CornerDownLeft
} from '@/shared/ui/Icons'
import { Button, IconButton } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { SearchInput } from '@/shared/ui/SearchInput'
import { Badge } from '@/shared/ui/Badge'
import { cn } from '@/shared/lib/cn'
import { useNotes, useDeleteNote, useUpdateNote, useCreateNote, NotePanel } from '@/note'
import { noteDna } from '../entities/model/dna'
import { PageShell, PageHero, PageToolbar, PageContent } from '@/shared/ui/PageShell'
import { PageState } from '@/shared/ui/PageState'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { InteractiveCard } from '@/shared/ui/InteractiveCard'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'

const COLOR_THEMES = {
  default: {
    bg: 'var(--bg-elevated)', glow: 'transparent', accent: 'var(--text-primary)',
    chip: 'var(--bg-subtle)', border: 'var(--border-subtle)',
    gradient: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-subtle))',
    dotColor: 'var(--text-muted)',
  },
  amber: {
    bg: 'rgba(245, 158, 11, 0.04)', glow: 'rgba(245, 158, 11, 0.12)', accent: '#F59E0B',
    chip: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(245,158,11,0.02))',
    dotColor: '#F59E0B',
  },
  rose: {
    bg: 'rgba(244, 63, 94, 0.04)', glow: 'rgba(244, 63, 94, 0.12)', accent: '#F43F5E',
    chip: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.2)',
    gradient: 'linear-gradient(135deg, rgba(244,63,94,0.06), rgba(244,63,94,0.02))',
    dotColor: '#F43F5E',
  },
  sky: {
    bg: 'rgba(14, 165, 233, 0.04)', glow: 'rgba(14, 165, 233, 0.12)', accent: '#0EA5E9',
    chip: 'rgba(14, 165, 233, 0.1)', border: 'rgba(14, 165, 233, 0.2)',
    gradient: 'linear-gradient(135deg, rgba(14,165,233,0.06), rgba(14,165,233,0.02))',
    dotColor: '#0EA5E9',
  },
  violet: {
    bg: 'rgba(139, 92, 246, 0.04)', glow: 'rgba(139, 92, 246, 0.12)', accent: '#8B5CF6',
    chip: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.2)',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(139,92,246,0.02))',
    dotColor: '#8B5CF6',
  },
}

const SORT_OPTIONS = [
  { id: 'updated', label: 'Last Updated', icon: Clock },
  { id: 'created', label: 'Date Created', icon: Calendar },
  { id: 'title', label: 'Title A-Z', icon: Hash },
  { id: 'words', label: 'Word Count', icon: FileText },
]

const FRESHNESS_COLORS = {
  fresh: 'var(--success)',
  recent: 'var(--warning)',
  old: 'var(--text-tertiary)',
}

const TYPE_META = {
  text: { label: 'Text', color: 'var(--text-muted)' },
  checklist: { label: 'Checklist', color: 'var(--success)' },
  code: { label: 'Code', color: 'var(--accent)' },
  quote: { label: 'Quote', color: 'var(--warning)' },
}

function detectType(content) {
  const c = content || ''
  if (/^[-*]\s+\[[ xX]\]\s+/m.test(c)) return 'checklist'
  if (c.includes('```')) return 'code'
  if (/^>\s/m.test(c)) return 'quote'
  return 'text'
}

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
    return <span className="text-[11px] italic text-[var(--text-muted)]">Empty note - click to start writing...</span>
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
                {line.done && <Check className="w-2.5 h-2.5 text-white" />}
              </span>
              <span className="truncate min-w-0">{formatInline(line.text)}</span>
            </div>
          )
          case 'bullet': return <div key={i} className="text-[11px] text-[var(--text-secondary)] flex gap-1.5 truncate"><span className="text-[var(--accent)] shrink-0">-</span><span className="truncate min-w-0">{formatInline(line.text)}</span></div>
          default: return <div key={i} className="text-[11px] text-[var(--text-secondary)] truncate">{formatInline(line.text)}</div>
        }
      })}
      {content && content.split('\n').length > maxLines * 2 && (
        <div className="text-[10px] text-[var(--text-muted)] italic pt-0.5">+{content.split('\n').length - maxLines * 2} more lines</div>
      )}
    </div>
  )
}

function CaptureStrip({ onCreate, isCreating }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const type = detectType(content)
  const typeMeta = TYPE_META[type]
  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const submit = useCallback(() => {
    const trimmed = content.trim()
    if (!trimmed) return
    const fallbackTitle = trimmed.split('\n')[0]?.replace(/^[#>*\s-]+/, '').replace(/^\[[ xX]\]\s*/, '').slice(0, 60) || 'Untitled Note'
    onCreate({
      title: title.trim() || fallbackTitle,
      content: trimmed,
      color: 'default',
      isPinned: false,
    })
    setTitle('')
    setContent('')
    setOpen(false)
  }, [title, content, onCreate])

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
    else if (e.key === 'Escape' && open) { setOpen(false); setTitle(''); setContent('') }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 px-4 h-11 rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)]/40 transition-colors group cursor-text"
      >
        <PenLine className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" strokeWidth={1.5} />
        <span className="text-[13px] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">Capture a thought - it becomes a note</span>
        <span className="ml-auto hidden sm:flex items-center gap-1 text-[10px] font-mono text-[var(--text-tertiary)]">
          <kbd className="px-1.5 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-subtle)]">Enter</kbd>
          <span>to save</span>
        </span>
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-[var(--accent-border)] bg-[var(--bg-elevated)] shadow-lg overflow-hidden">
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Note title (optional - auto-detected from content)"
        className="w-full px-4 py-3 bg-transparent text-[14px] font-semibold tracking-tight text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border-b border-[var(--border-subtle)] focus:outline-none"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Start typing… — [ ] checklist, ``` code, > quote"
        rows={3}
        className="w-full px-4 py-3 bg-transparent text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none resize-none leading-relaxed"
      />
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)]/40 flex-wrap">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono transition-colors"
          style={{ backgroundColor: `${typeMeta.color}15`, color: typeMeta.color }}
        >
          {type === 'checklist' && <CheckCircle2 className="w-3 h-3" />}
          {type === 'code' && <Hash className="w-3 h-3" />}
          {type === 'quote' && <Lightbulb className="w-3 h-3" />}
          {type === 'text' && <FileText className="w-3 h-3" />}
          {typeMeta.label}
        </span>
        {wordCount > 0 && <span className="text-[10px] tabular-nums text-[var(--text-muted)]" style={{fontFamily: "'JetBrains Mono', monospace"}}>{wordCount} words</span>}
        <span className="ml-auto hidden sm:flex items-center gap-1 text-[10px] text-[var(--text-tertiary)] font-mono">
          <kbd className="px-1 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-card)]">Enter</kbd> save
          <span className="mx-1">/</span>
          <kbd className="px-1 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-card)]">Esc</kbd> close
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => { setOpen(false); setTitle(''); setContent('') }}>Cancel</Button>
          <Button size="sm" className="h-7 text-[11px] gap-1" onClick={submit} disabled={isCreating || !content.trim()} isLoading={isCreating}>
            <CornerDownLeft className="w-3 h-3" /> Capture
          </Button>
        </div>
      </div>
    </div>
  )
}


function NoteCard({ note, onOpen, onDelete, onTogglePin, isPinnedSection }) {
  const theme = COLOR_THEMES[note.color] || COLOR_THEMES.default
  const dna = noteDna(note)
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
    <InteractiveCard
      onClick={() => onOpen(note)}
      className={cn('h-full p-4 group relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]')}
    >
      <div
        className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-80"
        style={{ backgroundColor: FRESHNESS_COLORS[dna.freshness] }}
        title={dna.freshness === 'fresh' ? 'Edited recently' : dna.freshness === 'recent' ? 'Edited this week' : 'Older note'}
      />

      {isPinnedSection && (
        <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-md z-10">
          <Pin className="w-2.5 h-2.5 text-white fill-white" />
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: theme.accent }} />
          <Heading level={4} className="line-clamp-1 text-[14px] font-bold tracking-[-0.01em] text-[var(--text-primary)]" style={{fontFamily: "'Cormorant Garamond', 'Georgia', serif"}}>
            {note.title || 'Untitled Note'}
          </Heading>
        </div>
        <div className={cn(
          "flex items-center gap-0.5 shrink-0 transition-opacity",
          isPinnedSection ? "opacity-80" : "opacity-0 group-hover:opacity-100"
        )}>
          <IconButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onTogglePin(note) }} className="w-6 h-6" title={note.isPinned ? 'Unpin' : 'Pin'}>
            <Pin className={cn('w-3 h-3', note.isPinned ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-muted)]')} />
          </IconButton>
          <IconButton variant="ghost" size="sm" onClick={(e) => onDelete(e, note.id)} className="w-6 h-6 hover:text-[var(--danger)]" title="Delete">
            <Trash2 className="w-3 h-3" />
          </IconButton>
        </div>
      </div>

      <div className="min-h-[3.5em] mb-3">
        <MiniMarkdownPreview content={note.content} maxLines={4} />
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {note.tags.slice(0, 4).map(tag => (
            <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium font-mono" style={{ backgroundColor: theme.chip, color: theme.accent }}>
              {tag}
            </span>
          ))}
          {note.tags.length > 4 && (
            <span className="text-[9px] font-mono text-[var(--text-muted)]">+{note.tags.length - 4}</span>
          )}
        </div>
      )}

      {dna.hasChecklist && (
        <div className="mb-2.5">
          <div className="h-[3px] rounded-full bg-[var(--bg-subtle)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--success)]" style={{ width: `${dna.progress}%` }} />
          </div>
        </div>
      )}

      {(dna.hasChecklist || dna.hasCode || dna.hasQuote) && (
        <div className="flex items-center gap-1 mb-2.5 flex-wrap">
          {dna.hasChecklist && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold" style={{ backgroundColor: theme.chip, color: theme.accent }}>
              <CheckCircle2 className="w-2.5 h-2.5" />
              {dna.checklistDone}/{dna.checklistTotal}
            </span>
          )}
          {dna.hasCode && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold" style={{ backgroundColor: theme.chip, color: theme.accent }}>
              <Hash className="w-2.5 h-2.5" /> Code
            </span>
          )}
          {dna.hasQuote && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold" style={{ backgroundColor: theme.chip, color: theme.accent }}>
              <Lightbulb className="w-2.5 h-2.5" /> Quote
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2.5 pt-2.5 border-t text-[10px] text-[var(--text-tertiary)]" style={{ borderColor: theme.border }}>
        <span className="flex items-center gap-1">
          <FileText className="w-2.5 h-2.5" />
          <span className="font-mono tabular-nums">{dna.words}</span>
          <span className="text-[var(--text-muted)]">words</span>
        </span>
        {dna.words > 0 && (
          <span className="flex items-center gap-1">
            <Timer className="w-2.5 h-2.5" />
            <span className="font-mono tabular-nums">{dna.readingMinutes}m</span>
          </span>
        )}
        {updatedDate && (
          <span className="flex items-center gap-1 ml-auto">
            <Clock className="w-2.5 h-2.5" />
            {updatedDate}
          </span>
        )}
      </div>
    </InteractiveCard>
  )
}

function StreamDay({ group, onOpen, onDelete, onTogglePin }) {
  const words = group.notes.reduce((acc, n) => acc + (noteDna(n).words || 0), 0)
  return (
    <div className="relative pl-6">
      <div className="absolute left-0 top-1 bottom-0 w-px bg-[var(--border-subtle)]" />
      {group.notes.map((note, i) => (
        <div
          key={note.id}
          className="absolute -left-[5px] w-[11px] h-[11px] rounded-full border-2 border-[var(--bg-base)]"
          style={{ top: 26 + i * 62, backgroundColor: FRESHNESS_COLORS[noteDna(note).freshness] }}
        />
      ))}

      <div className="sticky top-0 z-10 flex items-center gap-2.5 py-2 bg-[var(--bg-base)]/85 backdrop-blur-md">
        <span className="text-[12px] font-bold text-[var(--text-primary)] tracking-tight" style={{fontFamily: "'DM Sans', sans-serif"}}>{group.label}</span>
        <span className="text-[10px] font-mono text-[var(--text-tertiary)] tabular-nums">{group.notes.length} note{group.notes.length !== 1 ? 's' : ''} / {words} words</span>
        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
      </div>

      <div className="space-y-2 pb-6">
        {group.notes.map((note) => {
          const theme = COLOR_THEMES[note.color] || COLOR_THEMES.default
          const dna = noteDna(note)
          return (
            <InteractiveCard key={note.id} variant="flat" onClick={() => onOpen(note)} className="px-4 py-3 group">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: theme.accent }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold tracking-[-0.01em] text-[var(--text-primary)] truncate" style={{fontFamily: "'Cormorant Garamond', 'Georgia', serif"}}>{note.title || 'Untitled Note'}</span>
                    {note.isPinned && <Pin className="w-3 h-3 fill-[var(--accent)] text-[var(--accent)] shrink-0" />}
                    {dna.hasChecklist && (
                      <span className="shrink-0 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: theme.chip, color: theme.accent }}>
                        {dna.checklistDone}/{dna.checklistTotal}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                    {note.content ? note.content.replace(/^[-*]\s+\[[ xX]\]\s+/gm, '').replace(/[#>*`]/g, '').split('\n').find(l => l.trim())?.slice(0, 90) || 'Empty note' : 'Empty note'}
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-mono tabular-nums text-[var(--text-tertiary)] hidden sm:block">
                  {note.updatedAt ? format(new Date(note.updatedAt), 'h:mm a') : ''}
                </span>
                <div className="shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onTogglePin(note) }} className="w-6 h-6" title="Pin">
                    <Pin className={cn('w-3 h-3', note.isPinned ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-muted)]')} />
                  </IconButton>
                  <IconButton variant="ghost" size="sm" onClick={(e) => onDelete(e, note.id)} className="w-6 h-6 hover:text-[var(--danger)]" title="Delete">
                    <Trash2 className="w-3 h-3" />
                  </IconButton>
                </div>
              </div>
            </InteractiveCard>
          )
        })}
      </div>
    </div>
  )
}

function NoteSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[180px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 flex flex-col animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
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

function NotesEmptyState({ searchQuery, onAction, hasFilters }) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-subtle)]/30">
        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mb-4">
          <Search className="w-6 h-6 text-[var(--text-tertiary)]" />
        </div>
        <Heading level={3} className="text-[16px] font-bold tracking-tight mb-1.5 text-[var(--text-primary)]">No notes match your search</Heading>
        <Text variant="muted" className="text-[13px] max-w-sm mb-5 leading-relaxed">Try a different keyword or clear your filters to see all notes.</Text>
        <Button variant="outline" size="sm" onClick={onAction} className="h-8 text-[12px] gap-1.5">
          <Archive className="w-3.5 h-3.5" /> Clear Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-subtle)]/30">
      <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center mb-5">
        <Sparkles className="w-7 h-7 text-[var(--accent)]" />
      </div>
      <Heading level={3} className="text-[18px] font-bold tracking-tight mb-2 text-[var(--text-primary)]">
        Your notes start here
      </Heading>
      <Text variant="muted" className="text-[13px] max-w-md mb-6 leading-relaxed">
        Capture ideas, draft specs, keep checklists, or jot down meeting notes.
        Use the capture strip above - everything stays private to your workspace.
      </Text>
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-md">
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
      <Button onClick={onAction} size="sm" className="h-9 text-[13px] gap-2 font-semibold">
        <Plus className="w-4 h-4" />
        Plant Your First Note
      </Button>
    </div>
  )
}


/* Workspace scope helpers */
function useNoteScope() {
  const { workspaceMode, activeOrganization, activeCrew } = useWorkspace()
  if (workspaceMode === 'ORG' && activeOrganization?.id) return { orgId: activeOrganization.id }
  if (workspaceMode === 'CREWS' && activeCrew?.id) return { crewId: activeCrew.id }
  return {}
}

const WORKSPACE_EYEBROW = {
  PERSONAL: 'Personal Notes',
  ORG: (org) => `${org?.name || 'Organization'} Notes`,
  CREWS: (crew) => `${crew?.name || 'Crew'} Notes`,
}

export function NotesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const scope = useNoteScope()
  const { workspaceMode, activeOrganization, activeCrew } = useWorkspace()

  const { data: notes = [], isLoading } = useNotes(scope)
  const deleteNote = useDeleteNote()
  const updateNote = useUpdateNote()
  const createNote = useCreateNote(scope)
  const { confirm, dialog } = useConfirmDialog()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('updated')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [gardenMode, setGardenMode] = useState(() => searchParams.get('view') === 'stream' ? 'stream' : 'canvas')
  const [activeNote, setActiveNote] = useState(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const setMode = (mode) => {
    setGardenMode(mode)
    setSearchParams(params => { params.set('view', mode); return params }, { replace: true })
  }

  const handleDeleteNote = async (e, noteId) => {
    e.stopPropagation()
    const confirmed = await confirm({
      title: 'Delete Note?',
      description: 'Are you sure you want to delete this note? This action cannot be undone.',
      danger: true,
      confirmLabel: 'Delete Note',
    })
    if (confirmed) deleteNote.mutate(noteId)
  }

  const handleCreate = (payload) => createNote.mutate(payload)

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
      n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q) ||
      (n.tags || []).some(t => t.toLowerCase().includes(q))
    )
  }, [notes, searchQuery])

  const sortedNotes = useMemo(() => {
    const sorted = [...filteredNotes]
    switch (sortBy) {
      case 'title': return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
      case 'created': return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      case 'words': return sorted.sort((a, b) => noteDna(b).words - noteDna(a).words)
      case 'updated':
      default: return sorted.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    }
  }, [filteredNotes, sortBy])

  const pinnedNotes = useMemo(() => sortedNotes.filter(n => n.isPinned), [sortedNotes])
  const otherNotes = useMemo(() => sortedNotes.filter(n => !n.isPinned), [sortedNotes])

  const streamGroups = useMemo(() => {
    const groups = []
    for (const note of sortedNotes) {
      const ts = note.updatedAt || note.createdAt
      if (!ts) continue
      const d = new Date(ts)
      const key = format(d, 'yyyy-MM-dd')
      const label = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'EEEE, MMM d')
      let g = groups[groups.length - 1]
      if (!g || g.key !== key) { g = { key, label, date: d, notes: [] }; groups.push(g) }
      g.notes.push(note)
    }
    return groups
  }, [sortedNotes])

  const stats = useMemo(() => {
    let totalWords = 0
    let checklistTotal = 0
    let checklistDone = 0
    const activeDays = new Set()
    for (const n of notes) {
      const dna = noteDna(n)
      totalWords += dna.words
      checklistTotal += dna.checklistTotal
      checklistDone += dna.checklistDone
      const ts = n.updatedAt || n.createdAt
      if (ts) activeDays.add(format(new Date(ts), 'yyyy-MM-dd'))
    }
    return { total: notes.length, words: totalWords, checklistTotal, checklistDone, activeDays: activeDays.size }
  }, [notes])

  // True-empty (no notes at all) goes to the PageState empty shell;
  // filter-empty (search with no matches) renders the custom empty state.
  const pageState = isLoading ? 'loading' : (notes.length === 0 ? 'empty' : 'ready')
  const hasFilters = searchQuery.trim().length > 0

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSortBy('updated')
  }, [])

  const workspaceModeLabel = workspaceMode === 'ORG' ? 'ORG' : workspaceMode === 'CREWS' ? 'CREWS' : 'PERSONAL'
  const eyebrow = workspaceMode === 'ORG'
    ? WORKSPACE_EYEBROW.ORG(activeOrganization)
    : workspaceMode === 'CREWS'
      ? WORKSPACE_EYEBROW.CREWS(activeCrew)
      : WORKSPACE_EYEBROW.PERSONAL

  const subtitle = stats.total > 0
    ? `${stats.total} note${stats.total !== 1 ? 's' : ''} - ${stats.words.toLocaleString()} words - ${stats.checklistDone}/${stats.checklistTotal} checklist items - ${stats.activeDays} active day${stats.activeDays !== 1 ? 's' : ''}`
    : 'Capture thoughts, keep checklists, and find notes fast.'

  return (
    <PageShell maxWidth="default" workspaceMode={workspaceModeLabel}>
      {/* Page hero — workspace-framework PageHero contract */}
      <PageHero
        eyebrow={eyebrow}
        title="Notes"
        subtitle={subtitle}
        actions={
          <Button onClick={openNew} size="sm" className="gap-1.5 h-8 text-[12px] shrink-0 font-semibold shadow-xs">
            <Plus className="w-3.5 h-3.5" />
            New Note
          </Button>
        }
      />

      <div className="px-4 sm:px-6">
        <CaptureStrip onCreate={handleCreate} isCreating={createNote.isPending} />
      </div>

      <PageToolbar>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search notes by title, content, or tags..."
            debounceMs={0}
            className="flex-1 max-w-md"
          />

          <div className="flex items-center bg-[var(--bg-subtle)] rounded-lg p-0.5 border border-[var(--border-subtle)]">
            <button
              onClick={() => setMode('canvas')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer', gardenMode === 'canvas' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--accent)] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Canvas
            </button>
            <button
              onClick={() => setMode('stream')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer', gardenMode === 'stream' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--accent)] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}
            >
              <ListIcon className="w-3.5 h-3.5" /> Stream
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1.5 px-3 h-8 text-[12px] font-medium rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--accent-border)] transition-colors cursor-pointer text-[var(--text-secondary)]"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span className="hidden sm:inline">Sort:</span>
              {SORT_OPTIONS.find(s => s.id === sortBy)?.label}
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-44 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg shadow-xl z-30 overflow-hidden py-1">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => { setSortBy(opt.id); setShowSortMenu(false) }}
                      className={cn("w-full flex items-center gap-2 px-3 py-1.5 text-[12px] transition-colors cursor-pointer text-left", sortBy === opt.id ? "bg-[var(--accent-soft)] text-[var(--accent)] font-semibold" : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]")}
                    >
                      <opt.icon className="w-3.5 h-3.5" />
                      {opt.label}
                      {sortBy === opt.id && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </PageToolbar>

      <PageContent>
        <PageState state={pageState} stateProps={{skeleton: <NoteSkeleton />,  loadingVariant: 'cards', onAction: openNew, actionLabel: 'New Note' }}>
          {isLoading ? (
            <NoteSkeleton />
          ) : filteredNotes.length === 0 ? (
            <NotesEmptyState searchQuery={searchQuery} onAction={hasFilters ? clearFilters : openNew} hasFilters={hasFilters} />
          ) : gardenMode === 'canvas' ? (
            <div className="space-y-8">
              {pinnedNotes.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-[var(--accent-soft)] flex items-center justify-center">
                        <Pin className="w-3 h-3 fill-[var(--accent)] text-[var(--accent)]" />
                      </div>
                      <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-[0.1em]" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "10px"}}>Pinned</span>
                    </div>
                    <Badge variant="secondary" size="xs" className="font-mono text-[10px]">{pinnedNotes.length}</Badge>
                    <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pinnedNotes.map((note) => (
                      <NoteCard key={note.id} note={note} onOpen={openEdit} onDelete={handleDeleteNote} onTogglePin={togglePin} isPinnedSection />
                    ))}
                  </div>
                </section>
              )}

              {otherNotes.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-[var(--bg-subtle)] flex items-center justify-center">
                        <Layers className="w-3 h-3 text-[var(--text-muted)]" />
                      </div>
                      <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.1em]" style={{fontFamily: "'JetBrains Mono', monospace", fontSize: "10px"}}>
                        {pinnedNotes.length > 0 ? 'Other Notes' : 'All Notes'}
                      </span>
                    </div>
                    <Badge variant="secondary" size="xs" className="font-mono text-[10px]">{otherNotes.length}</Badge>
                    <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {otherNotes.map((note) => (
                      <NoteCard key={note.id} note={note} onOpen={openEdit} onDelete={handleDeleteNote} onTogglePin={togglePin} isPinnedSection={false} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {streamGroups.map(group => (
                <StreamDay key={group.key} group={group} onOpen={openEdit} onDelete={handleDeleteNote} onTogglePin={togglePin} />
              ))}
            </div>
          )}
        </PageState>
      </PageContent>

      <NotePanel note={activeNote} isOpen={isPanelOpen} onClose={closePanel} notes={notes} scope={scope} />
      {dialog}
    </PageShell>
  )
}

function isYesterday(d) {
  const y = new Date()
  y.setDate(y.getDate() - 1)
  return isSameDay(d, y)
}

export default NotesPage
