import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text, Label } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/Select';
import { Avatar, AvatarFallback } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/shared/ui/Modal';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/shared/ui/Drawer';
import { ImmersiveEmptyState } from '@/shared/ui/Immersive';
import { 
  useCreateCrewChannel, 
  useDeleteCrewChannel, 
  useChannelMessages, 
  useConvertMessageToTask, 
  useSendChannelMessage, 
  useUpdateChannelMessage,
  useDeleteChannelMessage,
  useCrewMembers 
} from '../../features/hooks/useCrews';
import { useAuth } from '@/identity';
import { useRealtime } from '@/app/providers/RealTimeProvider';
import { 
  Hash, 
  Volume2, 
  Plus, 
  Trash2, 
  Send, 
  MessageSquare, 
  Edit2, 
  ListTodo, 
  Search, 
  Users as UsersIcon,
  Mic,
  MicOff,
  PhoneOff,
  Paperclip,
  Smile,
  Pin,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  WifiOff,
  Radio,
  CornerDownRight,
  ChevronRight,
  SmilePlus
} from '@/shared/ui/Icons';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '🚀', '💡', '✅'];

/* ── Presentational helpers (module scope) ── */
function getAvatarGradient(name = '?') {
  const hash = (name || '').split('').reduce((acc, c) => c.charCodeAt(0) + ((acc << 5) - acc), 0)
  return `linear-gradient(135deg, hsl(${Math.abs(hash) % 360} 70% 60%), hsl(${(Math.abs(hash) + 35) % 360} 70% 45%))`
}

function formatTimeCompact(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ChannelsTab({ crewId, channels = [], isCreator }) {
  const { user } = useAuth();
  const { connected } = useRealtime();
  const [selectedChannel, setSelectedChannel] = useState(null);
  const activeChannel = selectedChannel || (channels.length > 0 ? channels[0] : null);

  const [channelSearch, setChannelSearch] = useState('');
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

  // Filter channels based on search
  const filteredChannels = useMemo(() => {
    if (!channelSearch.trim()) return channels;
    return channels.filter(c => c.name.toLowerCase().includes(channelSearch.toLowerCase()));
  }, [channels, channelSearch]);

  const textChannels = useMemo(() => filteredChannels.filter(c => c.type !== 'VOICE'), [filteredChannels]);
  const voiceChannels = useMemo(() => filteredChannels.filter(c => c.type === 'VOICE'), [filteredChannels]);

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
          {/* Channel Header & Filter */}
          <div className="p-3.5 border-b border-[var(--border-subtle)] shrink-0 space-y-3 bg-[var(--bg-subtle)]/40">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
                  <Hash className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-tight truncate">Channels</p>
                  <p className="text-[10px] text-[var(--text-muted)] leading-tight truncate">Text & voice for the squad</p>
                </div>
              </div>
              {isCreator ? (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="gap-1 h-7 px-2 text-[11px] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] rounded-lg transition-colors shrink-0" 
                  onClick={() => setIsCreateOpen(true)} 
                  title="Create New Channel"
                >
                  <Plus className="w-3.5 h-3.5" /> New
                </Button>
              ) : (
                <Badge variant="default" size="xs">Read-only</Badge>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input 
                value={channelSearch}
                onChange={(e) => setChannelSearch(e.target.value)}
                placeholder="Search channels..."
                className="w-full pl-8 pr-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-lg text-[12px] placeholder:text-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30 transition-colors"
              />
            </div>
          </div>

          {/* Channels List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
            {/* Text Channels Category */}
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center justify-between">
                <span>Text Channels</span>
                <span className="text-[10px] text-[var(--text-tertiary)] font-sans">{textChannels.length}</span>
              </div>
              <div className="space-y-1">
                {textChannels.map((chan) => {
                  const isActive = activeChannel?.id === chan.id;
                  const unread = unreadCounts[chan.id] || 0;
                  return (
                    <div 
                      key={chan.id} 
                      onClick={() => handleSelectChannel(chan)} 
                      className={cn(
                        "group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all text-[13px] font-medium relative", 
                        isActive 
                          ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] shadow-xs" 
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-transparent"
                      )}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <Hash className={cn("w-4 h-4 shrink-0", isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]")} />
                        <span className="truncate">{chan.name}</span>
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {unread > 0 && !isActive && (
                          <Badge variant="primary" size="xs" className="font-mono font-bold animate-pulse">
                            {unread}
                          </Badge>
                        )}
                        {isCreator && (
                          <button 
                            onClick={(e) => handleDeleteChannel(chan.id, e)} 
                            className={cn(
                              "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]", 
                              isActive && "opacity-100"
                            )}
                            title="Delete channel"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {textChannels.length === 0 && (
                  <div className="text-center py-5 px-3 border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-subtle)]/30">
                    <p className="text-[11px] text-[var(--text-muted)] italic mb-2">No matching text channels.</p>
                    {isCreator && (
                      <Button size="sm" variant="outline" onClick={() => setIsCreateOpen(true)} className="h-7 text-[11px] w-full rounded-lg">
                        + Create Channel
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Voice Rooms Category */}
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center justify-between">
                <span>Voice Rooms</span>
                <span className="text-[10px] text-[var(--text-tertiary)] font-sans">{voiceChannels.length}</span>
              </div>
              <div className="space-y-1">
                {voiceChannels.map((chan) => {
                  const isActive = activeChannel?.id === chan.id;
                  return (
                    <div 
                      key={chan.id} 
                      onClick={() => handleSelectChannel(chan)} 
                      className={cn(
                        "group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all text-[13px] font-medium", 
                        isActive 
                          ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] shadow-xs" 
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-transparent"
                      )}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <Volume2 className={cn("w-4 h-4 shrink-0", isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]")} />
                        <span className="truncate">{chan.name}</span>
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                        {isCreator && (
                          <button 
                            onClick={(e) => handleDeleteChannel(chan.id, e)} 
                            className={cn(
                              "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]", 
                              isActive && "opacity-100"
                            )}
                            title="Delete voice room"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {voiceChannels.length === 0 && (
                  <p className="text-[11px] text-[var(--text-muted)] italic px-2 py-1">No active voice rooms.</p>
                )}
              </div>
            </div>
          </div>
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
          <div className="px-3.5 py-3 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--bg-subtle)]/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
                <UsersIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-tight">Active Squad</p>
                <p className="text-[10px] text-[var(--text-muted)] leading-tight">Who's in the room</p>
              </div>
              <Badge variant="secondary" size="xs" className="font-mono">{members.length}</Badge>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {members.map((m) => (
              <div key={m.userId} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group">
                <div className="relative shrink-0">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                    style={{ background: getAvatarGradient(m.username) }}
                  >
                    {(m.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--success)] ring-2 ring-[var(--bg-card)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">@{m.username}</span>
                    {m.role === 'CREATOR' && <span className="text-amber-500 text-[11px]" title="Crew Owner">👑</span>}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] block truncate font-medium">
                    {m.role === 'CREATOR' ? 'Crew Owner' : 'Squad Member'}
                  </span>
                </div>
              </div>
            ))}

            {members.length === 0 && (
              <div className="p-4 text-center text-[12px] text-[var(--text-muted)] italic">
                No members found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Channel Creation Modal */}
      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ModalContent className="sm:max-w-md !bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl rounded-2xl p-6">
          <ModalHeader className="text-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-3 mx-auto border border-[var(--accent-border)] shadow-xs">
              {channelType === 'TEXT' ? <Hash className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </div>
            <ModalTitle className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Create Channel</ModalTitle>
            <Text variant="muted" className="text-[12px] mt-1">Organize squad conversations by topic or voice mode.</Text>
          </ModalHeader>
          <form onSubmit={handleCreateChannel} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Channel Name</Label>
              <Input 
                value={channelName} 
                onChange={(e) => setChannelName(e.target.value)} 
                placeholder="e.g. general, sprint-qa, dev-lounge" 
                required 
                className="h-9 text-[13px] rounded-lg font-medium bg-[var(--bg-base)]" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Channel Type</Label>
              <Select value={channelType} onValueChange={setChannelType}>
                <SelectTrigger className="h-9 text-[13px] rounded-lg font-medium bg-[var(--bg-base)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="TEXT"><span className="flex items-center gap-2"><Hash className="w-3.5 h-3.5" /> Text Channel</span></SelectItem>
                  <SelectItem value="VOICE"><span className="flex items-center gap-2"><Volume2 className="w-3.5 h-3.5" /> Voice Room</span></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2.5 pt-4 border-t border-[var(--border-subtle)] mt-5">
              <Button type="button" variant="outline" size="sm" className="h-8 px-4 text-[12px] rounded-lg" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" className="h-8 px-4 text-[12px] font-semibold rounded-lg" isLoading={createChannelMutation.isPending}>Create Channel</Button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      {/* Thread Slide-Over Drawer Panel */}
      <Drawer open={!!activeThreadMessage} onOpenChange={(open) => !open && setActiveThreadMessage(null)}>
        <DrawerContent side="right" className="sm:max-w-md bg-[var(--bg-card)] p-5 border-l border-[var(--border-subtle)] flex flex-col h-full">
          {activeThreadMessage && (
            <>
              <DrawerHeader className="border-b border-[var(--border-subtle)] pb-3 mb-3 text-left">
                <DrawerTitle className="text-[15px] font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[var(--accent)]" /> Message Thread
                </DrawerTitle>
                <DrawerDescription className="text-[12px]">
                  Replies in #{activeChannel?.name || 'channel'}
                </DrawerDescription>
              </DrawerHeader>

              {/* Parent Message Card */}
              <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] mb-4 shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12px] font-semibold text-[var(--text-primary)]">@{activeThreadMessage.authorUsername}</span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {formatTimeCompact(activeThreadMessage.createdAt)}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--text-primary)] leading-relaxed">{activeThreadMessage.content}</p>
              </div>

              {/* Thread Replies List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                {threadReplies[activeThreadMessage.id]?.map((reply) => (
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

                {(!threadReplies[activeThreadMessage.id] || threadReplies[activeThreadMessage.id].length === 0) && (
                  <div className="text-center py-8 text-[12px] text-[var(--text-muted)] italic">
                    No replies yet. Be the first to respond!
                  </div>
                )}
              </div>

              {/* Reply Input Form */}
              <div className="pt-3 border-t border-[var(--border-subtle)] shrink-0 mt-3">
                <ThreadReplyForm 
                  onSend={(text) => handleAddThreadReply(activeThreadMessage.id, text)} 
                />
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* Pinned Messages Drawer */}
      <Drawer open={isPinnedDrawerOpen} onOpenChange={setIsPinnedDrawerOpen}>
        <DrawerContent side="right" className="sm:max-w-md bg-[var(--bg-card)] p-5 border-l border-[var(--border-subtle)] flex flex-col h-full">
          <DrawerHeader className="border-b border-[var(--border-subtle)] pb-3 mb-3 text-left">
            <DrawerTitle className="text-[15px] font-semibold flex items-center gap-2">
              <Pin className="w-4 h-4 text-amber-500 fill-amber-500/20" /> Pinned Announcements
            </DrawerTitle>
            <DrawerDescription className="text-[12px]">
              Pinned messages in #{activeChannel?.name}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {activeChannel && pinnedMap[activeChannel.id]?.length > 0 ? (
              <PinnedMessagesList 
                crewId={crewId} 
                channelId={activeChannel.id} 
                pinnedIds={pinnedMap[activeChannel.id]}
                onUnpin={togglePinMessage} 
              />
            ) : (
              <div className="text-center py-12 text-[12px] text-[var(--text-muted)] italic">
                No pinned messages in this channel yet.
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {confirmDialog}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-Component: ChannelChatBox                                              */
/* -------------------------------------------------------------------------- */

function ChannelChatBox({ 
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

  const messagesEndRef = useRef(null);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages.length]);

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

  const formatDateSeparator = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)] min-h-0 relative">
      {/* State 2: Background refetch progress bar */}
      {isFetching && !isLoading && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--accent)] animate-pulse z-20" />
      )}

      {/* Channel Header Bar */}
      <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-card)] shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center border border-[var(--accent-border)] shrink-0">
            <Hash className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Heading level={4} className="text-[14px] font-semibold text-[var(--text-primary)] tracking-tight truncate mb-0">
                #{channel.name}
              </Heading>
              <Badge variant="primary" size="xs">{channel.type === 'VOICE' ? 'Voice' : 'Text'}</Badge>
            </div>
            <Text variant="muted" className="text-[11px] truncate">Squad communication stream</Text>
          </div>
        </div>

        {/* Pinned announcements trigger button */}
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 px-2.5 text-[12px] gap-1.5 rounded-lg border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]"
            onClick={onOpenPinnedDrawer}
            title="View Pinned Announcements"
          >
            <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
            <span className="hidden sm:inline font-medium">Pinned</span>
            {pinnedIds.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold font-mono">
                {pinnedIds.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Messages Stream Container */}
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
            <Text variant="muted" className="text-[12px] mt-1 mb-4">Network request failed for channel #{channel.name}.</Text>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-1.5 h-8 text-[12px]">
              <RefreshCw className="w-3.5 h-3.5" /> Retry Loading
            </Button>
          </div>
        ) : allMessages.length === 0 ? (
          /* State 4: Empty Channel Messages State */
          <div className="flex-1 flex items-center justify-center">
            <ImmersiveEmptyState
              icon={Hash}
              title={`Welcome to #${channel.name}!`}
              description="This is the start of the channel. Send a message to start collaboration!"
            />
          </div>
        ) : (
          /* Stream rendering */
          <>
            {allMessages.map((msg, index) => {
              const isAuthor = currentUser && (msg.authorUsername === currentUser.username || msg.authorId === currentUser.id);
              const canDelete = isAuthor || isCreator;
              const isPinned = pinnedIds.includes(msg.id);
              const reactions = reactionsMap[msg.id] || {};
              const threadCount = threadRepliesCountMap[msg.id] || 0;

              const prevMsg = index > 0 ? allMessages[index - 1] : null;
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
                        <form onSubmit={(e) => handleSaveEdit(e, msg.id)} className="space-y-2 mt-1">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[60px] text-[13px] bg-[var(--bg-card)] border-[var(--accent-border)] rounded-lg"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button type="submit" size="sm" className="h-7 text-[11px] rounded-md" isLoading={updateMessageMutation.isPending}>Save</Button>
                            <Button type="button" variant="ghost" size="sm" className="h-7 text-[11px] rounded-md" onClick={() => setEditingMessageId(null)}>Cancel</Button>
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
                          "p-1 rounded-md text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10 transition-colors",
                          isPinned && "text-amber-500 bg-amber-500/10"
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
                        onClick={() => handleConvertOpen(msg)} 
                        title="Convert to Task"
                      >
                        <ListTodo className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Message (if author) */}
                      {isAuthor && (
                        <button 
                          className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors" 
                          onClick={() => handleStartEdit(msg)} 
                          title="Edit message"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete Message */}
                      {canDelete && (
                        <button 
                          className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors" 
                          onClick={() => handleDeleteMessage(msg.id)} 
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} className="h-2" />
          </>
        )}
      </div>

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
        <form onSubmit={handleSend} className="relative">
          <div className="relative flex items-center bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl focus-within:ring-2 focus-within:ring-[var(--accent)]/20 focus-within:border-[var(--accent-border)] transition-all">
            <div className="pl-3">
              <button type="button" className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors" title="Attach file">
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
            <input 
              value={msgContent} 
              onChange={handleInputChange} 
              placeholder={`Message #${channel.name}...`} 
              className="w-full pl-2 pr-24 py-2.5 bg-transparent text-[13px] font-medium focus:outline-none placeholder:text-[var(--text-muted)] text-[var(--text-primary)]" 
            />
            <button type="button" className="absolute right-10 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors p-1 rounded-md" title="Insert emoji">
              <Smile className="w-4 h-4" />
            </button>
            <Button 
              type="submit" 
              size="sm" 
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7.5 w-7.5 p-0 shadow-sm" 
              isLoading={sendMessageMutation.isPending}
              disabled={!msgContent.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </form>
      </div>

      {/* Task Conversion Pre-Filled Modal */}
      <Modal open={isConvertOpen} onOpenChange={setIsConvertOpen}>
        <ModalContent className="sm:max-w-md !bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl rounded-2xl p-6">
          <ModalHeader className="text-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-2 mx-auto border border-[var(--accent-border)]">
              <ListTodo className="w-6 h-6" />
            </div>
            <ModalTitle className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Convert Message to Task</ModalTitle>
            <Text variant="muted" className="text-[12px] mt-1">Turn this chat message directly into an actionable task.</Text>
          </ModalHeader>
          <form onSubmit={handleConvertToTask} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Task Title</Label>
              <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required className="h-9 text-[13px] rounded-lg font-medium bg-[var(--bg-base)]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Priority</Label>
                <Select value={taskPriority} onValueChange={setTaskPriority}>
                  <SelectTrigger className="h-9 text-[13px] rounded-lg font-medium bg-[var(--bg-base)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Due Date</Label>
                <Input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="h-9 text-[13px] rounded-lg font-medium bg-[var(--bg-base)]" />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-4 border-t border-[var(--border-subtle)] mt-5">
              <Button type="button" variant="outline" size="sm" className="h-8 px-4 text-[12px] rounded-lg" onClick={() => setIsConvertOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" className="h-8 px-4 text-[12px] font-semibold rounded-lg" isLoading={convertTaskMutation.isPending}>Convert Task</Button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      {confirmDialog}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-Component: VoiceRoomBox                                                */
/* -------------------------------------------------------------------------- */

function VoiceRoomBox({ crewId, channel, members }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="flex flex-col h-full items-center justify-center p-8 text-center bg-[var(--bg-base)]">
      <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-5 border border-[var(--accent-border)] shadow-xs">
        <Volume2 className="w-8 h-8" />
      </div>
      <Heading level={3} className="text-[16px] font-semibold text-[var(--text-primary)] tracking-tight">
        Voice Stage: {channel.name}
      </Heading>
      <Text variant="muted" className="text-[13px] max-w-sm mt-1 mb-6">
        Real-time audio stage for squad standups, pair programming, and quick huddles.
      </Text>

      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 mb-6 shadow-xs">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider font-semibold text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-2.5 mb-3.5">
          <span>Active Speakers</span>
          <Badge variant={isConnected ? "success" : "default"} size="xs">
            {isConnected ? '1 Connected' : '0 Connected'}
          </Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {members.slice(0, 6).map((m) => (
            <div key={m.userId} className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all", 
              isConnected ? "bg-[var(--accent-soft)]/40 border-[var(--accent-border)]" : "bg-[var(--bg-subtle)] border-[var(--border-subtle)]"
            )}>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
                style={{ background: getAvatarGradient(m.username) }}
              >
                {(m.username || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-[11px] font-semibold truncate text-[var(--text-primary)]">@{m.username}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isConnected ? (
          <>
            <Button 
              size="sm" 
              variant={isMuted ? "outline" : "secondary"} 
              className={cn("h-10 w-10 p-0 rounded-full shadow-xs", isMuted && "text-[var(--danger)] border-[var(--danger)]/30")} 
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-10 px-5 text-[12px] font-semibold text-[var(--danger)] border-[var(--danger)]/30 hover:bg-[var(--danger-soft)] rounded-full gap-2" 
              onClick={() => setIsConnected(false)}
            >
              <PhoneOff className="w-4 h-4" /> Leave Stage
            </Button>
          </>
        ) : (
          <Button size="sm" className="h-10 px-6 text-[13px] font-semibold gap-2 shadow-xs rounded-full" onClick={() => setIsConnected(true)}>
            <Volume2 className="w-4 h-4" /> Join Voice Stage
          </Button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-Component: ThreadReplyForm                                             */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Sub-Component: PinnedMessagesList                                          */
/* -------------------------------------------------------------------------- */

function PinnedMessagesList({ crewId, channelId, pinnedIds, onUnpin }) {
  const { data: messages = [] } = useChannelMessages(crewId, channelId);
  const pinnedMessages = useMemo(() => {
    return messages.filter(m => pinnedIds.includes(m.id));
  }, [messages, pinnedIds]);

  return (
    <div className="space-y-2">
      {pinnedMessages.map((msg) => (
        <div key={msg.id} className="group flex items-start gap-2.5 p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px]">
          <Pin className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-[11px] font-semibold text-[var(--text-primary)] truncate">@{msg.authorUsername}</span>
              <button 
                onClick={() => onUnpin(msg.id)} 
                className="text-[10px] text-[var(--danger)] hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                Unpin
              </button>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{msg.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-Component: ChannelSkeleton (Loading UX State 1)                        */
/* -------------------------------------------------------------------------- */

function ChannelSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-170px)] min-h-[580px] animate-pulse">
      <div className="lg:col-span-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-4">
        <div className="h-4 bg-[var(--bg-hover)] rounded w-1/2" />
        <div className="h-8 bg-[var(--bg-hover)] rounded-lg w-full" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 bg-[var(--bg-hover)] rounded-lg w-full" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col justify-between">
        <div className="h-10 bg-[var(--bg-hover)] rounded-lg w-full" />
        <div className="space-y-4 py-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-[var(--bg-hover)]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[var(--bg-hover)] rounded w-1/4" />
                <div className="h-4 bg-[var(--bg-hover)] rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-10 bg-[var(--bg-hover)] rounded-lg w-full" />
      </div>
      <div className="lg:col-span-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3">
        <div className="h-4 bg-[var(--bg-hover)] rounded w-1/3" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--bg-hover)]" />
            <div className="h-3 bg-[var(--bg-hover)] rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
