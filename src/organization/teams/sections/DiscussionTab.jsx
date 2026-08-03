import React, { useRef, useEffect, useState } from 'react'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { ChatIcon } from '../components/Shared'

function formatDaySeparator(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)

  if (d.toDateString() === now.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

export function DiscussionTab({ messages, messagesLoading, user, canManage, isReadOnly, onSend, onDelete }) {
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages?.length])

  const handleSend = (e) => {
    e.preventDefault()
    if (!messageInput.trim()) return
    onSend(messageInput)
    setMessageInput('')
  }

  // Group messages by author and day for a cleaner, Slack-like reading experience
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl flex flex-col h-[65vh] overflow-hidden">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {messagesLoading ? (
            <div className="space-y-4 px-4">
              <Skeleton className="h-12 w-3/4 rounded-lg" />
              <Skeleton className="h-12 w-1/2 rounded-lg" />
            </div>
          ) : messages.length === 0 ? (
            // Welcoming Empty State (Aesthetic-Usability Effect)
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-14 h-14 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center mb-4 shadow-sm">
                <ChatIcon className="w-7 h-7 text-[var(--accent)]" />
              </div>
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight mb-1">No messages yet</h3>
              <p className="text-[13px] text-[var(--text-muted)] max-w-xs leading-relaxed">
                Be the first to say something. Share updates, ask questions, or kick off a discussion.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((msg, index) => {
                const prevMsg = index > 0 ? messages[index - 1] : null
                const isAuthor = msg.authorUsername === user?.username
                const msgDate = new Date(msg.createdAt).toDateString()
                const prevDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null
                
                const showDateSeparator = msgDate !== prevDate
                const showHeader = showDateSeparator || msg.authorUsername !== prevMsg?.authorUsername

                return (
                  <div key={msg.id}>
                    {/* Date Separator */}
                    {showDateSeparator && (
                      <div className="flex items-center my-4 px-4">
                        <div className="flex-1 h-px bg-[var(--border-subtle)]"></div>
                        <span className="px-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                          {formatDaySeparator(msg.createdAt)}
                        </span>
                        <div className="flex-1 h-px bg-[var(--border-subtle)]"></div>
                      </div>
                    )}

                    {/* Message Item (Grouped) */}
                    <div className={`group flex items-start gap-3 px-4 py-1 transition-colors ${showHeader ? 'mt-3' : 'mt-0.5'} hover:bg-[var(--bg-hover)]`}>
                      <div className="w-8 shrink-0 flex justify-center">
                        {showHeader ? (
                          <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[11px] font-semibold shrink-0 shadow-sm">
                            {msg.authorUsername.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <span className="text-[9px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                            {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {showHeader && (
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="font-semibold text-[13px] text-[var(--text-primary)] tracking-tight">{msg.authorUsername}</span>
                            <span className="text-[10px] text-[var(--text-muted)]">
                              {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                        <p className="text-[13px] text-[var(--text-secondary)] break-words whitespace-pre-wrap leading-relaxed pr-8">
                          {msg.content}
                        </p>
                      </div>

                      {/* Delete Action (Fitts's Law - easily reachable, non-intrusive) */}
                      {(isAuthor || canManage) && !isReadOnly && (
                        <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onDelete(msg.id)} 
                            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors"
                            title="Delete message"
                          >
                            <Icons.trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
          <div className="p-4 border-t border-[var(--border-subtle)] text-center text-[12px] text-[var(--text-muted)] bg-[var(--bg-subtle)]/30 rounded-b-xl">
            <Icons.lock className="w-3 h-3 inline-block mr-1.5 -mt-0.5" />
            Observers cannot send messages to the team chat.
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)]/30 rounded-b-xl">
            <div className="relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg focus-within:border-[var(--accent-border)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20 transition-all">
              <input 
                type="text" 
                value={messageInput} 
                onChange={e => setMessageInput(e.target.value)} 
                placeholder="Message the team..." 
                className="w-full pl-3.5 pr-24 py-2.5 bg-transparent text-[13px] focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" 
              />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-3 text-[12px] shadow-sm" 
                disabled={!messageInput.trim()}
              >
                Send
              </Button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-1.5 px-1">
              Press <kbd className="px-1 py-0.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded text-[9px] font-mono">Enter</kbd> to send.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}