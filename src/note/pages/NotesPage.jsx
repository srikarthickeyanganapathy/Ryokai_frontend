import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pin, Plus, Trash2, Search, StickyNote } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { Input } from '@/shared/ui/Input'
import { cn } from '@/shared/lib/cn'
import { useNotes, useDeleteNote, useUpdateNote } from '@/note'
import { NotePanel } from '@/note'
import { PageHeader } from '@/shared/ui/PageHeader'
import {
  WorkspaceShell,
  ManagementLayout,
  PageStateContainer,
} from '@/shared/workspace-framework'

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
        queueMicrotask(() => {
          setActiveNote(targetNote)
          setIsPanelOpen(true)
        })
      }
    }
  }, [openNoteId, notes, activeNote])

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
    <WorkspaceShell maxWidth="default">
      <ManagementLayout
        header={
          <PageHeader
            eyebrow="Personal"
            meta="• Knowledge & Scratchpad Workspace"
            title="Private Notes & Scratchpad"
            subtitle="Capture ideas, project specs, and personal checklists in your private workspace."
            actions={
              <Button onClick={openNew} className="gap-2 h-9 text-xs shrink-0">
                <Plus className="w-4 h-4" /> New Note
              </Button>
            }
          />
        }
        toolbar={
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
        }
      >
        <PageStateContainer
          state={isLoading ? 'loading' : filteredNotes.length === 0 ? 'empty' : 'ready'}
          loadingConfig={{ variant: 'cards' }}
          emptyConfig={{
            icon: StickyNote,
            title: 'No notes found',
            description: 'Create your first private note to start capturing ideas.',
            actionLabel: 'New Note',
            onAction: openNew,
          }}
        >
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
        </PageStateContainer>
      </ManagementLayout>

      {/* NOTE INSPECTOR SLIDE-OVER PANEL */}
      <NotePanel
        note={activeNote}
        isOpen={isPanelOpen}
        onClose={closePanel}
      />
    </WorkspaceShell>
  )
}
