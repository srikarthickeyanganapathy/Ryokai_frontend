import React, { useState, useMemo } from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { IconButton, Button } from '@/shared/ui/Button'
import { Avatar, AvatarFallback } from '@/shared/ui/Avatar'
import { Input } from '@/shared/ui/Input'
import { Badge } from '@/shared/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { useComments, useAddComment, useTaskHistory, useAddDependency, useRemoveDependency, useTaskList, useEvidence, useAddEvidence, useDeleteEvidence } from '@/features/tasks/hooks/useTasks'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { filterTasksByWorkspace } from '@/shared/lib/workspaceTaskFilter'
import { cn } from '@/shared/lib/cn'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

function getDomainFromUrl(url) {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace('www.', '');
  } catch (e) {
    return 'link';
  }
}

function isImageUrl(url) {
  if (!url) return false;
  return /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url) || url.includes('images.unsplash.com');
}

export function TaskComments({ taskId, hasCommentPerm }) {
  const { data: comments = [], isLoading } = useComments(taskId)
  const addComment = useAddComment(taskId)
  const [text, setText] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [likes, setLikes] = useState({})
  const [dislikes, setDislikes] = useState({})

  const toggleLike = (commentId) => {
    setLikes(prev => ({ ...prev, [commentId]: !prev[commentId] }))
    if (dislikes[commentId]) setDislikes(prev => ({ ...prev, [commentId]: false }))
  }

  const toggleDislike = (commentId) => {
    setDislikes(prev => ({ ...prev, [commentId]: !prev[commentId] }))
    if (likes[commentId]) setLikes(prev => ({ ...prev, [commentId]: false }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    addComment.mutate(text, {
      onSuccess: () => {
        setText('')
        setIsFocused(false)
      }
    })
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Heading level={4} className="text-base font-semibold">
          {comments.length} Comments
        </Heading>
      </div>

      {/* YouTube Style Add Comment Box */}
      {hasCommentPerm && (
        <form onSubmit={handleSubmit} className="flex gap-3 items-start">
          <Avatar size="sm" className="w-9 h-9 shrink-0 bg-[var(--accent)] text-white font-bold">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Add a comment..."
              rows={isFocused ? 2 : 1}
              className="w-full bg-transparent border-b border-[var(--color-border-subtle)] focus:border-[var(--accent)] text-sm text-[var(--text-primary)] focus:outline-none transition-all duration-200 resize-none py-1.5 placeholder:text-[var(--text-tertiary)]"
            />
            {isFocused && (
              <div className="flex justify-end gap-2 animate-fadeIn">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setText(''); setIsFocused(false); }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={!text.trim() || addComment.isPending}
                  className="bg-[var(--text-primary)] text-[var(--bg-elevated)] hover:opacity-90 rounded-full px-4 text-xs font-semibold"
                >
                  Comment
                </Button>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Comment List (YouTube Layout) */}
      <div className="space-y-5">
        {isLoading && <Text variant="muted" size="sm">Loading comments...</Text>}
        {!isLoading && comments.length === 0 && (
          <Text variant="muted" size="sm" className="italic">No comments yet. Be the first to comment!</Text>
        )}
        {comments.map(c => {
          const isLiked = !!likes[c.id]
          const isDisliked = !!dislikes[c.id]
          const initial = (c.username || 'U').charAt(0).toUpperCase()
          return (
            <div key={c.id} className="flex gap-3.5 group">
              <Avatar size="sm" className="w-9 h-9 shrink-0 bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-xs">
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">@{c.username || 'user'}</span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : 'just now'}
                  </span>
                </div>
                <Text size="sm" className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                  {c.comment || c.text}
                </Text>
                
                {/* YouTube Action Bar (Like / Dislike / Reply) */}
                <div className="flex items-center gap-4 pt-1 text-[var(--text-muted)] text-xs">
                  <button 
                    type="button" 
                    onClick={() => toggleLike(c.id)}
                    className={cn("flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors", isLiked && "text-[var(--accent)] font-semibold")}
                  >
                    <Icons.thumbsUp className={cn("w-3.5 h-3.5", isLiked && "fill-current")} />
                    <span>{isLiked ? 1 : 0}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => toggleDislike(c.id)}
                    className={cn("hover:text-[var(--text-primary)] transition-colors", isDisliked && "text-[var(--danger)]")}
                  >
                    <Icons.thumbsDown className={cn("w-3.5 h-3.5", isDisliked && "fill-current")} />
                  </button>
                  <button type="button" className="font-medium hover:text-[var(--text-primary)] transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
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
  const { workspaceMode, activeOrganization } = useWorkspace()
  const { data: rawTasks = [] } = useTaskList(task?.projectId ? { projectId: task.projectId } : {})
  const addDependency = useAddDependency(task?.id)
  const removeDependency = useRemoveDependency(task?.id)
  const [selectedId, setSelectedId] = useState('')

  const allTasks = useMemo(() => {
    return filterTasksByWorkspace(rawTasks, workspaceMode, activeOrganization)
  }, [rawTasks, workspaceMode, activeOrganization])

  const handleAdd = () => {
    if (selectedId) {
      addDependency.mutate(Number(selectedId), {
        onSuccess: () => setSelectedId('')
      })
    }
  }

  const availableTasks = allTasks.filter(t => 
    t.id !== task?.id && 
    !task?.blockedBy?.some(dep => dep.id === t.id)
  )

  const totalDeps = (task?.blockedBy?.length || 0) + (task?.blocks?.length || 0)

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.network className="w-3.5 h-3.5 text-[var(--accent)]" />
          <Text size="xs" variant="muted" className="uppercase tracking-wider font-semibold">Dependencies</Text>
        </div>
        {totalDeps > 0 && (
          <Badge variant="outline" className="font-mono text-[10px] tabular-nums px-1.5 py-0">
            {totalDeps}
          </Badge>
        )}
      </div>

      {/* Blocked By */}
      {task?.blockedBy?.length > 0 && (
        <div className="space-y-0.5">
          <Text size="xs" variant="muted" className="text-[10px] uppercase tracking-wider font-medium text-[var(--danger)] px-2 mb-1">Blocked by</Text>
          {task.blockedBy.map(dep => (
            <div key={dep.id} className="group flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors duration-150 hover:bg-[var(--bg-elevated)]/60">
              <Icons.lock className="w-3 h-3 text-[var(--danger)] shrink-0" />
              <span className="flex-1 text-xs leading-snug text-[var(--text-primary)] truncate">{dep.title}</span>
              {hasDependencyPerm && (
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--danger)]"
                  onClick={() => removeDependency.mutate(dep.id)}
                  title="Remove dependency"
                >
                  <Icons.x className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Blocking */}
      {task?.blocks?.length > 0 && (
        <div className="space-y-0.5">
          <Text size="xs" variant="muted" className="text-[10px] uppercase tracking-wider font-medium text-[var(--warning)] px-2 mb-1">Blocking</Text>
          {task.blocks.map(dep => (
            <div key={dep.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors duration-150 hover:bg-[var(--bg-elevated)]/60">
              <Icons.alert className="w-3 h-3 text-[var(--warning)] shrink-0" />
              <span className="flex-1 text-xs leading-snug text-[var(--text-primary)] truncate">{dep.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {totalDeps === 0 && !hasDependencyPerm && (
        <div className="py-4 text-center">
          <Text size="xs" variant="muted" className="text-[var(--text-tertiary)]">No dependencies</Text>
        </div>
      )}

      {/* Add Form */}
      {hasDependencyPerm && (
        <div className="pt-1 border-t border-[var(--color-border-subtle)]/50">
          <div className="flex items-center gap-2">
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="flex-1 text-xs h-7">
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
            <IconButton 
              type="button"
              onClick={handleAdd} 
              disabled={!selectedId || addDependency.isPending} 
              variant="outline"
              size="sm"
              className="shrink-0"
              title="Add dependency"
            >
              <Icons.plus className="w-3.5 h-3.5" />
            </IconButton>
          </div>
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
  const [copiedId, setCopiedId] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  const handleCopy = (id, linkUrl) => {
    navigator.clipboard.writeText(linkUrl)
    setCopiedId(id)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

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
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <Heading level={4} className="text-base font-semibold">Evidence & Attachments</Heading>
        <span className="text-xs text-[var(--text-muted)] font-mono">{evidence.length} Items</span>
      </div>

      <div className="space-y-3">
        {isLoading && <Text variant="muted" size="sm">Loading evidence...</Text>}
        {!isLoading && evidence.length === 0 && (
          <Text variant="muted" size="sm" className="italic">No evidence attached yet.</Text>
        )}
        
        {/* WhatsApp / Instagram Rich Cards */}
        {evidence.map(item => {
          const isImg = isImageUrl(item.url) || item.type === 'SCREENSHOT'
          const domain = getDomainFromUrl(item.url)

          return (
            <div 
              key={item.id} 
              className="group relative flex flex-col sm:flex-row items-stretch overflow-hidden rounded-xl bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] hover:border-[var(--accent-border)] hover:shadow-md transition-all duration-200"
            >
              {/* Left Side: Thumbnail Preview or Link Favicon Badge */}
              {isImg ? (
                <div 
                  onClick={() => setPreviewImage(item.url)}
                  className="sm:w-32 h-28 sm:h-auto bg-[var(--bg-hover)] relative cursor-pointer overflow-hidden shrink-0 group/img"
                >
                  <img 
                    src={item.url} 
                    alt="Evidence Preview" 
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Icons.search className="w-5 h-5" />
                  </div>
                </div>
              ) : (
                <div className="sm:w-16 bg-[var(--accent-soft)] flex items-center justify-center p-3 text-[var(--accent)] shrink-0">
                  <Icons.link className="w-6 h-6" />
                </div>
              )}

              {/* Right Side: Content Details & Preview Metadata */}
              <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider">
                      {item.type}
                    </Badge>
                    <span className="text-[11px] font-medium text-[var(--text-tertiary)] truncate">
                      {domain}
                    </span>
                  </div>
                  
                  <a 
                    href={item.url.startsWith('http') ? item.url : `https://${item.url}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="font-medium text-sm text-[var(--text-primary)] hover:text-[var(--accent)] line-clamp-1 flex items-center gap-1 group/link"
                  >
                    <span className="truncate">{item.description || item.url}</span>
                    <Icons.externalLink className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                  </a>

                  {item.description && item.url !== item.description && (
                    <Text size="xs" variant="muted" className="line-clamp-1 mt-0.5">
                      {item.url}
                    </Text>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="flex items-center justify-end gap-1.5 pt-2 mt-2 border-t border-[var(--color-border-subtle)]">
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    onClick={() => handleCopy(item.id, item.url)}
                    className="h-7 text-xs gap-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    {copiedId === item.id ? <Icons.check className="w-3 h-3 text-[var(--success)]" /> : <Icons.copy className="w-3 h-3" />}
                    {copiedId === item.id ? 'Copied' : 'Copy'}
                  </Button>

                  {hasEditPerm && (
                    <IconButton 
                      variant="ghost" 
                      size="xs" 
                      className="h-7 w-7 text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                      onClick={() => deleteEvidence.mutate(item.id)}
                    >
                      <Icons.trash className="w-3.5 h-3.5" />
                    </IconButton>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Evidence Form */}
      {hasEditPerm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] space-y-3 mt-4">
          <Text size="xs" variant="muted" className="font-semibold uppercase tracking-wider">Add Evidence Link</Text>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="sm:w-[130px] h-9 text-xs">
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
              placeholder="Paste URL or media link..."
              className="flex-1 h-9 text-xs"
              disabled={addEvidence.isPending}
            />
          </div>
          <div className="flex gap-2">
            <Input 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short title / description (optional)..."
              className="flex-1 h-9 text-xs"
              disabled={addEvidence.isPending}
            />
            <Button type="submit" size="sm" className="h-9 px-4 shrink-0" disabled={!url.trim() || addEvidence.isPending}>
              Attach
            </Button>
          </div>
        </form>
      )}

      {/* Image Preview Overlay Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer animate-fadeIn backdrop-blur-sm"
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-xl shadow-2xl">
            <img src={previewImage} alt="Fullscreen Preview" className="max-w-full max-h-[85vh] object-contain" />
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <Icons.x className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}


