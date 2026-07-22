import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pin, Plus, Trash2, Search, StickyNote } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { Input } from '@/shared/ui/Input'
import { cn } from '@/shared/lib/cn'
import { useNotes, useDeleteNote, useUpdateNote } from '@/features/notes/hooks/useNotes'
import { NotePanel } from '@/widgets/notes/NotePanel'

const NOTE_COLOR_STYLES = {
  default: '',
  amber: '!bg-amber-500/10 !border-amber-500/30',
  rose: '!bg-rose-500/10 !border-rose-500/30',
  sky: '!bg-sky-500/10 !border-sky-500/30',
  violet: '!bg-violet-500/10 !border-violet-500/30',
}

export function NotesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: notes = [], isLoading } = useNotes()
  const deleteNote = useDeleteNote()
  const updateNote = useUpdateNote()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeNote, setActiveNote] = useState(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const openNew = () => {
    setActiveNote(null)
    setIsPanelOpen(true)
  }

  const openEdit = (note) => {
    setActiveNote(note)
    setIsPanelOpen(true)
  }

  const closePanel = () => {
    setIsPanelOpen(false)
    setActiveNote(null)
    if (searchParams.has('openNoteId')) {
      setSearchParams(params => {
        params.delete('openNoteId')
        return params
      }, { replace: true })
    }
  }

  const openNoteId = searchParams.get('openNoteId')
  useEffect(() => {
    if (openNoteId && notes && notes.length > 0) {
      const targetNote = notes.find(n => String(n.id) === String(openNoteId))
      if (targetNote && (!activeNote || activeNote.id !== targetNote.id)) {
        setActiveNote(targetNote)
        setIsPanelOpen(true)
      }
    }
  }, [openNoteId, notes])

  const togglePin = (note) => {
    updateNote.mutate({ id: note.id, payload: { ...note, isPinned: !note.isPinned } })
  }

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes
    const q = searchQuery.toLowerCase()
    return notes.filter(n => n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q))
  }, [notes, searchQuery])

  const pinnedNotes = useMemo(() => filteredNotes.filter(n => n.isPinned), [filteredNotes])
  const otherNotes = useMemo(() => filteredNotes.filter(n => !n.isPinned), [filteredNotes])

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6" role="region" aria-label="Notes">
      
      {/* 🔒 PERSONAL MODE STICKY HEADER */}
      <div className="pb-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
              PERSONAL Mode
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">• Knowledge & Scratchpad Workspace</span>
          </div>
          <Heading level={2} className="tracking-tight text-[22px] font-semibold mb-0">Private Notes & Scratchpad</Heading>
          <Text variant="muted" className="text-[13px] mt-1">Capture ideas, project specs, and personal checklists in your private workspace.</Text>
        </div>

        <Button onClick={openNew} className="gap-2 h-9 text-xs shrink-0">
          <Plus className="w-4 h-4" /> New Note
        </Button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
        <Input
          type="text"
          placeholder="Filter notes by title or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-xs"
        />
      </div>

      {isLoading ? (
        <Text variant="muted" className="text-xs">Loading notes…</Text>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center p-12 rounded-2xl border border-dashed border-[var(--color-border-subtle)] bg-[var(--bg-elevated)]">
          <StickyNote className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-3 opacity-50" />
          <Heading level={4} className="text-sm font-semibold">No notes found</Heading>
          <Text variant="muted" className="mt-1 text-xs">Create your first private note to start capturing ideas.</Text>
        </div>
      ) : (
        <div className="space-y-6">
          {/* PINNED SECTION */}
          {pinnedNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-[var(--accent)]">
                <Pin className="w-3.5 h-3.5 fill-current" />
                <span>PINNED NOTES ({pinnedNotes.length})</span>
              </div>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
                {pinnedNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => openEdit(note)}
                    className={cn(
                      'break-inside-avoid p-4 rounded-[var(--radius-lg)] glass-panel border border-[var(--accent-border)] bg-[var(--accent-soft)]/20 cursor-pointer hover:shadow-md transition-all group',
                      NOTE_COLOR_STYLES[note.color]
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Heading level={4} className="line-clamp-1 text-sm font-semibold">{note.title || 'Untitled'}</Heading>
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                        <Button variant="ghost" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); togglePin(note) }}>
                          <Pin className="w-3.5 h-3.5 fill-[var(--accent)] text-[var(--accent)]" />
                        </Button>
                        <Button variant="ghost" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); deleteNote.mutate(note.id) }}>
                          <Trash2 className="w-3.5 h-3.5 text-[var(--text-muted)] hover:text-[var(--danger)]" />
                        </Button>
                      </div>
                    </div>
                    <Text size="xs" variant="muted" className="whitespace-pre-wrap line-clamp-6 text-xs leading-relaxed">{note.content}</Text>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OTHER NOTES SECTION */}
          {otherNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                  OTHER NOTES ({otherNotes.length})
                </div>
              )}
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
                {otherNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => openEdit(note)}
                    className={cn(
                      'break-inside-avoid p-4 rounded-[var(--radius-lg)] glass-panel border border-[var(--color-border-subtle)] cursor-pointer hover:shadow-md transition-all group',
                      NOTE_COLOR_STYLES[note.color]
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Heading level={4} className="line-clamp-1 text-sm font-semibold">{note.title || 'Untitled'}</Heading>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); togglePin(note) }}>
                          <Pin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        </Button>
                        <Button variant="ghost" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); deleteNote.mutate(note.id) }}>
                          <Trash2 className="w-3.5 h-3.5 text-[var(--text-muted)] hover:text-[var(--danger)]" />
                        </Button>
                      </div>
                    </div>
                    <Text size="xs" variant="muted" className="whitespace-pre-wrap line-clamp-6 text-xs leading-relaxed">{note.content}</Text>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* NOTE INSPECTOR SLIDE-OVER PANEL */}
      <NotePanel
        note={activeNote}
        isOpen={isPanelOpen}
        onClose={closePanel}
      />
    </div>
  )
}
