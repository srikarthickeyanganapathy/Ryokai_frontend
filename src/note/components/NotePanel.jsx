import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pin, Trash2, X, Check, Save, Bold, Italic, Heading as HeadingIcon, Code, Quote, List, CheckSquare, Link as LinkIcon, Eye, Edit3, FileText, Maximize2, Minimize2, ListTree, Timer } from '@/shared/ui/Icons'
import { Button, IconButton } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'
import { useUpdateNote, useDeleteNote, useCreateNote } from '@/note'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { SaveToggle } from '@/saved/features/components/SaveToggle'
import { ENTITY_TYPES } from '@/shared/constants/entityTypes'
import { MarkdownPreviewer } from '@/shared/ui/MarkdownPreviewer'
import { noteDna } from '../entities/model/dna'

const COLORS = [
  { id: 'default', label: 'Default', bg: 'var(--bg-subtle)', border: 'var(--border-subtle)' },
  { id: 'amber', label: 'Amber', bg: 'var(--warning-soft)', border: 'var(--warning)' },
  { id: 'rose', label: 'Rose', bg: 'var(--danger-soft)', border: 'var(--danger)' },
  { id: 'sky', label: 'Sky', bg: 'var(--accent-soft)', border: 'var(--accent)' },
  { id: 'violet', label: 'Violet', bg: 'rgba(139, 92, 246, 0.15)', border: 'rgb(139, 92, 246)' },
]

/* ──────────────────────────────────────────────────────────
 * OutlinePanel — live heading navigator
 * ────────────────────────────────────────────────────────── */
function OutlinePanel({ outline, onJump, onClose }) {
  return (
    <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-subtle)]/40 overflow-hidden shrink-0">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border-subtle)]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Outline</span>
        <IconButton variant="ghost" size="sm" onClick={onClose} title="Close outline"><X className="w-3 h-3" /></IconButton>
      </div>
      <div className="p-1.5 max-h-32 overflow-y-auto custom-scrollbar space-y-0.5">
        {outline.map((item, i) => (
          <button
            key={i}
            onClick={() => onJump(item)}
            className={cn(
              'w-full text-left px-2 py-1 rounded-md text-[11px] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer truncate',
              item.level === 1 ? 'font-semibold text-[var(--text-primary)]' :
              item.level === 2 ? 'font-medium text-[var(--text-secondary)] pl-4' :
              'text-[var(--text-secondary)] pl-7'
            )}
          >
            {item.text}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
 * TagsEditor — chip input for note tags
 * ────────────────────────────────────────────────────────── */
function TagsEditor({ tags, onChange }) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  const addTag = useCallback(() => {
    const raw = input.trim()
    if (!raw) return
    const tag = raw.toLowerCase().replace(/\s+/g, '-').slice(0, 50)
    if (tag && !tags.includes(tag) && tags.length < 12) {
      onChange([...tags, tag])
    }
    setInput('')
    inputRef.current?.focus()
  }, [input, tags, onChange])

  const removeTag = useCallback((tag) => onChange(tags.filter(t => t !== tag)), [tags, onChange])

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
    else if (e.key === 'Backspace' && !input && tags.length > 0) removeTag(tags[tags.length - 1])
  }

  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Tags</Label>
      <div
        onClick={() => inputRef.current?.focus()}
        className="flex flex-wrap items-center gap-1 px-2 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 min-h-[32px] cursor-text focus-within:border-[var(--accent-border)] transition-colors"
      >
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] text-[10px] font-medium font-mono border border-[var(--accent-border)] group"
          >
            <Tag className="w-2.5 h-2.5" />
            {tag}
            <IconButton
              variant="ghost"
              size="sm"
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
              className="ml-0.5 opacity-60 group-hover:opacity-100"
              title="Remove tag"
              aria-label="Remove tag"
            >
              <X className="w-2.5 h-2.5" />
            </IconButton>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={tags.length === 0 ? 'Add tags…' : ''}
          className="flex-1 min-w-[80px] bg-transparent text-[11px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none border-none p-0"
        />
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
 * BacklinksPanel — notes in the same scope that reference
 * the current note via [[Title]] syntax or title mention.
 * ────────────────────────────────────────────────────────── */
function BacklinksPanel({ currentNote, allNotes, onNavigate }) {
  const backlinks = useMemo(() => {
    if (!currentNote?.id || !allNotes?.length) return []
    const title = (currentNote.title || '').trim()
    if (!title) return []
    const patterns = [
      new RegExp(`\\[\\[${escapeRegex(title)}\\]\\]`, 'i'),
      new RegExp(`\\[\\[${escapeRegex(title.replace(/\s+/g, ' '))}\\]\\]`, 'i'),
    ]
    return allNotes.filter(n => {
      if (n.id === currentNote.id) return false
      const content = n.content || ''
      return patterns.some(p => p.test(content)) || content.toLowerCase().includes(title.toLowerCase())
    }).slice(0, 8)
  }, [currentNote, allNotes])

  if (backlinks.length === 0) return null

  return (
    <div className="shrink-0 border border-[var(--border-subtle)] rounded-lg overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/40">
        <Link2 className="w-3 h-3 text-[var(--accent)]" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Backlinks</span>
        <span className="text-[9px] font-mono text-[var(--text-tertiary)] tabular-nums">{backlinks.length}</span>
      </div>
      <div className="p-1.5 max-h-36 overflow-y-auto custom-scrollbar space-y-0.5">
        {backlinks.map(n => (
          <button
            key={n.id}
            onClick={() => onNavigate?.(n)}
            className="w-full text-left px-2 py-1.5 rounded-md text-[11px] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group flex items-center gap-2"
          >
            <span className="w-1 h-4 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
            <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate min-w-0 font-medium transition-colors">
              {n.title || 'Untitled'}
            </span>
            {n.tags?.length > 0 && (
              <span className="ml-auto text-[9px] font-mono text-[var(--text-tertiary)] shrink-0">
                {n.tags[0]}{n.tags.length > 1 ? `+${n.tags.length - 1}` : ''}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

/* ══════════════════════════════════════════════════════
 * NotePanel — Focus Editor with tags, backlinks, outline,
 * zen mode, save-status feedback
 * ══════════════════════════════════════════════════════ */
export function NotePanel({ note, isOpen, onClose, notes = [], scope = {} }) {
  const updateNote = useUpdateNote()
  const createNote = useCreateNote(scope)
  const deleteNote = useDeleteNote()
  const { confirm, dialog: confirmDialog } = useConfirmDialog()

  const textareaRef = useRef(null)
  const [activeTab, setActiveTab] = useState('write')
  const [zen, setZen] = useState(false)
  const [outlineOpen, setOutlineOpen] = useState(false)
  const [saveState, setSaveState] = useState('idle')
  const [savedAt, setSavedAt] = useState(null)

  const [panelWidth, setPanelWidth] = useState(() => localStorage.getItem('ryokai_notepanel_width') ? parseInt(localStorage.getItem('ryokai_notepanel_width'), 10) : 580)
  const [isResizing, setIsResizing] = useState(false)

  const [formData, setFormData] = useState(() => ({
    title: note?.title || '',
    content: note?.content || '',
    color: note?.color || 'default',
    isPinned: !!note?.isPinned,
    tags: note?.tags ? [...note.tags] : [],
  }))
  const [prevNote, setPrevNote] = useState(note)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  if (note !== prevNote || isOpen !== prevIsOpen) {
    setPrevNote(note); setPrevIsOpen(isOpen)
    setFormData({ title: note?.title || '', content: note?.content || '', color: note?.color || 'default', isPinned: !!note?.isPinned, tags: note?.tags ? [...note.tags] : [] })
    setActiveTab('write')
    setZen(false); setOutlineOpen(false); setSaveState('idle'); setSavedAt(null)
  }

  const startResizing = useCallback((e) => {
    e.preventDefault(); setIsResizing(true)
    const startX = e.clientX
    const startWidth = panelWidth
    const handleMouseMove = (moveEvent) => {
      const deltaX = startX - moveEvent.clientX
      const newWidth = Math.min(Math.max(startWidth + deltaX, 380), window.innerWidth - 60)
      setPanelWidth(newWidth)
    }
    const handleMouseUp = () => {
      setIsResizing(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [panelWidth])

  useEffect(() => { if (panelWidth) localStorage.setItem('ryokai_notepanel_width', String(panelWidth)) }, [panelWidth])

  const isNew = !note?.id
  const wordCount = useMemo(() => formData.content?.trim() ? formData.content.trim().split(/\s+/).filter(Boolean).length : 0, [formData.content])
  const dna = useMemo(() => noteDna({ content: formData.content, updatedAt: note?.updatedAt }), [formData.content, note?.updatedAt])

  const isDirty = useMemo(() => {
    if (isNew) return !!(formData.title.trim() || formData.content.trim())
    return formData.title !== (note.title || '') ||
      formData.content !== (note.content || '') ||
      formData.color !== (note.color || 'default') ||
      formData.isPinned !== !!note.isPinned ||
      JSON.stringify(formData.tags) !== JSON.stringify(note.tags || [])
  }, [formData, isNew, note])

  const outline = useMemo(() => {
    const items = []
    const lines = formData.content.split('\n')
    lines.forEach((line, i) => {
      const m = line.match(/^(#{1,4})\s+(.+)$/)
      if (m) items.push({ level: m[1].length, text: m[2].trim(), lineIndex: i })
    })
    return items
  }, [formData.content])

  const handleSave = useCallback(() => {
    if (isNew) {
      setSaveState('saving')
      createNote.mutate(formData, { onSuccess: onClose })
    } else {
      setSaveState('saving')
      updateNote.mutate({ id: note.id, payload: formData }, {
        onSuccess: () => { setSaveState('saved'); setSavedAt(new Date()) },
        onError: () => setSaveState('idle'),
      })
    }
  }, [isNew, createNote, updateNote, formData, note, onClose])

  const handleClose = useCallback(() => {
    if (isDirty && saveState !== 'saved') {
      if (!window.confirm('You have unsaved changes. Close anyway?')) return
    }
    onClose()
  }, [isDirty, saveState, onClose])

  const handleDelete = useCallback(async () => {
    const confirmed = await confirm({
      title: 'Delete Note',
      description: 'Are you sure you want to delete this note? This cannot be undone.',
      danger: true,
      confirmLabel: 'Delete Note',
    })
    if (confirmed && note?.id) deleteNote.mutate(note.id, { onSuccess: onClose })
  }, [confirm, deleteNote, note, onClose])

  const togglePin = useCallback(() => {
    const nextPin = !formData.isPinned
    setFormData(prev => ({ ...prev, isPinned: nextPin }))
    if (!isNew && note?.id) updateNote.mutate({ id: note.id, payload: { ...formData, isPinned: nextPin } })
  }, [formData, isNew, note, updateNote])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); handleSave() }
      else if (e.key === 'Escape' && !document.querySelector('[role="dialog"]')) {
        handleClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, handleSave, handleClose])

  if (!isOpen) return null

  const jumpToOutline = (item) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const lines = formData.content.split('\n')
    let pos = 0
    for (let i = 0; i < item.lineIndex; i++) pos += lines[i].length + 1
    setOutlineOpen(false)
    textarea.focus()
    textarea.setSelectionRange(pos, pos)
  }

  const insertFormatting = (prefix, suffix = '') => {
    const textarea = textareaRef.current
    if (!textarea) { setFormData(prev => ({ ...prev, content: prev.content + prefix + suffix })); return }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    const replacement = prefix + (selectedText || 'text') + suffix
    const newContent = formData.content.substring(0, start) + replacement + formData.content.substring(end)
    setFormData(prev => ({ ...prev, content: newContent }))
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText || 'text').length)
    }, 50)
  }

  return (
    <>
      {confirmDialog}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              style={{ width: `${panelWidth}px` }}
              className={cn("relative bg-[var(--bg-card)] border-l border-[var(--border-subtle)] shadow-2xl h-full flex flex-col z-10", isResizing && "select-none transition-none")}
            >
              <div onMouseDown={startResizing} className={cn("absolute left-0 top-0 bottom-0 w-3 -ml-1.5 z-30 cursor-ew-resize flex items-center justify-center group select-none hover:bg-[var(--accent)]/30 transition-colors", isResizing && "bg-[var(--accent)]/50")} title="Drag to resize panel">
                <div className="w-1 h-10 rounded-full bg-[var(--text-muted)]/40 group-hover:bg-[var(--accent)] transition-colors" />
              </div>

              <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] font-mono text-[10px] uppercase font-semibold border border-[var(--accent-border)] flex items-center gap-1">
                    <StickyNote className="w-3 h-3" /> {isNew ? 'New Note' : 'Edit Note'}
                  </span>
                  {formData.isPinned && <span className="px-2 py-0.5 rounded-md bg-[var(--accent)] text-white font-mono text-[10px] uppercase font-semibold flex items-center gap-1"><Pin className="w-2.5 h-2.5 fill-current" /> Pinned</span>}
                </div>
                <div className="flex items-center gap-1">
                  <IconButton variant="ghost" size="sm" title={formData.isPinned ? 'Unpin Note' : 'Pin Note'} onClick={togglePin} className={cn(formData.isPinned && 'text-[var(--accent)]')}><Pin className={cn('w-4 h-4', formData.isPinned && 'fill-current')} /></IconButton>
                  {!isNew && note?.id && <SaveToggle entityType={ENTITY_TYPES.NOTE} entityId={note.id} disabled={updateNote.isPending} className="mr-1" />}
                  {!isNew && <IconButton variant="ghost" size="sm" title="Delete Note" onClick={handleDelete} className="text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]"><Trash2 className="w-4 h-4" /></IconButton>}
                  <IconButton variant="ghost" size="sm" title={zen ? 'Exit focus mode' : 'Focus mode (zen)'} onClick={() => { const next = !zen; setZen(next); if (next) setActiveTab('write') }} className={cn(zen && 'text-[var(--accent)] bg-[var(--accent-soft)]')}>
                    {zen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </IconButton>
                  <IconButton variant="ghost" size="sm" title="Close" onClick={handleClose}><X className="w-4 h-4" /></IconButton>
                </div>
              </div>

              <div className="flex-1 p-6 flex flex-col space-y-5 overflow-hidden min-h-0">
                <div className="space-y-1">
                  <Label htmlFor="note-title" className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Note Title</Label>
                  <input id="note-title" type="text" placeholder="Enter note title..." value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-transparent text-[18px] font-bold tracking-tight text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border-b border-transparent hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus:outline-none py-1 transition-colors" />
                </div>

                {!zen && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Color Theme</Label>
                      <div className="flex items-center gap-1.5">
                        {COLORS.map(c => (
                          <button key={c.id} type="button" onClick={() => setFormData(prev => ({ ...prev, color: c.id }))} className={cn('w-5 h-5 rounded-full border transition-all hover:scale-110 flex items-center justify-center', formData.color === c.id ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30 scale-105' : 'border-transparent')} style={{ backgroundColor: c.bg, borderColor: c.border }} title={c.label}>
                            {formData.color === c.id && <Check className="w-3 h-3 text-[var(--text-primary)]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-md p-0.5">
                      <button type="button" onClick={() => setActiveTab('write')} className={cn('px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors flex items-center gap-1.5', activeTab === 'write' ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-sm font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}><Edit3 className="w-3 h-3" /> Write</button>
                      <button type="button" onClick={() => setActiveTab('preview')} className={cn('px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors flex items-center gap-1.5', activeTab === 'preview' ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-sm font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}><Eye className="w-3 h-3" /> Preview</button>
                    </div>
                  </div>
                )}

                {/* Tags editor */}
                {!zen && (
                  <TagsEditor
                    tags={formData.tags}
                    onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                  />
                )}

                {!zen && outlineOpen && outline.length > 1 && (
                  <OutlinePanel outline={outline} onJump={jumpToOutline} onClose={() => setOutlineOpen(false)} />
                )}

                <div className={cn("flex-1 flex flex-col min-h-0 border rounded-lg overflow-hidden transition-colors", formData.color === 'amber' && "bg-amber-500/5 border-amber-500/20", formData.color === 'rose' && "bg-rose-500/5 border-rose-500/20", formData.color === 'sky' && "bg-sky-500/5 border-sky-500/20", formData.color === 'violet' && "bg-violet-500/5 border-violet-500/20", (!formData.color || formData.color === 'default') && "bg-[var(--bg-subtle)]/30 border-[var(--border-subtle)]", zen && "border-transparent")}>
                  {activeTab === 'write' ? (
                    <>
                      {!zen && (
                        <div className="px-2 py-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center gap-1 overflow-x-auto shrink-0">
                          <IconButton variant="ghost" size="sm" title="Bold" onClick={() => insertFormatting('**', '**')} className="h-6 w-6"><Bold className="w-3 h-3" /></IconButton>
                          <IconButton variant="ghost" size="sm" title="Italic" onClick={() => insertFormatting('*', '*')} className="h-6 w-6"><Italic className="w-3 h-3" /></IconButton>
                          <span className="w-px h-3 bg-[var(--border-subtle)] mx-1" />
                          <IconButton variant="ghost" size="sm" title="Heading" onClick={() => insertFormatting('# ')} className="h-6 w-6"><HeadingIcon className="w-3 h-3" /></IconButton>
                          <IconButton variant="ghost" size="sm" title="Code" onClick={() => insertFormatting('```\n', '\n```')} className="h-6 w-6"><Code className="w-3 h-3" /></IconButton>
                          <IconButton variant="ghost" size="sm" title="Quote" onClick={() => insertFormatting('> ')} className="h-6 w-6"><Quote className="w-3 h-3" /></IconButton>
                          <span className="w-px h-3 bg-[var(--border-subtle)] mx-1" />
                          <IconButton variant="ghost" size="sm" title="List" onClick={() => insertFormatting('- ')} className="h-6 w-6"><List className="w-3 h-3" /></IconButton>
                          <IconButton variant="ghost" size="sm" title="Checklist" onClick={() => insertFormatting('- [ ] ')} className="h-6 w-6"><CheckSquare className="w-3 h-3" /></IconButton>
                          <IconButton variant="ghost" size="sm" title="Link" onClick={() => insertFormatting('[', '](https://)')} className="h-6 w-6"><LinkIcon className="w-3 h-3" /></IconButton>
                          {outline.length > 1 && (
                            <>
                              <span className="w-px h-3 bg-[var(--border-subtle)] mx-1" />
                              <IconButton variant="ghost" size="sm" title="Outline" onClick={() => setOutlineOpen(o => !o)} className={cn('h-6 w-6', outlineOpen && 'text-[var(--accent)] bg-[var(--accent-soft)]')}><ListTree className="w-3 h-3" /></IconButton>
                            </>
                          )}
                        </div>
                      )}
                      <textarea ref={textareaRef} aria-label="Note content" placeholder="Start typing your note ideas..." value={formData.content} onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))} className={cn('w-full flex-1 p-4 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none resize-none font-mono leading-relaxed border-none', zen ? 'text-[14px]' : 'text-[12px]')} />
                    </>
                  ) : !zen ? (
                    <div className="flex-1 p-4 overflow-y-auto bg-[var(--bg-card)]"><MarkdownPreviewer content={formData.content} /></div>
                  ) : null}
                </div>

                {/* Checklist progress (Note DNA) */}
                {dna.hasChecklist && !zen && (
                  <div className="shrink-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] font-mono">Checklist</span>
                      <span className="text-[10px] font-mono tabular-nums text-[var(--success)]">{dna.checklistDone}/{dna.checklistTotal} · {dna.progress}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                      <motion.div className="h-full rounded-full bg-[var(--success)]" initial={{ width: 0 }} animate={{ width: `${dna.progress}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
                    </div>
                  </div>
                )}

                {/* Backlinks panel */}
                {!isNew && !zen && (
                  <BacklinksPanel
                    currentNote={note}
                    allNotes={notes}
                    onNavigate={(n) => { setPrevNote(n); setFormData({ title: n.title || '', content: n.content || '', color: n.color || 'default', isPinned: !!n.isPinned, tags: n.tags ? [...n.tags] : [] }) }}
                  />
                )}
              </div>

              <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-wrap">
                  {saveState === 'saving' && <span className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-muted)] animate-pulse whitespace-nowrap">Saving…</span>}
                  {saveState === 'saved' && !isDirty && (
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--success)] whitespace-nowrap">
                      <Check className="w-3 h-3" /> Saved{savedAt ? ` ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                    </span>
                  )}
                  {isDirty && saveState !== 'saving' && <span className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--warning)] whitespace-nowrap">Unsaved</span>}
                  {wordCount > 0 && (
                    <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] font-mono tabular-nums whitespace-nowrap">
                      <FileText className="w-3 h-3" /> {wordCount} words
                    </span>
                  )}
                  {dna.words > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-mono tabular-nums whitespace-nowrap">
                      <Timer className="w-3 h-3" /> {dna.readingMinutes}m read
                    </span>
                  )}
                  <span className="hidden sm:flex items-center gap-1 text-[10px] text-[var(--text-tertiary)] font-mono whitespace-nowrap">
                    <kbd className="px-1 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-subtle)] leading-none">Ctrl</kbd>
                    <span className="text-[var(--text-muted)]">+</span>
                    <kbd className="px-1 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-subtle)] leading-none">S</kbd>
                    <span className="text-[var(--text-muted)]">to save</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" onClick={handleClose} className="text-[12px] h-8">Cancel</Button>
                  <Button onClick={handleSave} disabled={createNote.isPending || updateNote.isPending} className="gap-1.5 text-[12px] h-8"><Save className="w-3.5 h-3.5" /> {createNote.isPending || updateNote.isPending ? 'Saving…' : isNew ? 'Create Note' : 'Save Changes'}</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}