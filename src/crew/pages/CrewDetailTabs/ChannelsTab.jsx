import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text, Label } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/Select';
import { Avatar, AvatarFallback } from '@/shared/ui/Avatar';
import { cn } from '@/shared/lib/cn';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { 
  useCreateCrewChannel, 
  useDeleteCrewChannel, 
  useChannelMessages, 
  useConvertMessageToTask, 
  useSendChannelMessage, 
  useUpdateChannelMessage,
  useDeleteChannelMessage,
  useCrewMembers 
} from '@/crew/features/hooks/useCrews';
import { useAuth } from '@/identity';
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
  Smile
} from 'lucide-react';

export function ChannelsTab({ crewId, channels, isCreator }) {
  const { user } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState(null);
  const activeChannel = selectedChannel || (channels.length > 0 ? channels[0] : null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState('TEXT');
  const [mobileTab, setMobileTab] = useState('chat');

  const { confirm, dialog: confirmDialog } = useConfirmDialog();
  const { data: members = [] } = useCrewMembers(crewId);

  const createChannelMutation = useCreateCrewChannel(crewId);
  const deleteChannelMutation = useDeleteCrewChannel(crewId);

  const textChannels = useMemo(() => channels.filter(c => c.type !== 'VOICE'), [channels]);
  const voiceChannels = useMemo(() => channels.filter(c => c.type === 'VOICE'), [channels]);

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

  return (
    <div className="flex flex-col space-y-3 h-full">
      <div className="flex lg:hidden items-center justify-between gap-2 p-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-sm">
        <button 
          onClick={() => setMobileTab('channels')} 
          className={cn("flex-1 py-1.5 text-[12px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5", mobileTab === 'channels' ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}
        >
          <Hash className="w-3.5 h-3.5" /> Channels
        </button>
        <button 
          onClick={() => setMobileTab('chat')} 
          className={cn("flex-1 py-1.5 text-[12px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5", mobileTab === 'chat' ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}
        >
          <MessageSquare className="w-3.5 h-3.5" /> {activeChannel ? activeChannel.name : 'Chat'}
        </button>
        <button 
          onClick={() => setMobileTab('members')} 
          className={cn("flex-1 py-1.5 text-[12px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5", mobileTab === 'members' ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}
        >
          <UsersIcon className="w-3.5 h-3.5" /> Squad
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        <div className={cn(
          "lg:col-span-3 flex flex-col bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm",
          mobileTab !== 'channels' && "hidden lg:flex"
        )}>
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border-subtle)] shrink-0">
            <span className="font-semibold text-[11px] uppercase tracking-widest text-[var(--text-muted)]">Channels</span>
            <Button size="sm" variant="ghost" className="gap-1 h-7 px-2 text-[11px] hover:bg-[var(--bg-hover)]" onClick={() => setIsCreateOpen(true)} title="Create Channel">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <ModalContent className="sm:max-w-md !bg-[var(--bg-card)] !backdrop-blur-xl border border-[var(--border-subtle)] shadow-xl rounded-xl p-6">
              <div className="flex flex-col space-y-1.5 mb-5 text-center">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-2 mx-auto border border-[var(--accent-border)]">
                  {channelType === 'TEXT' ? <Hash className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </div>
                <Heading level={3} className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Create Channel</Heading>
                <Text variant="muted" className="text-[12px]">Organize squad conversations by topic or mode.</Text>
              </div>
              <form onSubmit={handleCreateChannel} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Channel Name</Label>
                  <Input value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="general, dev-lounge..." required className="h-9 text-[13px] rounded-md font-medium" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Channel Type</Label>
                  <Select value={channelType} onValueChange={setChannelType}>
                    <SelectTrigger className="h-9 text-[13px] rounded-md font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="TEXT"><span className="flex items-center gap-2"><Hash className="w-3.5 h-3.5" /> Text Channel</span></SelectItem>
                      <SelectItem value="VOICE"><span className="flex items-center gap-2"><Volume2 className="w-3.5 h-3.5" /> Voice Room</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2.5 pt-5 border-t border-[var(--border-subtle)] mt-5">
                  <Button type="button" variant="outline" size="sm" className="h-8 px-4 text-[12px] font-medium" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" size="sm" className="h-8 px-4 text-[12px] font-semibold" isLoading={createChannelMutation.isPending}>Create</Button>
                </div>
              </form>
            </ModalContent>
          </Modal>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-5">
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-widest font-semibold text-[var(--text-muted)] flex items-center justify-between">
                <span>Text Channels</span>
              </div>
              <div className="space-y-1">
                {textChannels.map((chan) => (
                  <div 
                    key={chan.id} 
                    onClick={() => { setSelectedChannel(chan); setMobileTab('chat'); }} 
                    className={cn(
                      "group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all text-[13px] font-medium", 
                      activeChannel?.id === chan.id ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-transparent"
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Hash className={cn("w-4 h-4", activeChannel?.id === chan.id ? "text-[var(--accent)]" : "text-[var(--text-muted)]")} />
                      <span className="truncate">{chan.name}</span>
                    </span>
                    {isCreator && (
                      <button onClick={(e) => handleDeleteChannel(chan.id, e)} className={cn("opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]", activeChannel?.id === chan.id && "opacity-100")}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {textChannels.length === 0 && (
                  <div className="text-center py-4 px-2">
                    <p className="text-[11px] text-[var(--text-muted)] italic mb-2">No text channels.</p>
                    <Button size="sm" variant="outline" onClick={() => setIsCreateOpen(true)} className="h-7 text-[10px] w-full rounded-md">+ Create Channel</Button>
                  </div>
                )}
              </div>
            </div>

            {voiceChannels.length > 0 && (
              <div>
                <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-widest font-semibold text-[var(--text-muted)] flex items-center justify-between">
                  <span>Voice Rooms</span>
                </div>
                <div className="space-y-1">
                  {voiceChannels.map((chan) => (
                    <div 
                      key={chan.id} 
                      onClick={() => { setSelectedChannel(chan); setMobileTab('chat'); }} 
                      className={cn(
                        "group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all text-[13px] font-medium", 
                        activeChannel?.id === chan.id ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-transparent"
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Volume2 className={cn("w-4 h-4", activeChannel?.id === chan.id ? "text-[var(--accent)]" : "text-[var(--text-muted)]")} />
                        <span className="truncate">{chan.name}</span>
                      </span>
                      {isCreator && (
                        <button onClick={(e) => handleDeleteChannel(chan.id, e)} className={cn("opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]", activeChannel?.id === chan.id && "opacity-100")}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={cn(
          "lg:col-span-6 flex flex-col bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm",
          mobileTab !== 'chat' && "hidden lg:flex"
        )}>
          {activeChannel ? (
            activeChannel.type === 'VOICE' ? (
              <VoiceRoomBox crewId={crewId} channel={activeChannel} members={members} />
            ) : (
              <ChannelChatBox crewId={crewId} channel={activeChannel} currentUser={user} isCreator={isCreator} />
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <Hash className="w-10 h-10 text-[var(--text-muted)] mb-3" />
              <Heading level={4} className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">Select a Channel</Heading>
              <Text variant="muted" className="text-[13px] mt-1 mb-5 max-w-xs">Choose a channel from the sidebar to start chatting with your squad.</Text>
              <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1.5 h-8 text-[12px] font-semibold">
                <Plus className="w-3.5 h-3.5" /> Create First Channel
              </Button>
            </div>
          )}
        </div>

        <div className={cn(
          "lg:col-span-3 flex flex-col bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm",
          mobileTab !== 'members' && "hidden lg:flex"
        )}>
          <div className="px-4 py-3.5 border-b border-[var(--border-subtle)] shrink-0 flex items-center justify-between">
            <span className="font-semibold text-[11px] uppercase tracking-widest text-[var(--text-muted)]">Squad Members</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-semibold">{members.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {members.map((m) => (
              <div key={m.userId} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group">
                <div className="relative shrink-0">
                  <Avatar className="w-8 h-8 rounded-full bg-[var(--accent)] text-white font-bold text-[11px] border border-[var(--bg-card)]">
                    <AvatarFallback className="bg-[var(--accent)] text-white">{(m.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-card)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">@{m.username}</span>
                    {m.role === 'CREATOR' && <span className="text-amber-500 text-[11px]">👑</span>}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] block truncate font-medium">Active in crew</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {confirmDialog}
      </div>
    </div>
  );
}

function VoiceRoomBox({ crewId, channel, members }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="flex flex-col h-full items-center justify-center p-8 text-center bg-[var(--bg-base)]">
      <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-5 border border-[var(--accent-border)]">
        <Volume2 className="w-8 h-8" />
      </div>
      <Heading level={3} className="text-[16px] font-semibold text-[var(--text-primary)] tracking-tight">
        Voice Room: {channel.name}
      </Heading>
      <Text variant="muted" className="text-[13px] max-w-sm mt-1 mb-6">
        Real-time audio stage for squad standups and pair programming.
      </Text>

      <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-2.5 mb-3.5">
          <span>Active Speakers</span>
          <span>{isConnected ? '1 Connected' : '0 Connected'}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {members.slice(0, 6).map((m) => (
            <div key={m.userId} className={cn(
              "flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-colors", 
              isConnected ? "bg-[var(--accent-soft)] border-[var(--accent-border)]" : "bg-[var(--bg-subtle)] border-[var(--border-subtle)]"
            )}>
              <Avatar className="w-9 h-9 rounded-full bg-[var(--accent)] text-white text-[12px] font-bold">
                <AvatarFallback className="bg-[var(--accent)] text-white">{(m.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
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
              className={cn("h-9 w-9 p-0 rounded-full shadow-sm", isMuted && "text-[var(--danger)] border-[var(--danger)]/30")} 
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-9 px-4 text-[12px] font-semibold text-[var(--danger)] border-[var(--danger)]/30 hover:bg-[var(--danger-soft)] rounded-full gap-1.5" 
              onClick={() => setIsConnected(false)}
            >
              <PhoneOff className="w-3.5 h-3.5" /> Leave
            </Button>
          </>
        ) : (
          <Button size="sm" className="h-9 px-6 text-[13px] font-semibold gap-2 shadow-sm rounded-full" onClick={() => setIsConnected(true)}>
            <Volume2 className="w-4 h-4" /> Join Voice Room
          </Button>
        )}
      </div>
    </div>
  );
}

function ChannelChatBox({ crewId, channel, currentUser, isCreator }) {
  const [msgContent, setMsgContent] = useState('');
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [targetMessage, setTargetMessage] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  
  const messagesEndRef = useRef(null);
  const { data: messages = [], isLoading } = useChannelMessages(crewId, channel.id);
  const sendMessageMutation = useSendChannelMessage(crewId, channel.id);
  const updateMessageMutation = useUpdateChannelMessage(crewId, channel.id);
  const deleteMessageMutation = useDeleteChannelMessage(crewId, channel.id);
  const convertTaskMutation = useConvertMessageToTask(crewId, channel.id);
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!msgContent.trim()) return;
    sendMessageMutation.mutate(msgContent, { onSuccess: () => setMsgContent('') });
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
    if (await confirm({ title: 'Delete this message?', danger: true })) {
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
      { onSuccess: () => { setIsConvertOpen(false); setTargetMessage(null); setTaskTitle(''); setTaskPriority('MEDIUM'); setTaskDueDate(''); } }
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
    <div className="flex flex-col h-full bg-[var(--bg-base)]">
      <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-card)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center border border-[var(--accent-border)] shrink-0">
            <Hash className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <Heading level={4} className="text-[14px] font-semibold mb-0 text-[var(--text-primary)] tracking-tight truncate">{channel.name}</Heading>
            <Text size="xs" variant="muted" className="text-[11px] truncate">Squad communication channel</Text>
          </div>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] uppercase tracking-wider hidden sm:block">
          {channel.type}
        </span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Icons.spinner className="w-6 h-6 animate-spin text-[var(--accent)] mb-3" />
            <Text variant="muted" className="text-[12px] font-medium">Loading messages...</Text>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Hash className="w-8 h-8 text-[var(--accent)] mb-3" />
            <Heading level={3} className="text-[15px] font-semibold tracking-tight">Welcome to #{channel.name}!</Heading>
            <Text variant="muted" className="text-[13px] mt-1 max-w-xs">This is the start of the channel. Be the first to say hello!</Text>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isAuthor = currentUser && (msg.authorUsername === currentUser.username || msg.authorId === currentUser.id);
              const canDelete = isAuthor || isCreator;
              
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const showDateSeparator = !prevMsg || new Date(prevMsg.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
              const isGrouped = prevMsg && 
                prevMsg.authorId === msg.authorId && 
                !showDateSeparator && 
                (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 5 * 60 * 1000);

              return (
                <React.Fragment key={msg.id}>
                  {showDateSeparator && (
                    <div className="flex items-center gap-3 my-4 select-none">
                      <div className="flex-1 h-px bg-[var(--border-subtle)]"></div>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[var(--text-muted)] bg-[var(--bg-base)] px-2 rounded-full">
                        {formatDateSeparator(msg.createdAt)}
                      </span>
                      <div className="flex-1 h-px bg-[var(--border-subtle)]"></div>
                    </div>
                  )}
                  
                  <div className={cn(
                    "group flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors relative",
                    isGrouped && "mt-0.5"
                  )}>
                    {isGrouped ? (
                      <div className="w-9 shrink-0 flex justify-center">
                        <span className="text-[9px] text-[var(--text-muted)] font-mono opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ) : (
                      <Avatar className="w-9 h-9 rounded-full bg-[var(--accent)] text-white font-bold text-[12px] shrink-0 mt-0.5">
                        <AvatarFallback className="bg-[var(--accent)] text-white">
                          {msg.authorUsername?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      {!isGrouped && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] font-semibold text-[var(--text-primary)] hover:underline cursor-pointer">@{msg.authorUsername}</span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.editedAt && <span className="text-[9px] text-[var(--text-muted)] italic">(edited)</span>}
                        </div>
                      )}

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
                          "text-[13px] text-[var(--text-primary)] leading-relaxed break-words",
                          isGrouped && "mt-0.5"
                        )}>
                          {msg.content}
                        </p>
                      )}
                    </div>

                    <div className={cn(
                      "absolute -top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-md shadow-sm p-0.5 z-10",
                      editingMessageId === msg.id && "hidden"
                    )}>
                      <button className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors" onClick={() => handleConvertOpen(msg)} title="Convert to Task">
                        <ListTodo className="w-3.5 h-3.5" />
                      </button>
                      {isAuthor && (
                        <button className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--info)] hover:bg-[var(--info-soft)] transition-colors" onClick={() => handleStartEdit(msg)} title="Edit Message">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors" onClick={() => handleDeleteMessage(msg.id)} title="Delete Message">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <Modal open={isConvertOpen} onOpenChange={setIsConvertOpen}>
        <ModalContent className="sm:max-w-md !bg-[var(--bg-card)] !backdrop-blur-xl border border-[var(--border-subtle)] shadow-xl rounded-xl p-6">
          <div className="flex flex-col space-y-1 mb-5 text-center">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-2 mx-auto border border-[var(--accent-border)]">
              <ListTodo className="w-5 h-5" />
            </div>
            <Heading level={3} className="text-[16px] font-semibold tracking-tight">Convert to Task</Heading>
            <Text variant="muted" className="text-[12px]">Turn this message into an actionable crew task.</Text>
          </div>
          <form onSubmit={handleConvertToTask} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Task Title</Label>
              <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required className="h-9 text-[13px] rounded-md font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Priority</Label>
                <Select value={taskPriority} onValueChange={setTaskPriority}>
                  <SelectTrigger className="h-9 text-[13px] rounded-md font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Due Date</Label>
                <Input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="h-9 text-[13px] rounded-md font-medium" />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-5 border-t border-[var(--border-subtle)] mt-5">
              <Button type="button" variant="outline" size="sm" className="h-8 px-4 text-[12px]" onClick={() => setIsConvertOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" className="h-8 px-4 text-[12px] font-semibold" isLoading={convertTaskMutation.isPending}>Convert</Button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      <div className="p-4 border-t border-[var(--border-subtle)] shrink-0 bg-[var(--bg-card)]">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <div className="flex-1 relative flex items-center bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl focus-within:border-[var(--accent)] transition-all">
            <button type="button" className="absolute left-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1">
              <Paperclip className="w-4 h-4" />
            </button>
            <input 
              value={msgContent} 
              onChange={(e) => setMsgContent(e.target.value)} 
              placeholder={`Message #${channel.name}...`} 
              className="flex-1 bg-transparent pl-10 pr-10 py-2 text-[13px] font-medium focus:outline-none placeholder:text-[var(--text-muted)] text-[var(--text-primary)]" 
            />
            <button type="button" className="absolute right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1">
              <Smile className="w-4 h-4" />
            </button>
          </div>
          <Button 
            type="submit" 
            size="icon" 
            className="h-9 w-9 rounded-lg shadow-sm transition-all" 
            isLoading={sendMessageMutation.isPending}
            disabled={!msgContent.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
      {confirmDialog}
    </div>
  );
}
