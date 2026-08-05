import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { ImmersiveEmptyState } from '@/shared/ui/Immersive'
import { cn } from '@/shared/lib/cn'
import { MessageSquare, Send } from '@/shared/ui/Icons'

// Helper to format date separators cleanly
function formatDaySeparator(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)

  if (d.toDateString() === now.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

// Helper to generate soft avatar gradients
function getAvatarGradient(name = '?') {
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
  const hue1 = Math.abs(hash) % 360
  const hue2 = (hue1 + 40) % 360
  return `linear-gradient(135deg, hsl(${hue1} 70% 60%), hsl(${hue2} 70% 45%))`
}

export function DiscussionTab({ messages = [], messagesLoading, user, canManage, isReadOnly, onSend, onDelete }) {
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) 
  }, [messages?.length])

  const handleSend = (e) => {
    e.preventDefault()
    if (!messageInput.trim()) return
    onSend(messageInput)
    setMessageInput('')
  }

  return (
    <div className="px-6 py-8 max-w-[1000px] mx-auto">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex flex-col h-[65vh] overflow-hidden">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          {messagesLoading ? (
            <div className="space-y-4 px-6">
              <div className="h-12 w-3/4 bg-[var(--bg-subtle)] rounded-xl animate-pulse" />
              <div className="h-12 w-1/2 bg-[var(--bg-subtle)] rounded-xl animate-pulse" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <ImmersiveEmptyState
                icon={MessageSquare}
                title="No messages yet"
                description="Be the first to say something. Share updates, ask questions, or kick off a discussion."
              />
            </div>
          ) : (
            <div className="space-y-1 px-6">
              {messages.map((msg, index) => {
                const prevMsg = index > 0 ? messages[index - 1] : null
                const isAuthor = msg.authorUsername === user?.username
                const msgDate = new Date(msg.createdAt).toDateString()
                const prevDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null
                
                const showDateSeparator = msgDate !== prevDate
                const showHeader = showDateSeparator || msg.authorUsername !== prevMsg?.authorUsername

                return (
                  <div key={msg.id} className="group/msg">
                    {/* Date Separator */}
                    {showDateSeparator && (
                      <div className="flex items-center my-6">
                        <div className="flex-1 h-px bg-[var(--border-subtle)]"></div>
                        <span className="px-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                          {formatDaySeparator(msg.createdAt)}
                        </span>
                        <div className="flex-1 h-px bg-[var(--border-subtle)]"></div>
                      </div>
                    )}

                    {/* Message Item */}
                    <div className={cn("flex items-start gap-3 transition-colors hover:bg-[var(--bg-subtle)]/40 rounded-lg p-2 -mx-2", showHeader ? 'mt-3' : 'mt-1')}>
                      <div className="w-8 shrink-0 flex justify-center">
                        {showHeader ? (
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shadow-sm shrink-0"
                            style={{ background: getAvatarGradient(msg.authorUsername) }}
                          >
                            {msg.authorUsername.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <span className="text-[9px] text-[var(--text-muted)] opacity-0 group-hover/msg:opacity-100 transition-opacity pt-1 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {showHeader && (
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-semibold text-[13px] text-[var(--text-primary)] tracking-tight">{msg.authorUsername}</span>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono">
                              {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                        <p className="text-[13px] text-[var(--text-secondary)] break-words whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                      </div>

                      {/* Minimal Delete Action */}
                      {(isAuthor || canManage) && !isReadOnly && (
                        <button 
                          onClick={() => onDelete(msg.id)} 
                          className="p-1.5 rounded-md text-[var(--text-muted)] opacity-0 group-hover/msg:opacity-100 hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-all"
                          title="Delete message"
                        >
                          <Icons.trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Area */}
        {isReadOnly ? (
          <div className="p-4 border-t border-[var(--border-subtle)] text-center text-[12px] text-[var(--text-muted)] bg-[var(--bg-subtle)]/30 rounded-b-2xl">
            <Icons.lock className="w-3 h-3 inline-block mr-1.5 -mt-0.5" />
            Observers cannot send messages to the team chat.
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-b-2xl">
            <div className="relative flex items-center bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl focus-within:ring-2 focus-within:ring-[var(--accent)]/20 focus-within:border-[var(--accent-border)] transition-all">
              <input 
                type="text" 
                value={messageInput} 
                onChange={e => setMessageInput(e.target.value)} 
                placeholder="Message the team..." 
                className="w-full pl-4 pr-12 py-3 bg-transparent text-[13px] focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" 
              />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 p-0 shadow-sm" 
                disabled={!messageInput.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}