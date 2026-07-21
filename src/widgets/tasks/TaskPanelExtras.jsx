import { Link } from 'react-router-dom';

import React, { useState } from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { IconButton, Button } from '@/shared/ui/Button'
import { Avatar, AvatarFallback } from '@/shared/ui/Avatar'
import { Input } from '@/shared/ui/Input'
import { Badge } from '@/shared/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { useComments, useAddComment, useTaskHistory, useAddDependency, useRemoveDependency, useTaskList, useEvidence, useAddEvidence, useDeleteEvidence } from '@/features/tasks/hooks/useTasks'
import { cn } from '@/shared/lib/cn'
import { formatDistanceToNow } from 'date-fns'

export function TaskComments({ taskId, hasCommentPerm }) {
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

      {hasCommentPerm && (
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
      )}
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

export function TaskDependencies({ task, hasDependencyPerm }) {
  const { data: allTasks = [] } = useTaskList(task?.projectId ? { projectId: task.projectId } : {})
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
              {hasDependencyPerm && (
                <IconButton 
                  variant="ghost" 
                  size="sm" 
                  className="text-[var(--danger)] hover:bg-[var(--danger)]/10"
                  onClick={() => removeDependency.mutate(dep.id)}
                >
                  <Icons.x className="w-3.5 h-3.5" />
                </IconButton>
              )}
            </div>
          ))}
        </div>
      )}

      {task?.blocks?.length > 0 && (
        <div className="space-y-2 mb-4">
          <Text size="sm" className="font-medium">Blocking:</Text>
          {task?.blocks?.map(dep => (
            <div key={dep.id} className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[var(--warning-soft)] border border-[var(--warning)]/20">
              <div className="flex items-center gap-2">
                <Icons.alert className="w-3.5 h-3.5 text-[var(--warning)]" />
                <Text size="sm" className="text-[var(--warning)]">{dep.title}</Text>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasDependencyPerm && (
        <div className="space-y-2">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-full text-xs">
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
          <Button onClick={handleAdd} disabled={!selectedId || addDependency.isPending} size="sm" variant="outline" className="w-full text-xs">
            Add Dependency
          </Button>
        </div>
      )}
    </section>
  )
}

export function TaskEvidence({ taskId, hasEditPerm }) {
  const { data: evidence = [], isLoading } = useEvidence(taskId)
  const addEvidence = useAddEvidence(taskId)
  const deleteEvidence = useDeleteEvidence(taskId)
  const [type, setType] = useState('LINK')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!url.trim()) return
    addEvidence.mutate({ type, url, description }, {
      onSuccess: () => {
        setUrl('')
        setDescription('')
        setType('LINK')
      }
    })
  }

  return (
    <section>
      <Heading level={4} className="mb-4">Evidence</Heading>
      
      <div className="space-y-2 mb-4">
        {isLoading && <Text variant="muted" size="sm">Loading evidence...</Text>}
        {!isLoading && evidence.length === 0 && (
          <Text variant="muted" size="sm">No evidence attached.</Text>
        )}
        {evidence.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)]">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{item.type}</Badge>
                <Link to={item.url} target="_blank" rel="noreferrer" className="text-[var(--primary)] hover:underline text-sm font-medium">
                  {item.url}
                </Link>
              </div>
              {item.description && <Text size="xs" variant="muted">{item.description}</Text>}
            </div>
            {hasEditPerm && (
              <IconButton 
                variant="ghost" 
                size="sm" 
                className="text-[var(--danger)] hover:bg-[var(--danger)]/10"
                onClick={() => deleteEvidence.mutate(item.id)}
              >
                <Icons.x className="w-4 h-4" />
              </IconButton>
            )}
          </div>
        ))}
      </div>

      {hasEditPerm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LINK">Link</SelectItem>
                <SelectItem value="GITHUB">GitHub</SelectItem>
                <SelectItem value="SCREENSHOT">Screenshot</SelectItem>
                <SelectItem value="RECORDING">Recording</SelectItem>
                <SelectItem value="SNIPPET">Snippet</SelectItem>
                <SelectItem value="NOTE">Note</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL..."
              className="flex-1"
              disabled={addEvidence.isPending}
            />
          </div>
          <div className="flex gap-2">
            <Input 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)..."
              className="flex-1"
              disabled={addEvidence.isPending}
            />
            <Button type="submit" disabled={!url.trim() || addEvidence.isPending}>
              Add
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}

