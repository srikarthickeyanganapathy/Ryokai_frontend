import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pin, Trash2, X, Check, Save, StickyNote, Bold, Italic, Heading as HeadingIcon, Code, Quote, List, CheckSquare, Link as LinkIcon, Eye, Edit3, GripVertical } from 'lucide-react'
import { Button, IconButton } from '@/shared/ui/Button'
import { Heading, Text, Label } from '@/shared/ui/Typography'
import { cn } from '@/shared/lib/cn'
import { useUpdateNote, useDeleteNote, useCreateNote } from '@/features/notes/hooks/useNotes'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { MarkdownPreviewer } from '@/shared/ui/MarkdownPreviewer'

const COLORS = [
  { id: 'default', label: 'Default', bg: 'var(--bg-elevated)', border: 'var(--color-border-subtle)' },
  { id: 'amber', label: 'Amber', bg: 'var(--warning-soft)', border: 'var(--warning)' },
  { id: 'rose', label: 'Rose', bg: 'var(--danger-soft)', border: 'var(--danger)' },
  { id: 'sky', label: 'Sky', bg: 'var(--accent-soft)', border: 'var(--accent)' },
  { id: 'violet', label: 'Violet', bg: 'rgba(139, 92, 246, 0.15)', border: 'rgb(139, 92, 246)' },
]

export function NotePanel({ note, isOpen, onClose }) {
  const updateNote = useUpdateNote()
  const createNote = useCreateNote()
  const deleteNote = useDeleteNote()
  const { confirm, dialog: confirmDialog } = useConfirmDialog()

  const textareaRef = useRef(null)
  const [activeTab, setActiveTab] = useState('write') // 'write' | 'preview'

  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = localStorage.getItem('ryokai_notepanel_width')
    return saved ? parseInt(saved, 10) : 580
  })
  const [isResizing, setIsResizing] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: 'default',
    isPinned: false,
  })

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        color: note.color || 'default',
        isPinned: !!note.isPinned,
      })
    } else {
      setFormData({
        title: '',
        content: '',
        color: 'default',
        isPinned: false,
      })
    }
    setActiveTab('write')
  }, [note, isOpen])

  const startResizing = useCallback((e) => {
    e.preventDefault()
    setIsResizing(true)
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

  useEffect(() => {
    if (panelWidth) {
      localStorage.setItem('ryokai_notepanel_width', String(panelWidth))
    }
  }, [panelWidth])

  if (!isOpen) return null

  const isNew = !note?.id

  const handleSave = () => {
    if (isNew) {
      createNote.mutate(formData, { onSuccess: onClose })
    } else {
      updateNote.mutate({ id: note.id, payload: formData }, { onSuccess: onClose })
    }
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Note',
      message: 'Are you sure you want to delete this note? This action cannot be undone.',
      confirmText: 'Delete Note',
      variant: 'danger',
    })
    if (confirmed && note?.id) {
      deleteNote.mutate(note.id, { onSuccess: onClose })
    }
  }

  const togglePin = () => {
    const nextPin = !formData.isPinned
    setFormData(prev => ({ ...prev, isPinned: nextPin }))
    if (!isNew && note?.id) {
      updateNote.mutate({ id: note.id, payload: { ...formData, isPinned: nextPin } })
    }
  }

  // Insert markdown formatting snippets into the text area
  const insertFormatting = (prefix, suffix = '') => {
    const textarea = textareaRef.current
    if (!textarea) {
      setFormData(prev => ({ ...prev, content: prev.content + prefix + suffix }))
      return
    }

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
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* PANEL SLIDE-OVER */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              style={{ width: `${panelWidth}px` }}
              className={cn(
                "relative bg-[var(--bg-base)] border-l border-[var(--color-border-subtle)] shadow-2xl h-full flex flex-col z-10 select-text",
                isResizing && "select-none transition-none"
              )}
            >
              {/* DRAG RESIZE HANDLE */}
              <div
                onMouseDown={startResizing}
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-3 -ml-1.5 z-30 cursor-ew-resize flex items-center justify-center group select-none hover:bg-[var(--accent)]/30 transition-colors",
                  isResizing && "bg-[var(--accent)]/50"
                )}
                title="Drag to resize panel"
              >
                <div className="w-1 h-10 rounded-full bg-[var(--text-muted)]/40 group-hover:bg-[var(--accent)] transition-colors" />
              </div>
              {/* PANEL TOP TOOLBAR */}
              <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--bg-elevated)]/50">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-mono text-[10px] uppercase font-semibold border border-[var(--accent-border)] flex items-center gap-1">
                    <StickyNote className="w-3 h-3" />
                    {isNew ? 'New Note' : 'Note Inspector'}
                  </span>
                  {formData.isPinned && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--accent)] text-white font-mono text-[10px] uppercase font-semibold flex items-center gap-1">
                      <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <IconButton
                    variant="ghost"
                    size="sm"
                    title={formData.isPinned ? 'Unpin Note' : 'Pin Note'}
                    onClick={togglePin}
                    className={cn(formData.isPinned && 'text-[var(--accent)]')}
                  >
                    <Pin className={cn('w-4 h-4', formData.isPinned && 'fill-current')} />
                  </IconButton>

                  {!isNew && (
                    <IconButton
                      variant="ghost"
                      size="sm"
                      title="Delete Note"
                      onClick={handleDelete}
                      className="text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  )}

                  <IconButton
                    variant="ghost"
                    size="sm"
                    title="Close"
                    onClick={onClose}
                  >
                    <X className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>

              {/* PANEL EDITING CANVAS */}
              <div className="flex-1 p-6 flex flex-col space-y-5 overflow-hidden min-h-0">
                
                {/* DIRECT INLINE TITLE EDITING */}
                <div className="space-y-1">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Note Title</Label>
                  <input
                    type="text"
                    placeholder="Enter note title..."
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-transparent text-xl font-bold tracking-tight text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border-b border-transparent hover:border-[var(--color-border-subtle)] focus:border-[var(--accent)] focus:outline-none py-1 transition-colors"
                  />
                </div>

                {/* COLOR SWATCH SELECTOR */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Color Theme</Label>
                    <div className="flex items-center gap-2">
                      {COLORS.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color: c.id }))}
                          className={cn(
                            'w-6 h-6 rounded-full border transition-all hover:scale-110 flex items-center justify-center',
                            formData.color === c.id ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30 scale-105' : 'border-transparent'
                          )}
                          style={{ backgroundColor: c.bg, borderColor: c.border }}
                          title={c.label}
                        >
                          {formData.color === c.id && <Check className="w-3 h-3 text-[var(--text-primary)]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* GITHUB WRITE vs PREVIEW TAB SWITCHER */}
                  <div className="flex items-center bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab('write')}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5',
                        activeTab === 'write' ? 'bg-[var(--bg-base)] text-[var(--accent)] shadow-xs font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      )}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5',
                        activeTab === 'preview' ? 'bg-[var(--bg-base)] text-[var(--accent)] shadow-xs font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>
                  </div>
                </div>

                {/* MINI NOTEPAD CANVAS EDITOR / PREVIEW CONTAINER */}
                <div 
                  className={cn(
                    "flex-1 flex flex-col min-h-0 border rounded-xl overflow-hidden shadow-xs transition-colors",
                    formData.color === 'amber' && "bg-amber-500/10 border-amber-500/30",
                    formData.color === 'rose' && "bg-rose-500/10 border-rose-500/30",
                    formData.color === 'sky' && "bg-sky-500/10 border-sky-500/30",
                    formData.color === 'violet' && "bg-violet-500/10 border-violet-500/30",
                    (!formData.color || formData.color === 'default') && "bg-[var(--bg-elevated)] border-[var(--color-border-subtle)]"
                  )}
                >
                  
                  {activeTab === 'write' ? (
                    <>
                      {/* GITHUB FORMATTING TOOLBAR */}
                      <div className="px-3 py-1.5 border-b border-[var(--color-border-subtle)] bg-[var(--bg-subtle)]/40 flex items-center gap-1 overflow-x-auto shrink-0">
                        <IconButton variant="ghost" size="sm" title="Bold (**text**)" onClick={() => insertFormatting('**', '**')} className="h-7 w-7">
                          <Bold className="w-3.5 h-3.5" />
                        </IconButton>
                        <IconButton variant="ghost" size="sm" title="Italic (*text*)" onClick={() => insertFormatting('*', '*')} className="h-7 w-7">
                          <Italic className="w-3.5 h-3.5" />
                        </IconButton>
                        <span className="w-px h-4 bg-[var(--color-border-subtle)] mx-1" />
                        <IconButton variant="ghost" size="sm" title="Heading (# Title)" onClick={() => insertFormatting('# ')} className="h-7 w-7">
                          <HeadingIcon className="w-3.5 h-3.5" />
                        </IconButton>
                        <IconButton variant="ghost" size="sm" title="Code Block" onClick={() => insertFormatting('```\n', '\n```')} className="h-7 w-7">
                          <Code className="w-3.5 h-3.5" />
                        </IconButton>
                        <IconButton variant="ghost" size="sm" title="Quote (> Quote)" onClick={() => insertFormatting('> ')} className="h-7 w-7">
                          <Quote className="w-3.5 h-3.5" />
                        </IconButton>
                        <span className="w-px h-4 bg-[var(--color-border-subtle)] mx-1" />
                        <IconButton variant="ghost" size="sm" title="Bullet List (- item)" onClick={() => insertFormatting('- ')} className="h-7 w-7">
                          <List className="w-3.5 h-3.5" />
                        </IconButton>
                        <IconButton variant="ghost" size="sm" title="Checklist (- [ ] task)" onClick={() => insertFormatting('- [ ] ')} className="h-7 w-7">
                          <CheckSquare className="w-3.5 h-3.5" />
                        </IconButton>
                        <IconButton variant="ghost" size="sm" title="Link ([Text](Url))" onClick={() => insertFormatting('[', '](https://)')} className="h-7 w-7">
                          <LinkIcon className="w-3.5 h-3.5" />
                        </IconButton>
                      </div>

                      {/* FULL HEIGHT MINI NOTEPAD TEXTAREA */}
                      <textarea
                        ref={textareaRef}
                        placeholder="Start typing your note ideas, markdown specs, or code snippets..."
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full flex-1 p-4 bg-transparent text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none resize-none font-mono leading-relaxed custom-scrollbar border-none"
                      />
                    </>
                  ) : (
                    /* RICH GITHUB MARKDOWN PREVIEW CANVAS */
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-[var(--bg-base)]">
                      <MarkdownPreviewer content={formData.content} />
                    </div>
                  )}
                </div>
              </div>

              {/* PANEL BOTTOM ACTIONS */}
              <div className="p-4 border-t border-[var(--color-border-subtle)] bg-[var(--bg-elevated)]/50 flex items-center justify-between">
                <Button variant="ghost" onClick={onClose} className="text-xs">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={createNote.isPending || updateNote.isPending}
                  className="gap-2 text-xs"
                >
                  <Save className="w-4 h-4" />
                  {createNote.isPending || updateNote.isPending ? 'Saving...' : isNew ? 'Create Note' : 'Save Changes'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
