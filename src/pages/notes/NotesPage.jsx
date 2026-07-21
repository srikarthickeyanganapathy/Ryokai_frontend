import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pin, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Heading, Text, Label } from '@/shared/ui/Typography'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/shared/ui/Modal'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { cn } from '@/shared/lib/cn'
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote } from '@/features/notes/hooks/useNotes'

const COLORS = ['default', 'amber', 'rose', 'sky', 'violet']

export function NotesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: notes = [], isLoading } = useNotes()
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()

  const [editing, setEditing] = useState(null) // note object or 'new' or null

  const openNew = () => setEditing({ title: '', content: '', color: 'default', isPinned: false })
  const openEdit = (note) => setEditing(note)
  const close = () => {
    setEditing(null)
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
      if (targetNote && (!editing || editing.id !== targetNote.id)) {
        setEditing(targetNote)
      }
    }
  }, [openNoteId, notes])

  const handleSave = () => {
    if (editing.id) {
      updateNote.mutate({ id: editing.id, payload: editing }, { onSuccess: close })
    } else {
      createNote.mutate(editing, { onSuccess: close })
    }
  }

  const togglePin = (note) => {
    updateNote.mutate({ id: note.id, payload: { ...note, isPinned: !note.isPinned } })
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4" role="region" aria-label="Notes">
      <div className="flex items-center justify-between mb-6">
        <Heading level={1}>Notes</Heading>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" /> New Note
        </Button>
      </div>

      {isLoading ? (
        <Text variant="muted">Loading notes…</Text>
      ) : notes.length === 0 ? (
        <div className="text-center p-12 rounded-lg border border-dashed border-[var(--color-border-default)]">
          <Text variant="muted">No notes yet. Create your first one.</Text>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => openEdit(note)}
              className={cn(
                'break-inside-avoid p-4 rounded-[var(--radius-lg)] glass-panel border border-[var(--color-border-subtle)] cursor-pointer hover:shadow-[var(--accent-glow)] transition-shadow',
                note.color && note.color !== 'default' && `bg-[var(--${note.color}-soft,transparent)]`
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <Heading level={4} className="line-clamp-1">{note.title || 'Untitled'}</Heading>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" onClick={(e) => { e.stopPropagation(); togglePin(note) }}>
                    <Pin className={cn('w-4 h-4', note.isPinned ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-muted)]')} />
                  </Button>
                  <Button variant="ghost" onClick={(e) => { e.stopPropagation(); deleteNote.mutate(note.id) }}>
                    <Trash2 className="w-4 h-4 text-[var(--text-muted)] hover:text-[var(--danger)]" />
                  </Button>
                </div>
              </div>
              <Text size="sm" variant="muted" className="whitespace-pre-wrap line-clamp-6">{note.content}</Text>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onOpenChange={(open) => !open && close()}>
        <ModalContent className="sm:max-w-lg">
          {editing && (
            <>
              <ModalHeader>
                <ModalTitle>{editing.id ? 'Edit Note' : 'New Note'}</ModalTitle>
              </ModalHeader>
              <div className="space-y-5 mt-4">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g., Project Ideas"
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label>Note Content</Label>
                  <Textarea
                    placeholder="Start typing your note…"
                    rows={8}
                    value={editing.content}
                    onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2 pt-2">
                  <Label>Color Theme</Label>
                  <div className="flex items-center gap-3">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditing({ ...editing, color: c })}
                        className={cn(
                          'w-10 h-10 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)]',
                          editing.color === c ? 'border-[var(--accent)] shadow-sm' : 'border-transparent'
                        )}
                        style={{ background: c === 'default' ? 'var(--bg-subtle)' : `var(--${c}, currentColor)` }}
                        aria-label={`Select ${c} color`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <Button variant="ghost" onClick={close}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={createNote.isPending || updateNote.isPending}>
                    {createNote.isPending || updateNote.isPending ? 'Saving...' : 'Save Note'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
