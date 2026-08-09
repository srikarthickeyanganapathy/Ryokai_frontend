import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Text } from '@/shared/ui/Typography'
import { Button, IconButton } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { ImmersiveEmptyState } from '@/shared/ui/Immersive'
import { cn } from '@/shared/lib/cn'
import { MessageSquare, Send } from '@/shared/ui/Icons'
import { SPRINGS } from '@/shared/lib/uxTokens'

/* ══════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════ */
function formatDaySeparator(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === now.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

function getAvatarGradient(name = '?') {
  const hash = (name || '').split('').reduce((acc, c) => c.charCodeAt(0) + ((acc << 5) - acc), 0)
  return `linear-gradient(135deg, hsl(${Math.abs(hash) % 360} 70% 60%), hsl(${(Math.abs(hash) + 35) % 360} 70% 45%))`
}

function formatTimeCompact(dateStr) {
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '🔥', '👏', '💯']

/* ══════════════════════════════════════════════════════
   @Mentions Dropdown
   ══════════════════════════════════════════════════════ */
function MentionsDropdown({ members, filter, onSelect, position }) {
  const filtered = members.filter(m =>
    m.toLowerCase().includes(filter.toLowerCase())
  ).slice(0, 6)

  if (filtered.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.12 }}
      className="absolute bottom-full mb-1 left-0 z-30 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-xl min-w-[180px] max-h-[200px] overflow-y-auto"
    >
      {filtered.map(m => (
        <button
          key={m}
          onClick={() => onSelect(m)}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-[var(--text-primary)] hover:bg-[var(--accent-soft)] transition-colors text-left"
        >
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold text-white shrink-0"
            style={{ background: getAvatarGradient(m) }}
          >
            {m.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">@{m}</span>
        </button>
      ))}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════
   Typing Indicator — animated dots
   ══════════════════════════════════════════════════════ */
function TypingIndicator({ names }) {
  if (!names || names.length === 0) return null

  const label = names.length === 1
    ? `${names[0]} is typing`
    : names.length === 2
      ? `${names[0]} and ${names[1]} are typing`
      : `${names[0]} and ${names.length - 1} others are typing`

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-center gap-2 px-4 py-1.5"
    >
      <div className="flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <Text size="xs" variant="muted" className="italic">{label}</Text>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════
   Reaction Bar — emoji button bar on each message
   ══════════════════════════════════════════════════════ */
function ReactionBar({ messageId, reactions, onToggleReaction }) {
  const msgReactions = reactions[messageId] || {}

  return (
    <div className="flex items-center gap-0.5 mt-1.5 flex-wrap">
      {EMOJI_REACTIONS.map(emoji => {
        const count = msgReactions[emoji] || 0
        const isActive = count > 0
        return (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggleReaction(messageId, emoji)}
            className={cn(
              'flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[12px] leading-none transition-all',
              isActive
                ? 'bg-[var(--accent-soft)] border border-[var(--accent-border)]'
                : 'bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-subtle)]'
            )}
          >
            <span>{emoji}</span>
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-[9px] font-bold text-[var(--text-secondary)]"
              >
                {count}
              </motion.span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   Read Receipts — mini avatar stack
   ══════════════════════════════════════════════════════ */
function ReadReceipts({ seenBy }) {
  if (!seenBy || seenBy.length === 0) return null

  const display = seenBy.slice(0, 3)
  const overflow = seenBy.length - display.length

  return (
    <div className="flex items-center gap-1 mt-1">
      <div className="flex -space-x-1.5">
        {display.map((name, i) => (
          <div
            key={name}
            className="w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold text-white border border-[var(--bg-card)]"
            style={{ background: getAvatarGradient(name), zIndex: 3 - i }}
            title={name}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        ))}
        {overflow > 0 && (
          <div className="w-4 h-4 rounded-full bg-[var(--bg-subtle)] border border-[var(--bg-card)] flex items-center justify-center text-[6px] font-bold text-[var(--text-muted)] z-0">
            +{overflow}
          </div>
        )}
      </div>
      <Text size="xs" className="text-[9px] text-[var(--text-muted)]">Seen by {seenBy.length}</Text>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   Message Content — renders text with @highlighted names
   ══════════════════════════════════════════════════════ */
function MessageContent({ content, memberNames }) {
  if (!content) return null

  // Split on @mentions to highlight them
  const mentionRegex = /(@\w+)/g
  const parts = content.split(mentionRegex)

  return (
    <p className="text-[13px] text-[var(--text-secondary)] break-words whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        const isMention = part.startsWith('@') && memberNames.some(n => part === `@${n}`)
        return isMention ? (
          <span key={i} className="text-[var(--accent)] font-semibold bg-[var(--accent-soft)]/50 px-0.5 rounded">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      })}
    </p>
  )
}

/* ══════════════════════════════════════════════════════
   DiscussionTab — full team chat with threads, reactions, etc.
   ══════════════════════════════════════════════════════ */
export function DiscussionTab({ messages = [], messagesLoading, user, canManage, isReadOnly, onSend, onDelete }) {
  const [input, setInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [pinnedMessages, setPinnedMessages] = useState([])
  const [pinnedOpen, setPinnedOpen] = useState(false)
  const [reactions, setReactions] = useState({})
  const [threads, setThreads] = useState({}) // { parentId: [{ id, authorUsername, content, createdAt }] }
  const [openThread, setOpenThread] = useState(null)
  const [threadInput, setThreadInput] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')
  const [typingNames, setTypingNames] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Derive unique authors for @mentions and read receipts
  const uniqueAuthors = useMemo(() =>
    [...new Set(messages.map(m => m.authorUsername).filter(Boolean))],
    [messages]
  )

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages?.length, threads, openThread])

  // Handle @mentions in input
  const handleInputChange = useCallback((e) => {
    const val = e.target.value
    setInput(val)

    const cursorPos = e.target.selectionStart
    const textBeforeCursor = val.slice(0, cursorPos)
    const atMatch = textBeforeCursor.match(/@(\w*)$/)

    if (atMatch) {
      setShowMentions(true)
      setMentionFilter(atMatch[1])
    } else {
      setShowMentions(false)
      setMentionFilter('')
    }
  }, [])

  const handleMentionSelect = useCallback((username) => {
    const cursorPos = inputRef.current?.selectionStart || input.length
    const textBeforeCursor = input.slice(0, cursorPos)
    const atIndex = textBeforeCursor.lastIndexOf('@')
    if (atIndex === -1) return

    const newInput = input.slice(0, atIndex) + `@${username} ` + input.slice(cursorPos)
    setInput(newInput)
    setShowMentions(false)
    setMentionFilter('')
    inputRef.current?.focus()
  }, [input])

  // Send
  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    onSend(input)
    setInput('')
    setShowMentions(false)
  }

  // Thread reply
  const handleThreadReply = (parentId) => {
    if (!threadInput.trim()) return
    setThreads(prev => ({
      ...prev,
      [parentId]: [...(prev[parentId] || []), {
        id: `reply-${Date.now()}`,
        authorUsername: user?.username || 'You',
        content: threadInput.trim(),
        createdAt: new Date().toISOString(),
      }],
    }))
    setThreadInput('')
  }

  // Reactions
  const handleToggleReaction = (messageId, emoji) => {
    setReactions(prev => {
      const msgReactions = { ...(prev[messageId] || {}) }
      const current = msgReactions[emoji] || 0
      // Simulate toggle: if current > 0 and current user already reacted, remove
      // For demo: just increment unless it's a re-click (alternate add/remove based on parity)
      if (current === 0) {
        msgReactions[emoji] = 1
      } else {
        // Toggle-like: if odd, add; if even, remove
        msgReactions[emoji] = current >= 2 ? current - 1 : current + 1
      }
      return { ...prev, [messageId]: msgReactions }
    })
  }

  // Pin/unpin
  const handleTogglePin = (msgId) => {
    setPinnedMessages(prev =>
      prev.includes(msgId) ? prev.filter(id => id !== msgId) : [...prev, msgId]
    )
  }

  // Filter messages by search
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages
    const q = searchQuery.toLowerCase()
    return messages.filter(m =>
      m.content?.toLowerCase().includes(q) ||
      m.authorUsername?.toLowerCase().includes(q)
    )
  }, [messages, searchQuery])

  // Group into day segments
  const messageGroups = useMemo(() => {
    const groups = []
    filteredMessages.forEach((msg, i) => {
      const prev = i > 0 ? filteredMessages[i - 1] : null
      const msgDate = new Date(msg.createdAt).toDateString()
      const prevDate = prev ? new Date(prev.createdAt).toDateString() : null
      const showSeparator = msgDate !== prevDate
      const showHeader = showSeparator || msg.authorUsername !== prev?.authorUsername

      if (showSeparator && groups.length > 0) {
        // Start new day group
      }

      groups.push({
        ...msg,
        showSeparator,
        showHeader,
        isLastInGroup: i < filteredMessages.length - 1
          ? msg.authorUsername !== filteredMessages[i + 1]?.authorUsername
            || new Date(msg.createdAt).toDateString() !== new Date(filteredMessages[i + 1]?.createdAt).toDateString()
          : true,
      })
    })
    return groups
  }, [filteredMessages])

  // Generate mock "seen by" based on unique authors
  const getSeenBy = (msgIndex, totalMessages) => {
    if (msgIndex < totalMessages - 3) return uniqueAuthors.filter(a => a !== user?.username).slice(0, 3)
    return []
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-5">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex flex-col h-[65vh] overflow-hidden">
        {/* ── Chat Header: Search + Actions ── */}
        <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] space-y-2">
          {/* Search bar */}
          <div className="relative">
            <Icons.search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-8 pr-3 py-1.5 bg-[var(--bg-subtle)] rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
            {searchQuery && (
              <IconButton variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearchQuery('')} title="Clear search">
                <Icons.x className="w-3 h-3" />
              </IconButton>
            )}
          </div>

          {/* Pinned banner */}
          <AnimatePresence>
            {pinnedMessages.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <button
                  onClick={() => setPinnedOpen(!pinnedOpen)}
                  className="w-full flex items-center gap-1.5 text-[11px] font-medium text-[var(--accent)] bg-[var(--accent-soft)]/30 rounded-lg px-2.5 py-1.5 hover:bg-[var(--accent-soft)]/50 transition-colors"
                >
                  <Icons.pin className="w-3 h-3" />
                  {pinnedMessages.length} pinned message{pinnedMessages.length !== 1 ? 's' : ''}
                  <Icons.chevronDown className={cn('w-3 h-3 ml-auto transition-transform', pinnedOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {pinnedOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 mt-1.5 px-1">
                        {messages
                          .filter(m => pinnedMessages.includes(m.id))
                          .map(m => (
                            <div key={m.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[var(--bg-subtle)] text-[11px]">
                              <Icons.pin className="w-2.5 h-2.5 text-[var(--accent)] shrink-0" />
                              <span className="text-[var(--text-secondary)] truncate flex-1">{m.content?.slice(0, 80)}{m.content?.length > 80 ? '...' : ''}</span>
                              <span className="text-[var(--text-muted)] text-[10px] shrink-0">— {m.authorUsername}</span>
                              <button onClick={() => handleTogglePin(m.id)} className="p-0.5 hover:text-[var(--danger)]">
                                <Icons.x className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Messages Area ── */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {messagesLoading ? (
            <div className="space-y-4 px-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--bg-subtle)] animate-pulse shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-24 bg-[var(--bg-subtle)] rounded animate-pulse" />
                    <div className="h-8 w-3/4 bg-[var(--bg-subtle)] rounded-lg animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <ImmersiveEmptyState
                icon={MessageSquare}
                title={searchQuery ? 'No matches found' : 'Start the conversation'}
                description={searchQuery ? 'Try a different search.' : 'Be the first to share an update or ask a question.'}
              />
            </div>
          ) : (
            <div className="space-y-1 px-5">
              {messageGroups.map((msg, i) => {
                const isAuthor = msg.authorUsername === user?.username
                const seenBy = []
                const threadReplies = threads[msg.id] || []
                const isThreadOpen = openThread === msg.id

                return (
                  <div key={msg.id} className="group/msg">
                    {/* Day Separator */}
                    {msg.showSeparator && (
                      <div className="flex items-center my-5 first:mt-0">
                        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                        <span className="px-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                          {formatDaySeparator(msg.createdAt)}
                        </span>
                        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                      </div>
                    )}

                    {/* Message Row */}
                    <div className={cn(
                      'flex items-start gap-2.5 hover:bg-[var(--bg-subtle)]/30 rounded-lg p-2 -mx-2 transition-colors',
                      msg.showHeader ? 'mt-2' : 'mt-0.5'
                    )}>
                      {/* Avatar / Time */}
                      <div className="w-8 shrink-0 flex justify-center">
                        {msg.showHeader ? (
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0"
                            style={{ background: getAvatarGradient(msg.authorUsername) }}
                          >
                            {msg.authorUsername.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <span className="text-[9px] text-[var(--text-muted)] opacity-0 group-hover/msg:opacity-100 transition-opacity pt-1 font-mono">
                            {formatTimeCompact(msg.createdAt)}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {msg.showHeader && (
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="font-semibold text-[13px] text-[var(--text-primary)]">{msg.authorUsername}</span>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono">
                              {formatTimeCompact(msg.createdAt)}
                            </span>
                          </div>
                        )}

                        <MessageContent content={msg.content} memberNames={uniqueAuthors} />

                        {/* Reaction Bar */}
                        <ReactionBar
                          messageId={msg.id}
                          reactions={reactions}
                          onToggleReaction={handleToggleReaction}
                        />

                        {/* Read Receipts — only on last group message */}
                        {msg.isLastInGroup && <ReadReceipts seenBy={seenBy} />}
                      </div>

                      {/* Actions (hover) */}
                      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                        {/* Thread reply */}
                        <button
                          onClick={() => setOpenThread(isThreadOpen ? null : msg.id)}
                          className={cn(
                            'p-1 rounded-md transition-all',
                            isThreadOpen ? 'text-[var(--accent)] bg-[var(--accent-soft)]' : 'text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]'
                          )}
                          title="Reply in thread"
                        >
                          <Icons.cornerDownRight className="w-3 h-3" />
                        </button>

                        {/* Pin */}
                        <button
                          onClick={() => handleTogglePin(msg.id)}
                          className={cn(
                            'p-1 rounded-md transition-all',
                            pinnedMessages.includes(msg.id)
                              ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                              : 'text-[var(--text-muted)] hover:text-[var(--warning)] hover:bg-[var(--warning-soft)]'
                          )}
                          title={pinnedMessages.includes(msg.id) ? 'Unpin' : 'Pin'}
                        >
                          <Icons.pin className="w-3 h-3" />
                        </button>

                        {/* Delete */}
                        {(isAuthor || canManage) && !isReadOnly && (
                          <button
                            onClick={() => onDelete(msg.id)}
                            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all"
                            title="Delete"
                          >
                            <Icons.trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Thread Replies */}
                    <AnimatePresence>
                      {isThreadOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden ml-10 pl-4 border-l-2 border-[var(--border-subtle)]"
                        >
                          <div className="py-2 space-y-2">
                            {/* Existing replies */}
                            {threadReplies.map(reply => (
                              <motion.div
                                key={reply.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-2 group/reply"
                              >
                                <div
                                  className="w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                                  style={{ background: getAvatarGradient(reply.authorUsername) }}
                                >
                                  {reply.authorUsername.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-[11px] font-semibold text-[var(--text-primary)]">{reply.authorUsername}</span>
                                    <span className="text-[9px] text-[var(--text-muted)] font-mono">{formatTimeCompact(reply.createdAt)}</span>
                                  </div>
                                  <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{reply.content}</p>
                                </div>
                              </motion.div>
                            ))}

                            {/* Thread reply input */}
                            {!isReadOnly && (
                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="text"
                                  value={threadInput}
                                  onChange={e => setThreadInput(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleThreadReply(msg.id) } }}
                                  placeholder="Reply in thread..."
                                  className="flex-1 px-3 py-1.5 bg-[var(--bg-subtle)] rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleThreadReply(msg.id)}
                                  disabled={!threadInput.trim()}
                                  className="h-7.5 px-3 text-[11px]"
                                >
                                  Reply
                                </Button>
                              </div>
                            )}

                            {threadReplies.length === 0 && isReadOnly && (
                              <Text size="xs" variant="muted" className="py-2 italic">No replies yet.</Text>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
              <div ref={messagesEndRef} className="h-2" />
            </div>
          )}


        </div>

        {/* ── Input Area ── */}
        {isReadOnly ? (
          <div className="p-3 border-t border-[var(--border-subtle)] text-center text-[12px] text-[var(--text-muted)] bg-[var(--bg-subtle)]/30 rounded-b-2xl">
            <Icons.lock className="w-3 h-3 inline-block mr-1.5" /> Observers are read-only.
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-b-2xl">
            {/* @Mentions dropdown */}
            <AnimatePresence>
              {showMentions && (
                <MentionsDropdown
                  members={uniqueAuthors}
                  filter={mentionFilter}
                  onSelect={handleMentionSelect}
                />
              )}
            </AnimatePresence>

            <div className="relative flex items-center bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl focus-within:ring-2 focus-within:ring-[var(--accent)]/20 focus-within:border-[var(--accent-border)] transition-all">
              {/* Attachment button (Coming Soon) */}
              <div className="relative group/attach pl-3">
                <button
                  type="button"
                  className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all cursor-default"
                >
                  <Icons.paperclip className="w-4 h-4" />
                </button>
                <div className="absolute bottom-full left-0 mb-1.5 px-2.5 py-1.5 bg-[var(--text-primary)] text-white text-[10px] font-medium rounded-lg shadow-lg opacity-0 group-hover/attach:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                  File sharing — Coming soon
                  <div className="absolute top-full left-3 -mt-0.5 w-2 h-2 bg-[var(--text-primary)] rotate-45" />
                </div>
              </div>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Message the team... (use @ to mention)"
                className="w-full pl-2 pr-12 py-2.5 bg-transparent text-[13px] focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
              <Button type="submit" size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7.5 w-7.5 p-0 shadow-sm" disabled={!input.trim()}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  )
}
