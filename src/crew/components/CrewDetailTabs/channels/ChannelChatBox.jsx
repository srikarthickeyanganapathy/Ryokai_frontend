import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { 
  useChannelMessages, 
  useConvertMessageToTask, 
  useSendChannelMessage, 
  useUpdateChannelMessage,
  useDeleteChannelMessage
} from '../../../features/hooks/useCrews';
import { ChannelHeader } from './ChannelHeader';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import { ConvertToTaskModal } from './ConvertToTaskModal';

/* Main chat column: owns message send/edit/delete/convert state and data fetching,
   composes header, message stream, typing banner and composer. */
export function ChannelChatBox({ 
  crewId, 
  channel, 
  currentUser, 
  isCreator, 
  pinnedIds = [], 
  onTogglePin,
  reactionsMap = {},
  onToggleReaction,
  onOpenThread,
  threadRepliesCountMap = {},
  onOpenPinnedDrawer
}) {
  const [msgContent, setMsgContent] = useState('');
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  
  // Task conversion state
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [targetMessage, setTargetMessage] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Editing message state
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Typing indicator banner state
  const [typingUser, setTypingUser] = useState(null);
  const typingTimerRef = useRef(null);

  const { data: serverMessages = [], isLoading, isError, refetch, isFetching } = useChannelMessages(crewId, channel.id);
  const sendMessageMutation = useSendChannelMessage(crewId, channel.id);
  const updateMessageMutation = useUpdateChannelMessage(crewId, channel.id);
  const deleteMessageMutation = useDeleteChannelMessage(crewId, channel.id);
  const convertTaskMutation = useConvertMessageToTask(crewId, channel.id);
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  // Combine server messages with optimistic unsaved messages
  const allMessages = useMemo(() => {
    return [...serverMessages, ...optimisticMessages];
  }, [serverMessages, optimisticMessages]);

  // Handle send with optimistic update
  const handleSend = (e) => {
    e.preventDefault();
    if (!msgContent.trim()) return;

    const currentText = msgContent.trim();
    const tempId = `opt-${Date.now()}`;
    const optMsg = {
      id: tempId,
      content: currentText,
      authorUsername: currentUser?.username || 'You',
      authorId: currentUser?.id,
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };

    setOptimisticMessages(prev => [...prev, optMsg]);
    setMsgContent('');

    sendMessageMutation.mutate(currentText, {
      onSuccess: () => {
        setOptimisticMessages(prev => prev.filter(m => m.id !== tempId));
      },
      onError: () => {
        setOptimisticMessages(prev => prev.filter(m => m.id !== tempId));
      }
    });
  };

  const handleInputChange = (e) => {
    setMsgContent(e.target.value);
    
    // Trigger typing simulation
    if (e.target.value.length > 0 && !typingUser) {
      setTypingUser(currentUser?.username || 'Someone');
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setTypingUser(null), 2500);
    }
  };

  const handleStartEdit = (msg) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };

  const handleSaveEdit = (e, messageId) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    updateMessageMutation.mutate({ messageId, content: editContent }, {
      onSuccess: () => { setEditingMessageId(null); setEditContent(''); }
    });
  };

  const handleDeleteMessage = async (messageId) => {
    if (await confirm({ title: 'Delete this message permanently?', danger: true })) {
      deleteMessageMutation.mutate(messageId);
    }
  };

  const handleConvertOpen = (msg) => { 
    setTargetMessage(msg); 
    setTaskTitle(msg.content); 
    setIsConvertOpen(true); 
  };
  
  const handleConvertToTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !targetMessage) return;
    convertTaskMutation.mutate(
      { messageId: targetMessage.id, payload: { title: taskTitle, priority: taskPriority, dueDate: taskDueDate || null } }, 
      { 
        onSuccess: () => { 
          setIsConvertOpen(false); 
          setTargetMessage(null); 
          setTaskTitle(''); 
          setTaskPriority('MEDIUM'); 
          setTaskDueDate(''); 
        } 
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)] min-h-0 relative">
      {/* State 2: Background refetch progress bar */}
      {isFetching && !isLoading && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--accent)] animate-pulse z-20" />
      )}

      {/* Channel Header Bar */}
      <ChannelHeader 
        channel={channel} 
        pinnedCount={pinnedIds.length} 
        onOpenPinnedDrawer={onOpenPinnedDrawer} 
      />

      {/* Messages Stream Container */}
      <MessageList 
        messages={allMessages}
        channelName={channel.name}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        currentUser={currentUser}
        isCreator={isCreator}
        pinnedIds={pinnedIds}
        onTogglePin={onTogglePin}
        reactionsMap={reactionsMap}
        onToggleReaction={onToggleReaction}
        onOpenThread={onOpenThread}
        threadRepliesCountMap={threadRepliesCountMap}
        editingMessageId={editingMessageId}
        editContent={editContent}
        onEditContentChange={setEditContent}
        onStartEdit={handleStartEdit}
        onCancelEdit={() => setEditingMessageId(null)}
        onSaveEdit={handleSaveEdit}
        isSavingEdit={updateMessageMutation.isPending}
        onDeleteMessage={handleDeleteMessage}
        onConvertMessage={handleConvertOpen}
      />

      {/* Live Typing Indicator Banner */}
      {typingUser && (
        <div className="flex items-center gap-2 px-4 py-1.5 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)]/40 shrink-0">
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
          <span className="text-[11px] text-[var(--text-muted)] italic">{typingUser} is typing...</span>
        </div>
      )}

      {/* Message Input Box */}
      <div className="p-3 border-t border-[var(--border-subtle)] shrink-0 bg-[var(--bg-card)]">
        <MessageComposer 
          value={msgContent}
          onChange={handleInputChange}
          onSubmit={handleSend}
          placeholder={`Message #${channel.name}...`}
          isSending={sendMessageMutation.isPending}
          canSend={!!msgContent.trim()}
        />
      </div>

      {/* Task Conversion Pre-Filled Modal */}
      <ConvertToTaskModal 
        open={isConvertOpen}
        onOpenChange={setIsConvertOpen}
        taskTitle={taskTitle}
        onTaskTitleChange={setTaskTitle}
        taskPriority={taskPriority}
        onTaskPriorityChange={setTaskPriority}
        taskDueDate={taskDueDate}
        onTaskDueDateChange={setTaskDueDate}
        isPending={convertTaskMutation.isPending}
        onSubmit={handleConvertToTask}
      />

      {confirmDialog}
    </div>
  );
}
