import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Input } from '@/shared/ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar';
import { cn } from '@/shared/lib/cn';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';



import { useCreateCrewTask } from '@/crew/features/hooks/useCrews'; import { useCompleteCrewTask } from '@/task';
import { useClaimTask } from '@/task/entities/hooks/useTasks';

/* ==================== DISCORD-STYLE CHANNELS TAB ==================== */
export function ChannelsTab({ crewId, channels, isCreator }) {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const activeChannel = selectedChannel || (channels.length > 0 ? channels[0] : null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState('TEXT');
  const { confirm, dialog: confirmDialog } = useConfirmDialog();
  const { data: members = [] } = useCrewMembers(crewId);

  const createChannelMutation = useCreateCrewChannel(crewId);
  const deleteChannelMutation = useDeleteCrewChannel(crewId);

  const textChannels = useMemo(() => channels.filter(c => c.type !== 'VOICE'), [channels]);
  const voiceChannels = useMemo(() => channels.filter(c => c.type === 'VOICE'), [channels]);

  const handleCreateChannel = (e) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    createChannelMutation.mutate({
      name: channelName,
      type: channelType
    }, {
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-210px)] min-h-[500px]">
      
      {/* 1. DISCORD LEFT CHANNEL SIDEBAR (3 Cols) */}
      <div className="lg:col-span-3 flex flex-col bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-2xl p-3 overflow-hidden shadow-sm">
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-[var(--color-border-subtle)] shrink-0">
          <div className="flex items-center gap-2">
            <Icons.message className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] font-mono">Channels</span>
          </div>
          {isCreator && (
            <Button 
              size="xs" 
              variant="outline" 
              className="p-1 h-6 w-6 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]" 
              onClick={() => setIsCreateOpen(true)}
              title="Create Channel"
            >
              <Icons.plus className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* Modal: New Channel */}
        <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <ModalContent className="sm:max-w-xs">
            <Heading level={3} className="mb-3 text-base">New Channel</Heading>
            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-[var(--text-secondary)]">Channel Name</Label>
                <Input
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="general, dev-lounge..."
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-[var(--text-secondary)]">Channel Type</Label>
                <select
                  value={channelType}
                  onChange={(e) => setChannelType(e.target.value)}
                  className="w-full h-9 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--bg-subtle)] p-2 text-xs text-[var(--text-primary)] font-medium"
                >
                  <option value="TEXT"># Text Channel</option>
                  <option value="VOICE">🔊 Voice Room</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" isLoading={createChannelMutation.isPending}>Create</Button>
              </div>
            </form>
          </ModalContent>
        </Modal>

        {/* Channel Categories List */}
        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
          {/* TEXT CHANNELS CATEGORY */}
          <div>
            <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-[var(--text-muted)] flex items-center justify-between">
              <span>Text Channels</span>
              <span className="text-[9px]">{textChannels.length}</span>
            </div>
            <div className="space-y-0.5">
              {textChannels.map((chan) => {
                const isActive = activeChannel?.id === chan.id;
                return (
                  <div
                    key={chan.id}
                    onClick={() => setSelectedChannel(chan)}
                    className={cn(
                      "group flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition-all duration-150 text-xs font-medium",
                      isActive
                        ? "bg-[var(--accent)] text-white font-bold shadow-md shadow-[var(--accent)]/20"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className={cn("font-bold text-sm font-mono", isActive ? "text-white" : "text-[var(--text-muted)]")}>#</span>
                      <span className="truncate">{chan.name}</span>
                    </span>
                    {isCreator && (
                      <button
                        onClick={(e) => handleDeleteChannel(chan.id, e)}
                        className={cn(
                          "opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-rose-400",
                          isActive ? "text-white/80 hover:text-white" : "text-[var(--text-muted)]"
                        )}
                        title="Delete Channel"
                      >
                        <Icons.trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
              {textChannels.length === 0 && (
                <p className="text-[11px] text-[var(--text-muted)] italic px-2 py-1">No text channels.</p>
              )}
            </div>
          </div>

          {/* VOICE CHANNELS CATEGORY */}
          {voiceChannels.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-[var(--text-muted)] flex items-center justify-between">
                <span>Voice Rooms</span>
                <span className="text-[9px]">{voiceChannels.length}</span>
              </div>
              <div className="space-y-0.5">
                {voiceChannels.map((chan) => {
                  const isActive = activeChannel?.id === chan.id;
                  return (
                    <div
                      key={chan.id}
                      onClick={() => setSelectedChannel(chan)}
                      className={cn(
                        "group flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition-all duration-150 text-xs font-medium",
                        isActive
                          ? "bg-[var(--accent)] text-white font-bold shadow-md"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span className="text-sm">🔊</span>
                        <span className="truncate">{chan.name}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 2. DISCORD CENTER CHAT CANVAS (6 Cols) */}
      <div className="lg:col-span-6 flex flex-col bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-2xl overflow-hidden shadow-sm">
        {activeChannel ? (
          <ChannelChatBox crewId={crewId} channel={activeChannel} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Icons.message className="w-12 h-12 text-[var(--accent)] mb-3 opacity-60" />
            <Heading level={4} className="text-base font-bold text-[var(--text-primary)]">Select a Channel</Heading>
            <Text variant="muted" className="text-xs mt-1">Choose a channel from the left sidebar to start chatting.</Text>
          </div>
        )}
      </div>

      {/* 3. DISCORD RIGHT SQUAD MEMBER RAIL (3 Cols) */}
      <div className="lg:col-span-3 flex flex-col bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-2xl p-3 overflow-hidden shadow-sm hidden lg:flex">
        <div className="px-2 pb-3 mb-2 border-b border-[var(--color-border-subtle)] shrink-0 flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] font-mono">Squad Members</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-semibold">
            {members.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
          <div className="px-2 text-[10px] font-mono uppercase tracking-wider font-bold text-[var(--text-muted)] mb-1">
            ONLINE — {members.length}
          </div>

          {members.map((m) => (
            <div key={m.userId} className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer group">
              <div className="relative shrink-0">
                <Avatar size="sm" className="bg-[var(--accent)] text-white font-bold text-[10px]">
                  <AvatarFallback>{(m.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-elevated)]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                    @{m.username}
                  </span>
                  {m.role === 'CREATOR' && (
                    <span className="text-[9px] font-mono font-bold uppercase text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                      👑 Owner
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[var(--text-muted)] block truncate">Active in crew</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {confirmDialog}
    </div>
  );
}

/* Discord Chat Feed Component */
function ChannelChatBox({ crewId, channel }) {
  const [msgContent, setMsgContent] = useState('');
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [targetMessage, setTargetMessage] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');

  const { data: messages = [], isLoading } = useChannelMessages(crewId, channel.id);
  const sendMessageMutation = useSendChannelMessage(crewId, channel.id);
  const convertTaskMutation = useConvertMessageToTask(crewId, channel.id);

  const handleSend = (e) => {
    e.preventDefault();
    if (!msgContent.trim()) return;

    sendMessageMutation.mutate(msgContent, {
      onSuccess: () => setMsgContent('')
    });
  };

  const handleConvertOpen = (msg) => {
    setTargetMessage(msg);
    setTaskTitle(msg.content);
    setIsConvertOpen(true);
  };

  const handleConvertToTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !targetMessage) return;

    convertTaskMutation.mutate({
      messageId: targetMessage.id,
      payload: {
        title: taskTitle,
        priority: taskPriority,
        dueDate: taskDueDate || null
      }
    }, {
      onSuccess: () => {
        setIsConvertOpen(false);
        setTargetMessage(null);
        setTaskTitle('');
        setTaskPriority('MEDIUM');
        setTaskDueDate('');
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Active Channel Header */}
      <div className="px-4 py-3 border-b border-[var(--color-border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-elevated)]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg font-mono text-[var(--accent)]">#</span>
          <div>
            <Heading level={4} className="text-sm font-bold mb-0 text-[var(--text-primary)]">{channel.name}</Heading>
            <Text size="xs" variant="muted" className="text-[11px]">Channel chat & message stream</Text>
          </div>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] text-[var(--text-muted)] uppercase">
          {channel.type}
        </span>
      </div>

      {/* Discord Message Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
        {isLoading ? (
          <div className="text-center py-12">
            <Icons.spinner className="w-6 h-6 animate-spin mx-auto text-[var(--accent)]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-xl mb-3 font-mono">
              #
            </div>
            <Heading level={3} className="text-base font-bold">Welcome to #{channel.name}!</Heading>
            <Text variant="muted" className="text-xs mt-1">This is the start of the #{channel.name} channel.</Text>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="group flex items-start gap-3 p-2 rounded-xl hover:bg-[var(--bg-subtle)] transition-colors relative">
              <Avatar size="sm" className="bg-[var(--accent)] text-white font-bold text-xs shrink-0 mt-0.5">
                <AvatarFallback>
                  {msg.authorUsername?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-[var(--accent)]">@{msg.authorUsername}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed break-words">{msg.content}</p>
              </div>
              <Button
                size="xs"
                variant="outline"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 text-[10px] gap-1 px-2.5 rounded-lg border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] shrink-0"
                onClick={() => handleConvertOpen(msg)}
              >
                <Icons.listTodo className="w-3 h-3 text-[var(--accent)]" />
                Convert to Task
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Convert to Task Modal */}
      <Modal open={isConvertOpen} onOpenChange={setIsConvertOpen}>
        <ModalContent className="sm:max-w-sm">
          <Heading level={3} className="mb-3 text-base">Convert Message to Task</Heading>
          <form onSubmit={handleConvertToTask} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-[var(--text-secondary)]">Task Title</Label>
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-[var(--text-secondary)]">Priority</Label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full h-9 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--bg-subtle)] p-2 text-xs text-[var(--text-primary)]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-[var(--text-secondary)]">Due Date</Label>
                <Input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsConvertOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" isLoading={convertTaskMutation.isPending}>Convert</Button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      {/* Discord Message Bar Input */}
      <div className="p-3 border-t border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={msgContent}
            onChange={(e) => setMsgContent(e.target.value)}
            placeholder={`Message #${channel.name}...`}
            className="flex-1 text-xs h-10 rounded-xl"
          />
          <Button type="submit" size="sm" isLoading={sendMessageMutation.isPending} className="h-10 px-4 rounded-xl">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
