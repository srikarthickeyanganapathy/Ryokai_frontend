import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button, IconButton } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Input } from '@/shared/ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { useTaskList, useCompleteCrewTask, useClaimTask } from '@/features/tasks/hooks/useTasks';
import { useProjects } from '@/features/projects/hooks/useProjects';
import {
  useCrew,
  useCrewMembers,
  useInviteCrewMember,
  useCreateCrewInviteLink,
  useRemoveCrewMember,
  useLeaveCrew,
  useCrewProjects,
  useShareProjectWithCrew,
  useUnshareProjectFromCrew,
  useCrewChannels,
  useCreateCrewChannel,
  useDeleteCrewChannel,
  useChannelMessages,
  useSendChannelMessage,
  useConvertMessageToTask,
  useCreateCrewTask,
  useTransferCrewOwnership,
} from '@/features/crews/hooks/useCrews';
import { useWhiteboards, useCreateWhiteboard, useDeleteWhiteboard } from '@/features/whiteboards/hooks/useWhiteboards';
import { toast } from 'sonner';
import { Label } from '@/shared/ui/Typography/Label';
import { cn } from '@/shared/lib/cn';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog';

export function CrewDetailPage() {
  const { crewId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  // Queries
  const { data: crew, isLoading: isCrewLoading } = useCrew(crewId);
  const { data: members = [] } = useCrewMembers(crewId);
  const { data: crewTasks = [] } = useTaskList({ crewId });
  const { data: sharedProjects = [] } = useCrewProjects(crewId);
  const { data: allProjects = [] } = useProjects();
  const { data: channels = [] } = useCrewChannels(crewId);

  // Leave Crew Mutation
  const leaveCrewMutation = useLeaveCrew(crewId);

  const handleLeaveCrew = async () => {
    if (await confirm({ title: 'Are you sure you want to leave this crew?', danger: true })) {
      leaveCrewMutation.mutate(null, {
        onSuccess: () => navigate('/app/crews')
      });
    }
  };

  if (isCrewLoading || !crew) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Icons.spinner className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full space-y-4">
      
      {/* 🧭 GLITCH-FREE UNDERLINED NAVIGATION BAR */}
      <div className="relative border-b border-[var(--border-subtle)] mb-5">
        <div className="flex items-center justify-between">
          {/* Left: Underlined Tabs */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {[
              { id: 'tasks', label: 'Tasks', icon: Icons.listTodo, badge: crewTasks.length },
              { id: 'channels', label: 'Chat & Channels', icon: Icons.message, badge: channels.length },
              { id: 'projects', label: 'Projects', icon: Icons.folderClosed, badge: sharedProjects.length },
              { id: 'whiteboards', label: 'Whiteboards', icon: Icons.edit },
              { id: 'members', label: 'Members', icon: Icons.users, badge: members.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative py-2.5 px-0.5 text-[13px] font-medium transition-colors whitespace-nowrap flex items-center gap-2 bg-transparent border-none cursor-pointer",
                  activeTab === tab.id
                    ? "text-[var(--text-primary)] font-semibold"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] font-medium">
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="crew-detail-active-tab-line"
                    className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0 pb-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate('/app/crews')}>
              <Icons.chevronLeft className="w-3.5 h-3.5" />
              Back to Crews
            </Button>
            <Button variant="danger" size="sm" className="gap-1.5" onClick={handleLeaveCrew} isLoading={leaveCrewMutation.isPending}>
              <Icons.logout className="w-3.5 h-3.5" />
              Leave Crew
            </Button>
          </div>
        </div>
      </div>

      {/* 🎨 FEATURE STAGE */}
      <div className="flex-1 min-h-0">
        {activeTab === 'tasks' && (
          <TasksTab crewId={crewId} tasks={crewTasks} />
        )}
        {activeTab === 'channels' && (
          <ChannelsTab crewId={crewId} channels={channels} isCreator={crew?.myRole === 'CREATOR'} />
        )}
        { activeTab === 'projects' && (
          <ProjectsTab crewId={crewId} sharedProjects={sharedProjects} allProjects={allProjects} />
        )}
        { activeTab === 'whiteboards' && (
          <WhiteboardsTab crewId={crewId} isCreator={crew?.myRole === 'CREATOR'} />
        )}
        { activeTab === 'members' && (
          <MembersTab crewId={crewId} members={members} memberCap={crew.memberCap} isCreator={crew?.myRole === 'CREATOR'} />
        )}
      </div>
      {confirmDialog}
    </div>
  );
}

/* ==================== TASKS TAB ==================== */
function TasksTab({ crewId, tasks }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  const createTaskMutation = useCreateCrewTask(crewId);
  const claimTaskMutation = useClaimTask();
  const completeTaskMutation = useCompleteCrewTask();

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTaskMutation.mutate({
      title,
      description,
      priority,
      dueDate: dueDate || null
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setDueDate('');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Heading level={3} className="text-[16px] font-semibold mb-0">Crew Tasks</Heading>
        <Button size="sm" className="gap-1.5" onClick={() => setIsCreateOpen(true)}>
          <Icons.plus className="w-3.5 h-3.5" />
          Add Task
        </Button>
      </div>

      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ModalContent className="sm:max-w-md">
          <Heading level={3} className="mb-4">Create Crew Task</Heading>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-[12px] font-medium text-[var(--text-secondary)]">Task Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Submit assets, run deploy script..."
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[12px] font-medium text-[var(--text-secondary)]">Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about the task..."
                className="w-full min-h-[80px] rounded-md border border-[var(--border-default)] bg-transparent p-2 text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[12px] font-medium text-[var(--text-secondary)]">Priority</Label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-9 rounded-md border border-[var(--border-default)] bg-[var(--bg-sidebar)] p-2 text-sm text-[var(--text-primary)]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-[12px] font-medium text-[var(--text-secondary)]">Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={createTaskMutation.isPending}>Add Task</Button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] border-dashed">
          <Icons.listTodo className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-2" />
          <Heading level={4} className="text-[14px] font-medium text-[var(--text-secondary)]">No tasks created yet</Heading>
          <Text variant="muted" className="text-[12px] mt-1">Get started by creating a flat crew task.</Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tasks.map((task) => {
            const isUnclaimed = !task.assignee;
            return (
              <div key={task.id} className="flex flex-col p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)]">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider mb-2 font-mono ${
                      task.priority === 'URGENT' ? 'bg-red-500/10 text-red-500' :
                      task.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                      task.priority === 'MEDIUM' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'
                    }`}>
                      {task.priority}
                    </span>
                    <Heading level={4} className="text-[14px] font-semibold leading-tight line-clamp-1">{task.title}</Heading>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                    task.status === 'Done' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                    task.status === 'Needs Work' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    task.status === 'In Review' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-gray-500/10 border-gray-500/20 text-[var(--text-secondary)]'
                  }`}>
                    {task.status}
                  </span>
                </div>

                <Text className="text-[12.5px] text-[var(--text-secondary)] line-clamp-2 h-9 mb-4">
                  {task.description || 'No description provided.'}
                </Text>

                <div className="mt-auto flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 text-[12px]">
                  <span className="text-[var(--text-tertiary)] flex items-center gap-1">
                    <Icons.user className="w-3.5 h-3.5" />
                    {isUnclaimed ? <span className="italic text-orange-500">Unclaimed</span> : <span>@{task.assignee}</span>}
                  </span>
                  
                  <div className="flex gap-1.5">
                    {isUnclaimed && task.status !== 'Done' && (
                      <Button
                        size="xs"
                        variant="outline"
                        className="h-7 text-[11px]"
                        onClick={() => claimTaskMutation.mutate(task.id)}
                        isLoading={claimTaskMutation.isPending}
                      >
                        Claim Task
                      </Button>
                    )}
                    {task.status !== 'Done' && (
                      <Button
                        size="xs"
                        className="h-7 text-[11px] bg-green-600 hover:bg-green-700 text-white border-none"
                        onClick={() => completeTaskMutation.mutate(task.id)}
                        isLoading={completeTaskMutation.isPending}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ==================== DISCORD-STYLE CHANNELS TAB ==================== */
function ChannelsTab({ crewId, channels, isCreator }) {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState('TEXT');
  const { confirm, dialog: confirmDialog } = useConfirmDialog();
  const { data: members = [] } = useCrewMembers(crewId);

  const createChannelMutation = useCreateCrewChannel(crewId);
  const deleteChannelMutation = useDeleteCrewChannel(crewId);

  // Auto-select first channel on load
  useEffect(() => {
    if (!selectedChannel && channels.length > 0) {
      setSelectedChannel(channels[0]);
    }
  }, [channels, selectedChannel]);

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
          if (selectedChannel?.id === id) setSelectedChannel(channels.find(c => c.id !== id) || null);
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
                const isActive = selectedChannel?.id === chan.id;
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
                  const isActive = selectedChannel?.id === chan.id;
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
        {selectedChannel ? (
          <ChannelChatBox crewId={crewId} channel={selectedChannel} />
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

/* ==================== PROJECTS TAB ==================== */
function ProjectsTab({ crewId, sharedProjects, allProjects }) {
  const [selectedProjId, setSelectedProjId] = useState('');
  const shareMutation = useShareProjectWithCrew(crewId);
  const unshareMutation = useUnshareProjectFromCrew(crewId);

  const handleShare = () => {
    if (!selectedProjId) return;
    shareMutation.mutate(selectedProjId, {
      onSuccess: () => setSelectedProjId('')
    });
  };

  // Filter out projects that are already shared, and only allow personal projects (no org/team)
  const shareableProjects = allProjects.filter(
    proj => !sharedProjects.some(sp => sp.id === proj.id) && !proj.organizationId && !proj.teamId
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-[var(--border-subtle)] pb-4">
        <div>
          <Heading level={3} className="text-[15px] font-semibold mb-1">Shared Projects</Heading>
          <Text className="text-[12px] text-[var(--text-tertiary)]">Projects whose tasks are shared with all members of this crew.</Text>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedProjId}
            onChange={(e) => setSelectedProjId(e.target.value)}
            className="h-9 min-w-[200px] rounded-md border border-[var(--border-default)] bg-[var(--bg-sidebar)] p-2 text-sm text-[var(--text-primary)]"
          >
            <option value="">Select project to share...</option>
            {shareableProjects.map(proj => (
              <option key={proj.id} value={proj.id}>{proj.name}</option>
            ))}
          </select>
          <Button size="sm" onClick={handleShare} isLoading={shareMutation.isPending}>Share</Button>
        </div>
      </div>

      {sharedProjects.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] border-dashed">
          <Icons.folderClosed className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-2" />
          <Heading level={4} className="text-[14px] font-medium text-[var(--text-secondary)]">No projects shared yet</Heading>
        </div>
      ) : (
        <div className="space-y-2">
          {sharedProjects.map((proj) => (
            <div key={proj.id} className="flex items-center justify-between p-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] transition-colors hover:bg-[var(--bg-hover)]">
              <Link to={`/app/projects/${proj.id}`} className="flex items-center gap-3 flex-1 min-w-0 group cursor-pointer">
                <div className="w-8 h-8 rounded-md bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] font-semibold shrink-0 transition-colors group-hover:bg-[var(--accent)] group-hover:text-white">
                  {proj.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <Heading level={4} className="text-[14px] font-semibold mb-0.5 group-hover:text-[var(--accent)] transition-colors truncate">{proj.name}</Heading>
                  <Text className="text-[12px] text-[var(--text-secondary)] truncate">{proj.description}</Text>
                </div>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20"
                onClick={() => unshareMutation.mutate(proj.id)}
                isLoading={unshareMutation.isPending}
              >
                Unshare
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== DIRECTORY-STYLE MEMBERS TAB ==================== */
function MembersTab({ crewId, members, memberCap, isCreator }) {
  const [email, setEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const inviteMutation = useInviteCrewMember(crewId);
  const inviteLinkMutation = useCreateCrewInviteLink(crewId);
  const removeMutation = useRemoveCrewMember(crewId);
  const transferOwnershipMutation = useTransferCrewOwnership(crewId);

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const handleInvite = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    inviteMutation.mutate(email, {
      onSuccess: () => setEmail('')
    });
  };

  const handleCreateInviteLink = () => {
    inviteLinkMutation.mutate(null, {
      onSuccess: (data) => {
        const link = `${window.location.origin}/app/crews/join?inviteId=${data.id || data.inviteId}`;
        setInviteLink(link);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <Heading level={3} className="text-base font-bold text-[var(--text-primary)] mb-0">
            Crew Members ({members.length}/{memberCap})
          </Heading>
          <Text variant="muted" className="text-xs mt-0.5">
            Active collaborators and squad participants.
          </Text>
        </div>

        <div className="flex items-center gap-3">
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 text-xs h-8"
          />
        </div>
      </div>

      {/* Main Grid & Invite Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Member Cards Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--accent-soft)] rounded-2xl p-4 shadow-sm transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <Avatar size="md" className="bg-[var(--accent)] text-white font-bold shrink-0">
                    <AvatarFallback>{member.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Heading level={4} className="text-sm font-bold text-[var(--text-primary)] truncate mb-0">
                        @{member.username}
                      </Heading>
                      <span className={cn(
                        "text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase border",
                        member.role === 'CREATOR' 
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                          : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--color-border-subtle)]"
                      )}>
                        {member.role === 'CREATOR' ? '👑 Owner' : member.role}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] truncate mb-3">
                      {member.username}@ryokai.app
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border-subtle)]">
                      {isCreator && member.role !== 'CREATOR' && (
                        <Button
                          variant="outline"
                          size="xs"
                          className="h-7 text-[11px]"
                          onClick={async () => {
                            if (await confirm({ title: `Transfer crew ownership to @${member.username}? You will be demoted to MEMBER.`, danger: true })) {
                              transferOwnershipMutation.mutate(member.userId);
                            }
                          }}
                          isLoading={transferOwnershipMutation.isPending && transferOwnershipMutation.variables === member.userId}
                        >
                          Make Owner
                        </Button>
                      )}

                      <IconButton
                        variant="danger"
                        size="sm"
                        className="h-7 w-7"
                        title="Remove Member"
                        onClick={async () => {
                          if (await confirm({ title: `Remove member @${member.username}?`, danger: true })) {
                            removeMutation.mutate(member.userId);
                          }
                        }}
                        disabled={removeMutation.isPending}
                      >
                        <Icons.trash2 className="w-3.5 h-3.5" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-2xl border-dashed">
              <Icons.users className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
              <Heading level={4} className="text-xs font-semibold text-[var(--text-secondary)]">No members found</Heading>
            </div>
          )}
        </div>

        {/* Right 1 Col: Invite Box */}
        <div className="lg:col-span-1 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-2xl p-5 shadow-sm space-y-5 h-fit">
          <div>
            <Heading level={3} className="text-sm font-bold text-[var(--text-primary)] mb-1">Add Crew Members</Heading>
            <Text variant="muted" className="text-xs">Invite collaborators to join your squad.</Text>
          </div>

          <form onSubmit={handleInvite} className="space-y-2">
            <Label className="text-xs font-medium text-[var(--text-secondary)]">Invite by Email</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="flex-1 text-xs h-9"
                required
              />
              <Button type="submit" size="sm" isLoading={inviteMutation.isPending} className="h-9">
                Send
              </Button>
            </div>
          </form>

          <div className="border-t border-[var(--color-border-subtle)] pt-4 space-y-3">
            <Label className="text-xs font-medium text-[var(--text-secondary)]">Shareable Join Link</Label>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 h-9 text-xs"
              onClick={handleCreateInviteLink}
              isLoading={inviteLinkMutation.isPending}
            >
              <Icons.externalLink className="w-3.5 h-3.5" />
              Generate Invite Link
            </Button>
            
            {inviteLink && (
              <div className="p-2.5 bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] rounded-xl text-xs flex items-center justify-between gap-2">
                <span className="truncate text-[var(--text-secondary)] font-mono text-[11px]">{inviteLink}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteLink);
                    toast.success('Invite link copied!');
                  }}
                >
                  Copy
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {confirmDialog}
    </div>
  );
}

/* ==================== WHITEBOARDS TAB ==================== */
function WhiteboardsTab({ crewId, isCreator }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  
  const { data: whiteboards = [], isLoading } = useWhiteboards(crewId);
  const createBoardMutation = useCreateWhiteboard(crewId);
  const deleteBoardMutation = useDeleteWhiteboard(crewId);
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const handleCreate = (e) => {
    e.preventDefault();
    if (!boardTitle.trim()) return;
    createBoardMutation.mutate(boardTitle, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setBoardTitle('');
      }
    });
  };

  const handleDelete = async (e, boardId) => {
    e.preventDefault();
    e.stopPropagation();
    if (await confirm({ title: 'Delete this whiteboard?', danger: true })) {
      deleteBoardMutation.mutate(boardId);
    }
  };

  if (isLoading) return <div className="p-8 text-center"><Icons.spinner className="w-6 h-6 animate-spin mx-auto text-[var(--accent)]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-[var(--border-subtle)] pb-4">
        <div>
          <Heading level={3} className="text-[15px] font-semibold mb-1">Crew Whiteboards</Heading>
          <Text className="text-[12px] text-[var(--text-tertiary)]">Collaborate in real-time on a shared canvas.</Text>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setIsCreateOpen(true)}>
          <Icons.plus className="w-3.5 h-3.5" />
          New Whiteboard
        </Button>
      </div>

      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ModalContent className="sm:max-w-sm">
          <Heading level={3} className="mb-3 text-[16px]">Create Whiteboard</Heading>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-[var(--text-secondary)]">Board Title</Label>
              <Input
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                placeholder="Architecture Diagram, Sprint Retrospective..."
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" isLoading={createBoardMutation.isPending}>Create</Button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      {whiteboards.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] border-dashed">
          <Icons.edit className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-2" />
          <Heading level={4} className="text-[14px] font-medium text-[var(--text-secondary)]">No whiteboards yet</Heading>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {whiteboards.map(board => (
            <Link key={board.id} to={`/app/crews/${crewId}/whiteboards/${board.id}`} className="group block">
              <div className="flex flex-col p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] hover:bg-[var(--bg-hover)] transition-colors h-full">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                      <Icons.edit className="w-4 h-4" />
                    </div>
                    <div>
                      <Heading level={4} className="text-[14px] font-semibold leading-tight line-clamp-1">{board.title}</Heading>
                      <Text className="text-[10px] text-[var(--text-tertiary)]">
                        Updated {new Date(board.updatedAt).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                  {isCreator && (
                    <Button variant="ghost" onClick={(e) => handleDelete(e, board.id)} className="text-[var(--text-tertiary)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icons.trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {confirmDialog}
    </div>
  );
}
