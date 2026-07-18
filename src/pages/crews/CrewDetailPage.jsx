import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
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
import { toast } from 'sonner';

export function CrewDetailPage() {
  const { crewId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');

  // Queries
  const { data: crew, isLoading: isCrewLoading } = useCrew(crewId);
  const { data: members = [] } = useCrewMembers(crewId);
  const { data: crewTasks = [] } = useTaskList({ crewId });
  const { data: sharedProjects = [] } = useCrewProjects(crewId);
  const { data: allProjects = [] } = useProjects();
  const { data: channels = [] } = useCrewChannels(crewId);

  // Leave Crew Mutation
  const leaveCrewMutation = useLeaveCrew(crewId);

  const handleLeaveCrew = () => {
    if (window.confirm('Are you sure you want to leave this crew?')) {
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
    <div className="flex flex-col min-h-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)] mb-6">
        <div className="flex items-center gap-4">
          <Avatar size="lg" className="bg-[var(--accent-violet)] text-white">
            <AvatarImage src={crew.avatarUrl} />
            <AvatarFallback className="bg-[var(--accent-violet)] text-white text-[20px] font-semibold">
              {crew.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <Heading level={2} className="tracking-tight text-[22px] font-semibold mb-0">{crew.name}</Heading>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] font-mono text-[var(--text-secondary)]">
                {crew.visibility}
              </span>
            </div>
            <Text className="text-[13px] text-[var(--text-secondary)] mt-1">{crew.description || 'No description provided.'}</Text>
          </div>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Tabs Menu */}
      <div className="flex border-b border-[var(--border-subtle)] mb-6 overflow-x-auto gap-4">
        {[
          { id: 'tasks', label: 'Tasks', icon: Icons.listTodo },
          { id: 'channels', label: 'Chat & Channels', icon: Icons.message },
          { id: 'projects', label: 'Projects', icon: Icons.folderClosed },
          { id: 'members', label: 'Members', icon: Icons.users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-3 text-[14px] font-medium border-b-2 transition-colors shrink-0 ${
              activeTab === tab.id
                ? 'border-[var(--accent)] text-[var(--accent)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex-1">
        {activeTab === 'tasks' && (
          <TasksTab crewId={crewId} tasks={crewTasks} />
        )}
        {activeTab === 'channels' && (
          <ChannelsTab crewId={crewId} channels={channels} isCreator={crew?.myRole === 'CREATOR'} />
        )}
        {activeTab === 'projects' && (
          <ProjectsTab crewId={crewId} sharedProjects={sharedProjects} allProjects={allProjects} />
        )}
        {activeTab === 'members' && (
          <MembersTab crewId={crewId} members={members} memberCap={crew.memberCap} isCreator={crew?.myRole === 'CREATOR'} />
        )}
      </div>
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
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">Task Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Submit assets, run deploy script..."
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-[var(--text-secondary)]">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about the task..."
                className="w-full min-h-[80px] rounded-md border border-[var(--border-default)] bg-transparent p-2 text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">Priority</label>
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
                <label className="text-[12px] font-medium text-[var(--text-secondary)]">Due Date</label>
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

/* ==================== CHANNELS TAB ==================== */
function ChannelsTab({ crewId, channels, isCreator }) {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState('TEXT');

  const createChannelMutation = useCreateCrewChannel(crewId);
  const deleteChannelMutation = useDeleteCrewChannel(crewId);

  const handleCreateChannel = (e) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    createChannelMutation.mutate({
      name: channelName,
      type: channelType
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setChannelName('');
        setChannelType('TEXT');
      }
    });
  };

  const handleDeleteChannel = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this channel and all its messages?')) {
      deleteChannelMutation.mutate(id, {
        onSuccess: () => {
          if (selectedChannel?.id === id) setSelectedChannel(null);
        }
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[400px]">
      {/* Sidebar List */}
      <div className="md:col-span-1 border-r border-[var(--border-subtle)] pr-4 space-y-4">
        <div className="flex items-center justify-between">
          <Heading level={3} className="text-[14px] font-semibold mb-0">Channels</Heading>
          {isCreator && (
            <Button size="xs" variant="outline" className="p-1 h-7 w-7" onClick={() => setIsCreateOpen(true)}>
              <Icons.plus className="w-4 h-4" />
            </Button>
          )}
        </div>

        <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <ModalContent className="sm:max-w-xs">
            <Heading level={3} className="mb-3 text-[16px]">New Channel</Heading>
            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Channel Name</label>
                <Input
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="general, design..."
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Type</label>
                <select
                  value={channelType}
                  onChange={(e) => setChannelType(e.target.value)}
                  className="w-full h-9 rounded-md border border-[var(--border-default)] bg-[var(--bg-sidebar)] p-2 text-sm text-[var(--text-primary)]"
                >
                  <option value="TEXT">Text Chat</option>
                  <option value="VOICE">Voice Room</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" isLoading={createChannelMutation.isPending}>Create</Button>
              </div>
            </form>
          </ModalContent>
        </Modal>

        <div className="space-y-1">
          {channels.map((chan) => (
            <div
              key={chan.id}
              onClick={() => setSelectedChannel(chan)}
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors text-[13px] ${
                selectedChannel?.id === chan.id
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-medium'
                  : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icons.message className="w-3.5 h-3.5 shrink-0" />
                {chan.name}
              </span>
              {isCreator && (
                <button
                  onClick={(e) => handleDeleteChannel(chan.id, e)}
                  className="text-[var(--text-tertiary)] hover:text-red-500 opacity-0 hover:opacity-100 group-hover:opacity-100 p-0.5 rounded transition-opacity"
                >
                  <Icons.trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {channels.length === 0 && (
            <p className="text-[12px] text-[var(--text-tertiary)] italic p-2">No channels yet.</p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="md:col-span-3 flex flex-col bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-4 min-h-[400px]">
        {selectedChannel ? (
          <ChannelChatBox crewId={crewId} channel={selectedChannel} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Icons.message className="w-10 h-10 text-[var(--text-tertiary)] mb-2" />
            <Heading level={4} className="text-[14px] font-medium text-[var(--text-secondary)]">Select a Channel</Heading>
            <Text variant="muted" className="text-[12px] mt-1">Choose a channel from the left menu to start messaging.</Text>
          </div>
        )}
      </div>
    </div>
  );
}

/* Chat Feed Component */
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
    <div className="flex flex-col flex-1">
      {/* Active Channel Header */}
      <div className="pb-3 border-b border-[var(--border-subtle)] mb-4 flex items-center justify-between">
        <div>
          <Heading level={4} className="text-[14px] font-semibold mb-0">#{channel.name}</Heading>
          <span className="text-[11px] text-[var(--text-tertiary)] uppercase font-mono tracking-wider">{channel.type}</span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[300px] min-h-[250px] mb-4 flex flex-col justify-end">
        {isLoading ? (
          <div className="text-center py-4">
            <Icons.spinner className="w-5 h-5 animate-spin mx-auto text-[var(--accent)]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-[12.5px] text-[var(--text-tertiary)]">
            No messages here. Say hello!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="group flex items-start gap-3 hover:bg-[var(--bg-hover)] p-1.5 rounded-md transition-colors">
              <Avatar size="sm" className="bg-[var(--accent-cyan)] text-white">
                <AvatarFallback className="text-[10px] font-semibold">
                  {msg.authorUsername?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12.5px] font-semibold text-[var(--text-primary)]">@{msg.authorUsername}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[13px] text-[var(--text-secondary)] mt-0.5 break-words">{msg.content}</p>
              </div>
              <Button
                size="xs"
                variant="outline"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 text-[10px] gap-1 px-2"
                onClick={() => handleConvertOpen(msg)}
              >
                <Icons.listTodo className="w-3 h-3" />
                Convert to Task
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Convert to Task Modal */}
      <Modal open={isConvertOpen} onOpenChange={setIsConvertOpen}>
        <ModalContent className="sm:max-w-sm">
          <Heading level={3} className="mb-3 text-[15px]">Convert Message to Task</Heading>
          <form onSubmit={handleConvertToTask} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[var(--text-secondary)]">Task Title</label>
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full h-9 rounded-md border border-[var(--border-default)] bg-[var(--bg-sidebar)] p-2 text-sm text-[var(--text-primary)]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Due Date</label>
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

      {/* Send Message Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          value={msgContent}
          onChange={(e) => setMsgContent(e.target.value)}
          placeholder={`Message #${channel.name}...`}
          className="flex-1"
        />
        <Button type="submit" size="sm" isLoading={sendMessageMutation.isPending}>Send</Button>
      </form>
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

  // Filter out projects that are already shared
  const shareableProjects = allProjects.filter(
    proj => !sharedProjects.some(sp => sp.id === proj.id)
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

/* ==================== MEMBERS TAB ==================== */
function MembersTab({ crewId, members, memberCap, isCreator }) {
  const [email, setEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  const inviteMutation = useInviteCrewMember(crewId);
  const inviteLinkMutation = useCreateCrewInviteLink(crewId);
  const removeMutation = useRemoveCrewMember(crewId);
  const transferOwnershipMutation = useTransferCrewOwnership(crewId);

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
        // Assume backend returns CrewInviteDTO with an invite id/token
        // Build join invite accept URL
        const link = `${window.location.origin}/app/crews/join?inviteId=${data.id || data.inviteId}`;
        setInviteLink(link);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Member list */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-2">
            <Heading level={3} className="text-[15px] font-semibold mb-0">Crew Members ({members.length}/{memberCap})</Heading>
          </div>
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.userId} className="flex items-center justify-between p-2.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)]">
                <div className="flex items-center gap-3">
                  <Avatar size="sm" className="bg-[var(--accent-orange)] text-white">
                    <AvatarFallback className="text-[11px] font-semibold">
                      {member.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">@{member.username}</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] ml-2 uppercase font-mono">{member.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCreator && member.role !== 'CREATOR' && (
                    <Button
                      variant="outline"
                      size="xs"
                      className="text-[11px] h-7 px-2 border-[var(--border-default)]"
                      onClick={() => {
                        if (window.confirm(`Transfer crew ownership to @${member.username}? You will be demoted to MEMBER.`)) {
                          transferOwnershipMutation.mutate(member.userId);
                        }
                      }}
                      isLoading={transferOwnershipMutation.isPending && transferOwnershipMutation.variables === member.userId}
                    >
                      Make Owner
                    </Button>
                  )}
                  {/* Remove member button */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Remove member @${member.username}?`)) {
                        removeMutation.mutate(member.userId);
                      }
                    }}
                    className="text-[var(--text-tertiary)] hover:text-red-500 p-1"
                  >
                    <Icons.trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite Area */}
        <div className="space-y-6 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-4">
          <div>
            <Heading level={3} className="text-[14px] font-semibold mb-1">Add Crew Members</Heading>
            <Text className="text-[12px] text-[var(--text-tertiary)]">Invite someone new to collaborate in this crew.</Text>
          </div>

          <form onSubmit={handleInvite} className="space-y-2">
            <label className="text-[11px] font-medium text-[var(--text-secondary)]">Invite by Email</label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="flex-1"
                required
              />
              <Button type="submit" size="sm" isLoading={inviteMutation.isPending}>Send Invite</Button>
            </div>
          </form>

          <div className="border-t border-[var(--border-subtle)] pt-4 space-y-3">
            <label className="text-[11px] font-medium text-[var(--text-secondary)]">Generate Invite Link</label>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={handleCreateInviteLink}
              isLoading={inviteLinkMutation.isPending}
            >
              <Icons.externalLink className="w-3.5 h-3.5" />
              Generate Invite Link
            </Button>
            
            {inviteLink && (
              <div className="flex gap-2 mt-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="text-[12px] bg-[var(--bg-sidebar)] flex-1 select-all"
                />
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
    </div>
  );
}
