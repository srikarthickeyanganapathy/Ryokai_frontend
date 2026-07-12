import React, { useState } from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { IconButton, Button } from '@/shared/ui/Button'
import { Avatar, AvatarFallback } from '@/shared/ui/Avatar'
import { Input } from '@/shared/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { useComments, useAddComment, useTaskHistory, useAddDependency, useRemoveDependency, useTaskList } from '@/features/tasks/hooks/useTasks'
import { cn } from '@/shared/lib/cn'
import { formatDistanceToNow } from 'date-fns'

export function TaskComments({ taskId }) {
  const { data: comments = [], isLoading } = useComments(taskId)
  const addComment = useAddComment(taskId)
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    addComment.mutate(text, {
      onSuccess: () => setText('')
    })
  }

  return (
    <section>
      <Heading level={4} className="mb-4">Comments</Heading>
      
      <div className="space-y-4 mb-4">
        {isLoading && <Text variant="muted" size="sm">Loading comments...</Text>}
        {!isLoading && comments.length === 0 && (
          <Text variant="muted" size="sm">No comments yet.</Text>
        )}
        {comments.map(c => (
          <div key={c.id} className="flex gap-3">
            <Avatar size="sm" className="w-8 h-8 shrink-0">
              <AvatarFallback className="text-[10px] bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                {(c.username || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-[var(--bg-subtle)] rounded-[var(--radius-md)] p-3">
              <div className="flex justify-between items-center mb-1">
                <Text size="sm" className="font-medium">{c.username}</Text>
                <Text size="xs" variant="muted">
                  {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : 'just now'}
                </Text>
              </div>
              <Text size="sm" className="text-[var(--text-secondary)]">{c.comment || c.text}</Text>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1"
          disabled={addComment.isPending}
        />
        <Button type="submit" disabled={!text.trim() || addComment.isPending}>
          Post
        </Button>
      </form>
    </section>
  )
}

export function TaskTimeline({ taskId }) {
  const { data: history = [], isLoading } = useTaskHistory(taskId)

  if (isLoading) return <Text variant="muted" size="sm">Loading activity...</Text>
  if (history.length === 0) return (
    <section>
      <Heading level={4} className="mb-4">Activity</Heading>
      <Text variant="muted" size="sm">No activity recorded.</Text>
    </section>
  )

  return (
    <section>
      <Heading level={4} className="mb-4">Activity</Heading>
      <div className="space-y-4 pl-1 border-l-2 border-[var(--color-border-subtle)] ml-2">
        {history.map(item => (
          <div key={item.id} className="relative pl-6">
            <div className="absolute w-2.5 h-2.5 rounded-full bg-[var(--accent)] border-2 border-[var(--bg-elevated)] left-[-6px] top-1.5" />
            <Text size="sm" className="text-[var(--text-primary)]">
              <span className="font-medium">{item.username}</span> {item.actionType?.toLowerCase().replace('_', ' ')}
            </Text>
            <Text size="xs" variant="muted" className="mt-0.5">
              {item.details && <span className="mr-2">{item.details}</span>}
              {item.timestamp ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true }) : ''}
            </Text>
          </div>
        ))}
      </div>
    </section>
  )
}

export function TaskDependencies({ task }) {
  const { data: allTasks = [] } = useTaskList()
  const addDependency = useAddDependency(task?.id)
  const removeDependency = useRemoveDependency(task?.id)
  const [selectedId, setSelectedId] = useState('')

  const handleAdd = () => {
    if (selectedId) {
      addDependency.mutate(Number(selectedId), {
        onSuccess: () => setSelectedId('')
      })
    }
  }

  // Find tasks that are not this task and not already blocked
  const availableTasks = allTasks.filter(t => 
    t.id !== task?.id && 
    !task?.blockedBy?.some(dep => dep.id === t.id)
  )

  return (
    <section>
      <Heading level={4} className="mb-4">Dependencies</Heading>
      
      {task?.blockedBy?.length > 0 && (
        <div className="space-y-2 mb-4">
          <Text size="sm" className="font-medium">Blocked by:</Text>
          {task.blockedBy.map(dep => (
            <div key={dep.id} className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[var(--danger-soft)] border border-[var(--danger)]/20">
              <div className="flex items-center gap-2">
                <Icons.lock className="w-3.5 h-3.5 text-[var(--danger)]" />
                <Text size="sm" className="text-[var(--danger)]">{dep.title}</Text>
              </div>
              <IconButton 
                variant="ghost" 
                size="sm" 
                className="text-[var(--danger)] hover:bg-[var(--danger)]/10"
                onClick={() => removeDependency.mutate(dep.id)}
              >
                <Icons.x className="w-3.5 h-3.5" />
              </IconButton>
            </div>
          ))}
        </div>
      )}

      {task?.blocking?.length > 0 && (
        <div className="space-y-2 mb-4">
          <Text size="sm" className="font-medium">Blocking:</Text>
          {task.blocking.map(dep => (
            <div key={dep.id} className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[var(--warning-soft)] border border-[var(--warning)]/20">
              <div className="flex items-center gap-2">
                <Icons.alert className="w-3.5 h-3.5 text-[var(--warning)]" />
                <Text size="sm" className="text-[var(--warning)]">{dep.title}</Text>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Add a blocking task..." />
          </SelectTrigger>
          <SelectContent>
            {availableTasks.map(t => (
              <SelectItem key={t.id} value={t.id.toString()}>
                {t.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAdd} disabled={!selectedId || addDependency.isPending}>
          Add
        </Button>
      </div>
    </section>
  )
}
