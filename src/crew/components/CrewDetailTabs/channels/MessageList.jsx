import React, { useEffect, useRef } from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Textarea } from '@/shared/ui/Textarea';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';
import { ImmersiveEmptyState } from '@/shared/ui/Immersive';
import { Hash, RefreshCw, AlertCircle, Pin, MessageSquare, CornerDownRight, Edit2, Trash2, ListTodo } from '@/shared/ui/Icons';
import { QUICK_EMOJIS, getAvatarGradient, formatTimeCompact } from './utils';

const formatDateSeparator = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
};

/* Messages stream: skeleton / error / empty states + grouped message rows with
   date separators, reactions, pin/thread/task/edit/delete actions. */
export function MessageList({
  messages,
  channelName,
  isLoading,
  isError,
  onRetry,
  currentUser,
  isCreator,
  pinnedIds = [],
  onTogglePin,
  reactionsMap = {},
  onToggleReaction,
  onOpenThread,
  threadRepliesCountMap = {},
  editingMessageId,
  editContent,
  onEditContentChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  isSavingEdit,
  onDeleteMessage,
  onConvertMessage
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  return (
    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar min-h-0">
      {/* State 1: Skeleton loading */}
      {isLoading ? (
        <div className="space-y-4 py-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-[var(--bg-subtle)] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-[var(--bg-subtle)] rounded" />
                <div className="h-4 bg-[var(--bg-subtle)] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        /* State 5: Error State */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center mb-3 border border-[var(--danger-border)]/40">
            <AlertCircle className="w-6 h-6" />
          </div>
          <Heading level={4} className="text-[14px] font-semibold text-[var(--text-primary)]">Failed to load messages</Heading>
          <Text variant="muted" className="text-[12px] mt-1 mb-4">Network request failed for channel #{channelName}.</Text>
          <Button size="sm" variant="outline" onClick={onRetry} className="gap-1.5 h-8 text-[12px]">
            <RefreshCw className="w-3.5 h-3.5" /> Retry Loading
          </Button>
        </div>
      ) : messages.length === 0 ? (
        /* State 4: Empty Channel Messages State */
        <div className="flex-1 flex items-center justify-center">
          <ImmersiveEmptyState
            icon={Hash}
            title={`Welcome to #${channelName}!`}
            description="This is the start of the channel. Send a message to start collaboration!"
          />
        </div>
      ) : (
        /* Stream rendering */
        <>
          {messages.map((msg, index) => {
            const isAuthor = currentUser && (msg.authorUsername === currentUser.username || msg.authorId === currentUser.id);
            const canDelete = isAuthor || isCreator;
            const isPinned = pinnedIds.includes(msg.id);
            const reactions = reactionsMap[msg.id] || {};
            const threadCount = threadRepliesCountMap[msg.id] || 0;

            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showDateSeparator = !prevMsg || new Date(prevMsg.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
            const isGrouped = prevMsg && 
              prevMsg.authorId === msg.authorId && 
              !showDateSeparator && 
              (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 5 * 60 * 1000);

            return (
              <React.Fragment key={msg.id}>
                {showDateSeparator && (
                  <div className="flex items-center my-5 first:mt-0 select-none">
                    <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                    <span className="px-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      {formatDateSeparator(msg.createdAt)}
                    </span>
                    <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                  </div>
                )}

                <MessageRow 
                  msg={msg}
                  isGrouped={isGrouped}
                  isAuthor={isAuthor}
                  canDelete={canDelete}
                  isPinned={isPinned}
                  reactions={reactions}
                  threadCount={threadCount}
                  currentUser={currentUser}
                  onToggleReaction={onToggleReaction}
                  onTogglePin={onTogglePin}
                  onOpenThread={onOpenThread}
                  editingMessageId={editingMessageId}
                  editContent={editContent}
                  onEditContentChange={onEditContentChange}
                  onStartEdit={onStartEdit}
                  onCancelEdit={onCancelEdit}
                  onSaveEdit={onSaveEdit}
                  isSavingEdit={isSavingEdit}
                  onDeleteMessage={onDeleteMessage}
                  onConvertMessage={onConvertMessage}
                />
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} className="h-2" />
        </>
      )}
    </div>
  );
}

function MessageRow({
  msg,
  isGrouped,
  isAuthor,
  canDelete,
  isPinned,
  reactions,
  threadCount,
  currentUser,
  onToggleReaction,
  onTogglePin,
  onOpenThread,
  editingMessageId,
  editContent,
  onEditContentChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  isSavingEdit,
  onDeleteMessage,
  onConvertMessage
}) {
  return (
    <div className={cn(
      "group/msg flex items-start gap-2.5 hover:bg-[var(--bg-subtle)]/30 rounded-lg p-2 -mx-2 transition-colors relative",
      isGrouped && "mt-0.5",
      isPinned && "bg-[var(--accent-soft)]/20 border-l-2 border-amber-500"
    )}>
      {/* Avatar / Time column */}
      <div className="w-8 shrink-0 flex justify-center">
        {isGrouped ? (
          <span className="text-[9px] text-[var(--text-muted)] font-mono opacity-0 group-hover/msg:opacity-100 transition-opacity mt-1">
            {formatTimeCompact(msg.createdAt)}
          </span>
        ) : (
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0 mt-0.5"
            style={{ background: getAvatarGradient(msg.authorUsername) }}
          >
            {msg.authorUsername?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {!isGrouped && (
          <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
            <span className="text-[13px] font-semibold text-[var(--text-primary)] hover:underline cursor-pointer">
              @{msg.authorUsername}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">
              {formatTimeCompact(msg.createdAt)}
            </span>
            {msg.isOptimistic && (
              <span className="text-[9px] font-mono text-[var(--accent)] animate-pulse">sending...</span>
            )}
            {isPinned && (
              <Badge variant="warning" size="xs" className="gap-1 font-mono text-[9px] py-0">
                <Pin className="w-2.5 h-2.5 fill-amber-500" /> Pinned
              </Badge>
            )}
            {msg.editedAt && <span className="text-[9px] text-[var(--text-muted)] italic">(edited)</span>}
          </div>
        )}

        {/* Message Content or Edit Form */}
        {editingMessageId === msg.id ? (
          <form onSubmit={(e) => onSaveEdit(e, msg.id)} className="space-y-2 mt-1">
            <Textarea
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              className="min-h-[60px] text-[13px] bg-[var(--bg-card)] border-[var(--accent-border)] rounded-lg"
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="h-7 text-[11px] rounded-md" isLoading={isSavingEdit}>Save</Button>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-[11px] rounded-md" onClick={onCancelEdit}>Cancel</Button>
            </div>
          </form>
        ) : (
          <p className={cn(
            "text-[13px] text-[var(--text-secondary)] leading-relaxed break-words whitespace-pre-wrap",
            isGrouped && "mt-0.5"
          )}>
            {msg.content}
          </p>
        )}

        {/* Display Emoji Reaction Chips */}
        {Object.keys(reactions).some(emoji => reactions[emoji].length > 0) && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {Object.entries(reactions).map(([emoji, users]) => {
              if (users.length === 0) return null;
              const hasMyReaction = currentUser && users.includes(currentUser.username);
              return (
                <button
                  key={emoji}
                  onClick={() => onToggleReaction(msg.id, emoji)}
                  className={cn(
                    "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] leading-none transition-all",
                    hasMyReaction 
                      ? "bg-[var(--accent-soft)] border border-[var(--accent-border)] text-[var(--accent)]"
                      : "bg-[var(--bg-subtle)] border border-transparent text-[var(--text-secondary)] hover:border-[var(--border-subtle)]"
                  )}
                >
                  <span>{emoji}</span>
                  <span className="font-mono text-[9px] font-bold text-[var(--text-secondary)]">{users.length}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Thread Replies Trigger Pill */}
        {threadCount > 0 && (
          <button 
            onClick={() => onOpenThread(msg)}
            className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[var(--accent)] font-semibold hover:underline"
          >
            <CornerDownRight className="w-3.5 h-3.5" />
            <span>{threadCount} {threadCount === 1 ? 'reply' : 'replies'}</span>
          </button>
        )}
      </div>

      {/* Message Hover Action Toolbar */}
      <div className={cn(
        "flex items-center gap-0.5 shrink-0 opacity-0 group-hover/msg:opacity-100 transition-opacity",
        editingMessageId === msg.id && "hidden"
      )}>
        {/* Quick Emoji Reaction Buttons */}
        {QUICK_EMOJIS.slice(0, 3).map(emoji => (
          <button 
            key={emoji}
            onClick={() => onToggleReaction(msg.id, emoji)}
            className="p-1 rounded-md text-[12px] hover:bg-[var(--bg-hover)] transition-transform active:scale-95"
            title={`React ${emoji}`}
          >
            {emoji}
          </button>
        ))}

        <div className="w-px h-3 bg-[var(--border-subtle)] mx-0.5" />

        {/* Pin Toggle */}
        <button 
          className={cn(
            "p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--warning)] hover:bg-[var(--warning-soft)] transition-colors",
            isPinned && "text-[var(--warning)] bg-[var(--warning-soft)]"
          )} 
          onClick={() => onTogglePin(msg.id)} 
          title={isPinned ? "Unpin message" : "Pin message"}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>

        {/* Thread Reply */}
        <button 
          className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors" 
          onClick={() => onOpenThread(msg)} 
          title="Reply in thread"
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>

        {/* Convert to Task */}
        <button 
          className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--success)] hover:bg-[var(--success-soft)] transition-colors" 
          onClick={() => onConvertMessage(msg)} 
          title="Convert to Task"
        >
          <ListTodo className="w-3.5 h-3.5" />
        </button>

        {/* Edit Message (if author) */}
        {isAuthor && (
          <button 
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors" 
            onClick={() => onStartEdit(msg)} 
            title="Edit message"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Delete Message */}
        {canDelete && (
          <button 
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors" 
            onClick={() => onDeleteMessage(msg.id)} 
            title="Delete message"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
