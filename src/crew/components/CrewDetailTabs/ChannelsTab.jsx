import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { ImmersiveEmptyState } from '@/shared/ui/Immersive';
import { 
  useCreateCrewChannel, 
  useDeleteCrewChannel, 
  useCrewMembers 
} from '../../features/hooks/useCrews';
import { useAuth } from '@/identity';
import { useRealtime } from '@/app/providers/RealTimeProvider';
import { 
  Hash, 
  Plus, 
  MessageSquare, 
  Users as UsersIcon,
  WifiOff
} from '@/shared/ui/Icons';
import { ChannelSidebar } from './channels/ChannelSidebar';
import { MembersSidebar } from './channels/MembersSidebar';
import { CreateChannelModal } from './channels/CreateChannelModal';
import { ThreadDrawer } from './channels/ThreadDrawer';
import { PinnedDrawer } from './channels/PinnedDrawer';
import { VoiceRoomBox } from './channels/VoiceRoomBox';
import { ChannelChatBox } from './channels/ChannelChatBox';
import { ChannelSkeleton } from './channels/ChannelSkeleton';

/* Orchestrator: owns shared tab-level state (channel selection, pins, reactions,
   threads, create-channel form) and composes the channel sub-panels. */
export function ChannelsTab({ crewId, channels = [], isCreator }) {
  const { user } = useAuth();
  const { connected } = useRealtime();
  const [selectedChannel, setSelectedChannel] = useState(null);
  const activeChannel = selectedChannel || (channels.length > 0 ? channels[0] : null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState('TEXT');
  const [mobileTab, setMobileTab] = useState('chat'); // 'channels' | 'chat' | 'members'

  // Unread badge tracking state per channel
  const [unreadCounts, setUnreadCounts] = useState({});
  
  // Pinned messages per channel: { [channelId]: [messageId, ...] }
  const [pinnedMap, setPinnedMap] = useState({});
  const [isPinnedDrawerOpen, setIsPinnedDrawerOpen] = useState(false);

  // Reaction state: { [messageId]: { [emoji]: [username, ...] } }
  const [reactionsMap, setReactionsMap] = useState({});

  // Thread drawer state
  const [activeThreadMessage, setActiveThreadMessage] = useState(null);
  const [threadReplies, setThreadReplies] = useState({});

  const { confirm, dialog: confirmDialog } = useConfirmDialog();
  const { data: members = [], isLoading: isMembersLoading } = useCrewMembers(crewId);

  const createChannelMutation = useCreateCrewChannel(crewId);
  const deleteChannelMutation = useDeleteCrewChannel(crewId);

  // Clear unread count when switching channels
  const handleSelectChannel = (chan) => {
    setSelectedChannel(chan);
    setMobileTab('chat');
    if (chan && unreadCounts[chan.id]) {
      setUnreadCounts(prev => ({ ...prev, [chan.id]: 0 }));
    }
  };

  const handleCreateChannel = (e) => {
    e.preventDefault();
    if (!channelName.trim()) return;
    createChannelMutation.mutate({ name: channelName, type: channelType }, { 
      onSuccess: (newChan) => { 
        setIsCreateOpen(false); 
        setChannelName(''); 
        setChannelType('TEXT'); 
        if (newChan) setSelectedChannel(newChan); 
      } 
    });
  };

  const handleDeleteChannel = async (id, e) => {
    e.stopPropagation();
    if (await confirm({ title: 'Delete this channel and all its messages?', danger: true })) {
      deleteChannelMutation.mutate(id, { 
        onSuccess: () => { 
          if (activeChannel?.id === id) setSelectedChannel(channels.find(c => c.id !== id) || null); 
        } 
      });
    }
  };

  const togglePinMessage = (messageId) => {
    if (!activeChannel) return;
    setPinnedMap(prev => {
      const channelPins = prev[activeChannel.id] || [];
      const isPinned = channelPins.includes(messageId);
      const updated = isPinned 
        ? channelPins.filter(id => id !== messageId)
        : [...channelPins, messageId];
      return { ...prev, [activeChannel.id]: updated };
    });
  };

  const toggleReaction = (messageId, emoji) => {
    if (!user) return;
    setReactionsMap(prev => {
      const msgReactions = prev[messageId] || {};
      const users = msgReactions[emoji] || [];
      const hasReacted = users.includes(user.username);
      const nextUsers = hasReacted 
        ? users.filter(u => u !== user.username)
        : [...users, user.username];
      
      return {
        ...prev,
        [messageId]: {
          ...msgReactions,
          [emoji]: nextUsers
        }
      };
    });
  };

  const handleAddThreadReply = (parentMsgId, text) => {
    if (!text.trim() || !user) return;
    const newReply = {
      id: `reply-${Date.now()}`,
      authorUsername: user.username,
      authorId: user.id,
      content: text,
      createdAt: new Date().toISOString()
    };
    setThreadReplies(prev => ({
      ...prev,
      [parentMsgId]: [...(prev[parentMsgId] || []), newReply]
    }));
  };

  // State 1: Loading Skeleton when initial channels loading
  if (!channels && !isMembersLoading) {
    return <ChannelSkeleton />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-170px)] min-h-[580px] space-y-3">
      {/* State 6: Disconnected STOMP state alert banner */}
      {!connected && (
        <motion.div 
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[var(--warning-soft)] border border-[var(--warning)]/30 text-[var(--warning)] text-[12px] font-medium shadow-xs shrink-0"
        >
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-[var(--warning)] animate-pulse" />
            <span><strong>Realtime Connection Lost.</strong> Reconnecting STOMP socket... Messages will sync once reconnected.</span>
          </div>
          <Badge variant="warning" size="xs" className="font-mono">Reconnecting</Badge>
        </motion.div>
      )}

      {/* Mobile Navigation Segmented Switcher */}
      <div className="flex lg:hidden items-center justify-between gap-1 p-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg shadow-xs shrink-0">
        <button 
          onClick={() => setMobileTab('channels')} 
          className={cn(
            "flex-1 py-1.5 text-[12px] font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5",
            mobileTab === 'channels' ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          )}
        >
          <Hash className="w-3.5 h-3.5" /> Channels
        </button>
        <button 
          onClick={() => setMobileTab('chat')} 
          className={cn(
            "flex-1 py-1.5 text-[12px] font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5",
            mobileTab === 'chat' ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" /> {activeChannel ? `#${activeChannel.name}` : 'Chat'}
        </button>
        <button 
          onClick={() => setMobileTab('members')} 
          className={cn(
            "flex-1 py-1.5 text-[12px] font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5",
            mobileTab === 'members' ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          )}
        >
          <UsersIcon className="w-3.5 h-3.5" /> Squad ({members.length})
        </button>
      </div>

      {/* Main 3-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
        
        {/* Column 1: Channels Sidebar */}
        <div className={cn(
          "lg:col-span-3 flex flex-col bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-xs shrink-0",
          mobileTab !== 'channels' && "hidden lg:flex"
        )}>
          <ChannelSidebar 
            channels={channels}
            activeChannel={activeChannel}
            isCreator={isCreator}
            unreadCounts={unreadCounts}
            onSelectChannel={handleSelectChannel}
            onDeleteChannel={handleDeleteChannel}
            onOpenCreate={() => setIsCreateOpen(true)}
          />
        </div>

        {/* Column 2: Main Chat Box / Stream */}
        <div className={cn(
          "lg:col-span-6 flex flex-col bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-xs relative min-h-0",
          mobileTab !== 'chat' && "hidden lg:flex"
        )}>
          {activeChannel ? (
            activeChannel.type === 'VOICE' ? (
              <VoiceRoomBox crewId={crewId} channel={activeChannel} members={members} />
            ) : (
              <ChannelChatBox 
                crewId={crewId} 
                channel={activeChannel} 
                currentUser={user} 
                isCreator={isCreator}
                pinnedIds={pinnedMap[activeChannel.id] || []}
                onTogglePin={togglePinMessage}
                reactionsMap={reactionsMap}
                onToggleReaction={toggleReaction}
                onOpenThread={(msg) => setActiveThreadMessage(msg)}
                threadRepliesCountMap={Object.fromEntries(
                  Object.entries(threadReplies).map(([k, v]) => [k, v.length])
                )}
                onOpenPinnedDrawer={() => setIsPinnedDrawerOpen(true)}
              />
            )
          ) : (
            /* State 4: Empty Channel State */
            <div className="flex-1 flex items-center justify-center bg-[var(--bg-subtle)]/20">
              <ImmersiveEmptyState
                icon={Hash}
                title="Select a Channel"
                description="Choose a channel from the sidebar to view messages or start a conversation."
                action={isCreator ? (
                  <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1.5 h-8 text-[12px] font-semibold rounded-lg">
                    <Plus className="w-3.5 h-3.5" /> Create Squad Channel
                  </Button>
                ) : null}
              />
            </div>
          )}
        </div>

        {/* Column 3: Squad Members Sidebar */}
        <div className={cn(
          "lg:col-span-3 flex flex-col bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-xs shrink-0",
          mobileTab !== 'members' && "hidden lg:flex"
        )}>
          <MembersSidebar members={members} />
        </div>
      </div>

      {/* Channel Creation Modal */}
      <CreateChannelModal 
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        channelName={channelName}
        onChannelNameChange={setChannelName}
        channelType={channelType}
        onChannelTypeChange={setChannelType}
        isPending={createChannelMutation.isPending}
        onSubmit={handleCreateChannel}
      />

      {/* Thread Slide-Over Drawer Panel */}
      <ThreadDrawer 
        open={!!activeThreadMessage}
        onClose={() => setActiveThreadMessage(null)}
        threadMessage={activeThreadMessage}
        channelName={activeChannel?.name || 'channel'}
        replies={activeThreadMessage ? threadReplies[activeThreadMessage.id] : []}
        onSendReply={handleAddThreadReply}
      />

      {/* Pinned Messages Drawer */}
      <PinnedDrawer 
        open={isPinnedDrawerOpen}
        onOpenChange={setIsPinnedDrawerOpen}
        channelName={activeChannel?.name}
        pinnedIds={activeChannel ? pinnedMap[activeChannel.id] : []}
        crewId={crewId}
        channelId={activeChannel?.id}
        onUnpin={togglePinMessage}
      />

      {confirmDialog}
    </div>
  );
}
