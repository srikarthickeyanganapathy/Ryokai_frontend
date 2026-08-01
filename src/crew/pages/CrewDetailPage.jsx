import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TasksTab } from './CrewDetailTabs/TasksTab';
import { ChannelsTab } from './CrewDetailTabs/ChannelsTab';
import { ProjectsTab } from './CrewDetailTabs/ProjectsTab';
import { MembersTab } from './CrewDetailTabs/MembersTab';
import { WhiteboardsTab } from './CrewDetailTabs/WhiteboardsTab';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button, IconButton } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Input } from '@/shared/ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { useTaskList, useCompleteCrewTask, useClaimTask } from '@/task';
import { useProjects } from '@/project';
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
} from '../features/hooks/useCrews';
import { useWhiteboards, useCreateWhiteboard, useDeleteWhiteboard } from '@/whiteboard';
import { toast } from 'sonner';
import { Label } from '@/shared/ui/Typography/Label';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog';
import {
  WorkspaceShell,
  ManagementLayout,
  PageStateContainer,
} from '@/shared/workspace-framework';
import { cn } from '@/shared/lib/cn';

export function CrewDetailPage() {
  const { crewId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  // Queries
  const { data: crew, isLoading: isCrewLoading } = useCrew(crewId);
  const { data: members = [] } = useCrewMembers(crewId);
  const { data: rawCrewTasks = [] } = useTaskList({ crewId });
  const crewTasks = useMemo(() => {
    if (!Array.isArray(rawCrewTasks)) return [];
    return rawCrewTasks.filter(t => 
      (t.crewId && String(t.crewId) === String(crewId)) || 
      (t.crew && String(t.crew.id) === String(crewId))
    );
  }, [rawCrewTasks, crewId]);
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

  const pageState = isCrewLoading ? 'loading' : !crew ? 'empty' : 'ready';

  return (
    <WorkspaceShell maxWidth="wide">
      <ManagementLayout
        header={
          crew ? (
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-base flex items-center justify-center border border-[var(--accent-border)] font-mono">
                  {crew.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Heading level={2} className="text-xl font-bold tracking-tight mb-0">{crew.name}</Heading>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                      {crew.visibility?.replace('_', ' ') || 'PUBLIC'}
                    </span>
                  </div>
                  <Text size="xs" variant="muted" className="mt-0.5">{crew.description || 'No description provided.'}</Text>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={handleLeaveCrew} className="text-[var(--danger)] hover:bg-[var(--danger-soft)] border-[var(--danger-soft)]">
                <Icons.logout className="w-3.5 h-3.5 mr-1.5" />
                Leave Crew
              </Button>
            </div>
          ) : null
        }
      >
        <PageStateContainer
          state={pageState}
          loadingConfig={{ variant: 'dashboard' }}
          emptyConfig={{
            icon: Icons.users,
            title: 'Crew Not Found',
            description: 'The requested crew does not exist or you do not have permission to view it.',
            actionLabel: 'Back to Crews',
            onAction: () => navigate('/app/crews'),
          }}
        >
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
        </PageStateContainer>
      </ManagementLayout>
    </WorkspaceShell>
  );
}
