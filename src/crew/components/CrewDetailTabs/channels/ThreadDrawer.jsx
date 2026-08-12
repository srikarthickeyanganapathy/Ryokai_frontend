import React, { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/shared/ui/Drawer';
import { MessageSquare, Send } from '@/shared/ui/Icons';
import { getAvatarGradient, formatTimeCompact } from './utils';

/* Thread slide-over drawer: parent message card + replies + reply form. */
export function ThreadDrawer({ open, onClose, threadMessage, channelName, replies, onSendReply }) {
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent side="right" className="sm:max-w-md bg-[var(--bg-card)] p-5 border-l border-[var(--border-subtle)] flex flex-col h-full">
        {threadMessage && (
          <>
            <DrawerHeader className="border-b border-[var(--border-subtle)] pb-3 mb-3 text-left">
              <DrawerTitle className="text-[15px] font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[var(--accent)]" /> Message Thread
              </DrawerTitle>
              <DrawerDescription className="text-[12px]">
                Replies in #{channelName}
              </DrawerDescription>
            </DrawerHeader>

            {/* Parent Message Card */}
            <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] mb-4 shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-semibold text-[var(--text-primary)]">@{threadMessage.authorUsername}</span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  {formatTimeCompact(threadMessage.createdAt)}
                </span>
              </div>
              <p className="text-[13px] text-[var(--text-primary)] leading-relaxed">{threadMessage.content}</p>
            </div>

            {/* Thread Replies List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
              {replies?.map((reply) => (
                <div key={reply.id} className="flex items-start gap-2.5 p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5 shadow-sm"
                    style={{ background: getAvatarGradient(reply.authorUsername) }}
                  >
                    {(reply.authorUsername || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-[var(--text-primary)]">@{reply.authorUsername}</span>
                      <span className="text-[9px] font-mono text-[var(--text-muted)]">
                        {formatTimeCompact(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed mt-0.5">{reply.content}</p>
                  </div>
                </div>
              ))}

              {(!replies || replies.length === 0) && (
                <div className="text-center py-8 text-[12px] text-[var(--text-muted)] italic">
                  No replies yet. Be the first to respond!
                </div>
              )}
            </div>

            {/* Reply Input Form */}
            <div className="pt-3 border-t border-[var(--border-subtle)] shrink-0 mt-3">
              <ThreadReplyForm 
                onSend={(text) => onSendReply(threadMessage.id, text)} 
              />
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function ThreadReplyForm({ onSend }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Reply in thread..."
        className="h-9 text-[12px] rounded-lg flex-1 bg-[var(--bg-subtle)]"
      />
      <Button type="submit" size="sm" className="h-9 px-3 rounded-lg" disabled={!text.trim()}>
        <Send className="w-3.5 h-3.5" />
      </Button>
    </form>
  );
}
