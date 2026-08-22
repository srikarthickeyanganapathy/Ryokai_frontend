import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons, Loader2 } from '@/shared/ui/Icons'
import { IconButton, Button } from '@/shared/ui/Button'
import { Avatar, AvatarFallback } from '@/shared/ui/Avatar'
import { Input } from '@/shared/ui/Input'
import { Badge } from '@/shared/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { useComments, useAddComment, useTaskHistory, useAddDependency, useRemoveDependency, useTaskList, useEvidence, useAddEvidence, useDeleteEvidence, useUploadAttachment } from '../../entities/hooks/useTasks'
import { downloadEvidenceFile } from '../../entities/api/task.api'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { filterTasksByWorkspace } from '@/shared/lib/workspaceTaskFilter'
import { cn } from '@/shared/lib/cn'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { FileDropzone } from '@/shared/ui/FileDropzone'
import { PageState } from '@/shared/ui/PageState'
import { MessageSquare, Paperclip } from 'lucide-react'

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

// Mirrors the backend upload whitelist (TaskEvidenceController)
const EVIDENCE_FILE_ACCEPT = [
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/json',
  'application/zip', 'application/x-zip-compressed', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
].join(',');

const isFileName = (key = '') => /\.(png|jpe?g|gif|webp)$/i.test(key);

function filenameFromKey(key = '') {
  const part = key.split('/').pop() || 'file';
  // keys look like "uuid-original-name.ext" — strip the uuid prefix for display
  return part.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i, '');
}

/**
 * Thumbnail for a stored evidence file. Images are fetched as an
 * authenticated blob and object-URL'd (the API is Bearer-token protected, so
 * raw <img src> links can't work); other files render a file tile.
 */
function EvidenceFileThumb({ taskId, evidence, onOpen }) {
  const [objectUrl, setObjectUrl] = useState(null);
  const isImage = isFileName(evidence.imageKey);

  useEffect(() => {
    if (!isImage) return undefined;
    let url = null;
    let cancelled = false;
    downloadEvidenceFile(taskId, evidence.id)
      .then(({ blob }) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setObjectUrl(url);
      })
      .catch(() => { if (!cancelled) setObjectUrl(null); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [taskId, evidence.id, isImage]);

  if (isImage && objectUrl) {
    return (
      <div
        onClick={() => onOpen?.(objectUrl)}
        className="sm:w-32 h-28 sm:h-auto bg-[var(--bg-hover)] relative cursor-pointer overflow-hidden shrink-0 group/img"
      >
        <img
          src={objectUrl}
          alt={evidence.title || 'Evidence Preview'}
          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
          <Icons.search className="w-5 h-5" />
        </div>
      </div>
    );
  }

  return (
    <div className="sm:w-16 bg-[var(--accent-soft)] flex items-center justify-center p-3 text-[var(--accent)] shrink-0">
      <Paperclip className="w-6 h-6" />
    </div>
  );
}

export function TaskComments({ taskId, hasCommentPerm }) {
  const { data: comments = [], isLoading } = useComments(taskId)
  const addComment = useAddComment(taskId)
  const [text, setText] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [likes, setLikes] = useState({})
  const [dislikes, setDislikes] = useState({})
  const [replyingTo, setReplyingTo] = useState(null)

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
    addComment.mutate({ text, parentId: replyingTo }, {
      onSuccess: () => {
        setText('')
        setIsFocused(false)
        setReplyingTo(null)
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
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex justify-end gap-2"
              >
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { setText(''); setIsFocused(false); setReplyingTo(null); }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={!text.trim() || addComment.isPending}
                  className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg px-4 text-xs font-semibold"
                >
                  Comment
                </Button>
              </motion.div>
            )}
          </div>
        </form>
      )}

      {/* Comment List (YouTube Layout) */}
      <div className="space-y-5">
        {isLoading && (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--accent)]" />
          </div>
        )}
        {!isLoading && comments.length === 0 && (
          <div className="py-10">
            <PageState 
              state="empty" 
              stateProps={{ 
                icon: MessageSquare, 
                title: 'No Comments Yet', 
                message: 'Be the first to share your thoughts on this task.' 
              }} 
            />
          </div>
        )}
        {comments.map((c, idx) => {
          const isLiked = !!likes[c.id]
          const isDisliked = !!dislikes[c.id]
          const initial = (c.username || 'U').charAt(0).toUpperCase()
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.2 }}
              className="flex gap-3.5 group"
            >
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
                  <button 
                    type="button"
                    onClick={() => { setReplyingTo(c.id); setIsFocused(true); }}
                    className={cn("font-medium hover:text-[var(--text-primary)] transition-colors", replyingTo === c.id && "text-[var(--accent)]")}
                  >
                    Reply
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}


export function TaskDependencies({ task, hasDependencyPerm }) {
  const { workspaceMode, activeOrganization } = useWorkspace()
  const { data: { tasks: rawTasks = [] } = {} } = useTaskList(task?.projectId ? { projectId: task.projectId } : {})
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
          {task.blockedBy.map(dep => {
            const isResolved = dep.status === 'COMPLETED' || dep.status === 'APPROVED'
            return (
              <div key={dep.id} className="group flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors duration-150 hover:bg-[var(--bg-subtle)]">
                {isResolved ? (
                  <Icons.checkCircle className="w-3 h-3 text-[var(--success)] shrink-0" />
                ) : (
                  <Icons.lock className="w-3 h-3 text-[var(--danger)] shrink-0" />
                )}
                <span className={`flex-1 text-xs leading-snug truncate ${isResolved ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                  {dep.title}
                </span>
                <Badge variant={isResolved ? 'success' : 'outline'} className="text-[9px] px-1 py-0 font-mono">
                  {dep.status || 'PENDING'}
                </Badge>
                {hasDependencyPerm && (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-[var(--danger)]"
                    onClick={() => removeDependency.mutate(dep.id)}
                    title="Remove dependency"
                    aria-label="Remove dependency"
                  >
                    <Icons.x className="w-3 h-3" />
                  </IconButton>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Blocking */}
      {task?.blocks?.length > 0 && (
        <div className="space-y-0.5">
          <Text size="xs" variant="muted" className="text-[10px] uppercase tracking-wider font-medium text-[var(--warning)] px-2 mb-1">Blocking</Text>
          {task.blocks.map(dep => (
            <div key={dep.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors duration-150 hover:bg-[var(--bg-subtle)]">
              <Icons.alert className="w-3 h-3 text-[var(--warning)] shrink-0" />
              <span className="flex-1 text-xs leading-snug text-[var(--text-primary)] truncate">{dep.title}</span>
              <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">
                {dep.status || 'PENDING'}
              </Badge>
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
              aria-label="Add dependency"
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
  const uploadAttachment = useUploadAttachment(taskId)
  
  const [activeTab, setActiveTab] = useState('LINK') // 'LINK' or 'UPLOAD'
  const [type, setType] = useState('LINK')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  
  // Upload specific state
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState(null)

  // Cleanup object URL on unmount or when file changes
  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl)
    }
  }, [filePreviewUrl])

  const handleCopy = (id, linkUrl) => {
    navigator.clipboard.writeText(linkUrl)
    setCopiedId(id)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSubmitLink = (e) => {
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

  const handleFilesDrop = (validFiles, errors) => {
    if (errors && errors.length > 0) {
      toast.error(errors[0].error)
    }
    if (validFiles && validFiles.length > 0) {
      const file = validFiles[0]
      setSelectedFile(file)
      // Preview only makes sense for images; other files get an icon tile
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl)
      if (file.type?.startsWith('image/')) {
        setFilePreviewUrl(URL.createObjectURL(file))
      } else {
        setFilePreviewUrl(null)
      }
      setDescription(file.name)
    }
  }

  const handleUploadSubmit = (e) => {
    e.preventDefault()
    if (!selectedFile) return
    uploadAttachment.mutate(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null)
        setDescription('')
        if (filePreviewUrl) {
          URL.revokeObjectURL(filePreviewUrl)
          setFilePreviewUrl(null)
        }
      }
    })
  }

  const handleDownload = async (item) => {
    try {
      const { blob, filename } = await downloadEvidenceFile(taskId, item.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || filenameFromKey(item.imageKey)
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch {
      toast.error('Failed to download file')
    }
  }

  const cancelUpload = () => {
    setSelectedFile(null)
    setDescription('')
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl)
      setFilePreviewUrl(null)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <Heading level={4} className="text-base font-semibold">Evidence</Heading>
        <span className="text-xs text-[var(--text-muted)] font-mono">{evidence.length} Items</span>
      </div>

      <div className="space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--accent)]" />
          </div>
        )}
        {!isLoading && evidence.length === 0 && (
          <div className="py-10">
            <PageState
              state="empty"
              stateProps={{
                icon: Paperclip,
                title: 'No Evidence Attached',
                message: 'Upload files or link resources to provide context.'
              }}
            />
          </div>
        )}
        
        {/* Rich Cards */}
        {evidence.map(item => {
          // Uploaded files carry imageKey (no url); links carry url. The two
          // need different rendering — mixing them crashed on null urls before.
          const isStoredFile = !!item.imageKey
          const hasUrl = !!item.url
          const isImg = !isStoredFile && isImageUrl(item.url)
          const domain = hasUrl ? getDomainFromUrl(item.url) : 'uploaded file'
          const displayName = item.title || (isStoredFile ? filenameFromKey(item.imageKey) : item.url)

          return (
            <div
              key={item.id}
              className="group relative flex flex-col sm:flex-row items-stretch overflow-hidden rounded-lg bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] hover:border-[var(--accent-border)] hover:shadow-md transition-all duration-200"
            >
              {/* Left Side: Thumbnail Preview or File Badge */}
              {isStoredFile ? (
                <EvidenceFileThumb taskId={taskId} evidence={item} onOpen={setPreviewImage} />
              ) : isImg ? (
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

                  {hasUrl ? (
                    <a
                      href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-sm text-[var(--text-primary)] hover:text-[var(--accent)] line-clamp-1 flex items-center gap-1 group/link"
                    >
                      <span className="truncate">{displayName}</span>
                      <Icons.externalLink className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                    </a>
                  ) : (
                    <button
                      onClick={() => handleDownload(item)}
                      className="font-medium text-sm text-[var(--text-primary)] hover:text-[var(--accent)] line-clamp-1 flex items-center gap-1 text-left"
                      title="Download file"
                    >
                      <span className="truncate">{displayName}</span>
                      <Icons.download className="w-3.5 h-3.5 opacity-60 shrink-0" />
                    </button>
                  )}

                  {hasUrl && item.title && item.url !== item.title && (
                    <Text size="xs" variant="muted" className="line-clamp-1 mt-0.5">
                      {item.url}
                    </Text>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="flex items-center justify-end gap-1.5 pt-2 mt-2 border-t border-[var(--color-border-subtle)]">
                  {hasUrl && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCopy(item.id, item.url)}
                      className="h-7 text-xs gap-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      {copiedId === item.id ? <Icons.check className="w-3 h-3 text-[var(--success)]" /> : <Icons.copy className="w-3 h-3" />}
                      {copiedId === item.id ? 'Copied' : 'Copy'}
                    </Button>
                  )}

                  {isStoredFile && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleDownload(item)}
                      className="h-7 text-xs gap-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      <Icons.download className="w-3 h-3" />
                      Download
                    </Button>
                  )}

                  {hasEditPerm && (
                    <IconButton 
                      variant="ghost" 
                      size="xs" 
                      className="h-7 w-7 text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                      onClick={() => deleteEvidence.mutate(item.id)}
                      aria-label="Delete evidence"
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
        <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--color-border-subtle)] space-y-4 mt-4">
          <div className="flex items-center gap-4 border-b border-[var(--color-border-subtle)] pb-2">
            <button
              onClick={() => setActiveTab('LINK')}
              className={cn("text-xs font-semibold uppercase tracking-wider pb-1 border-b-2 transition-colors", activeTab === 'LINK' ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]")}
            >
              Add Link
            </button>
            <button
              onClick={() => setActiveTab('UPLOAD')}
              className={cn("text-xs font-semibold uppercase tracking-wider pb-1 border-b-2 transition-colors", activeTab === 'UPLOAD' ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]")}
            >
              Upload File
            </button>
          </div>

          {activeTab === 'LINK' ? (
            <form onSubmit={handleSubmitLink} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="sm:w-[130px] h-9 text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LINK">Link</SelectItem>
                    <SelectItem value="GITHUB">GitHub</SelectItem>
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
          ) : (
            <form onSubmit={handleUploadSubmit} className="space-y-3">
              {!selectedFile ? (
                <FileDropzone
                  onFilesDrop={handleFilesDrop}
                  accept={EVIDENCE_FILE_ACCEPT}
                  multiple={false}
                  disabled={uploadAttachment.isPending}
                />
              ) : (
                <div className="space-y-3 border border-[var(--color-border-subtle)] p-3 rounded-lg bg-[var(--bg-subtle)]">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 shrink-0 rounded overflow-hidden bg-black/5 flex items-center justify-center">
                      {filePreviewUrl ? (
                        <img src={filePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Paperclip className="w-8 h-8 text-[var(--text-muted)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <Text className="text-sm font-medium truncate">{selectedFile.name}</Text>
                      <Text size="xs" variant="muted">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Text>
                      <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="File description (optional)..."
                        className="w-full h-8 text-xs mt-1"
                        disabled={uploadAttachment.isPending}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border-subtle)]">
                    <Button type="button" variant="ghost" size="sm" onClick={cancelUpload} disabled={uploadAttachment.isPending}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={uploadAttachment.isPending}>
                      {uploadAttachment.isPending ? 'Uploading...' : 'Upload File'}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {/* Image Preview Overlay Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer animate-fadeIn backdrop-blur-sm"
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-lg shadow-2xl">
            <img src={previewImage} alt="Fullscreen Preview" className="max-w-full max-h-[85vh] object-contain" />
            <IconButton 
              variant="ghost"
              size="sm"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 bg-black/60 text-white hover:bg-black rounded-full"
              aria-label="Close preview"
            >
              <Icons.x className="w-5 h-5" />
            </IconButton>
          </div>
        </div>
      )}
    </section>
  )
}


