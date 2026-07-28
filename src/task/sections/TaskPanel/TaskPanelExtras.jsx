import React, { useState, useMemo, useEffect } from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { IconButton, Button } from '@/shared/ui/Button'
import { Avatar, AvatarFallback } from '@/shared/ui/Avatar'
import { Input } from '@/shared/ui/Input'
import { Badge } from '@/shared/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { useComments, useAddComment, useTaskHistory, useAddDependency, useRemoveDependency, useTaskList, useEvidence, useAddEvidence, useDeleteEvidence, useUploadAttachment } from '@/task'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { filterTasksByWorkspace } from '@/shared/lib/workspaceTaskFilter'
import { cn } from '@/shared/lib/cn'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { FileDropzone } from '@/shared/ui/FileDropzone'

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
          {task.blockedBy.map(dep => {
            const isResolved = dep.status === 'COMPLETED' || dep.status === 'APPROVED'
            return (
              <div key={dep.id} className="group flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors duration-150 hover:bg-[var(--bg-elevated)]/60">
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
            )
          })}
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
      // Revoke old URL if it exists
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl)
      setFilePreviewUrl(URL.createObjectURL(file))
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
        <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] space-y-4 mt-4">
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
              Upload Image
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
                  accept="image/*"
                  multiple={false}
                  disabled={uploadAttachment.isPending}
                />
              ) : (
                <div className="space-y-3 border border-[var(--color-border-subtle)] p-3 rounded-lg bg-[var(--bg-subtle)]">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 shrink-0 rounded overflow-hidden bg-black/5">
                      <img src={filePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <Text className="text-sm font-medium truncate">{selectedFile.name}</Text>
                      <Text size="xs" variant="muted">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Text>
                      <Input 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Image description (optional)..."
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
                      {uploadAttachment.isPending ? 'Uploading...' : 'Upload Image'}
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


