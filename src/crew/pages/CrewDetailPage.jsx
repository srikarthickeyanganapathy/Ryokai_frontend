import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TasksTab } from './CrewDetailTabs/TasksTab';
import { ChannelsTab } from './CrewDetailTabs/ChannelsTab';
import { ProjectsTab } from './CrewDetailTabs/ProjectsTab';
import { MembersTab } from './CrewDetailTabs/MembersTab';
import { WhiteboardsTab } from './CrewDetailTabs/WhiteboardsTab';
import { OverviewTab } from './CrewDetailTabs/OverviewTab';
import { CrewHeader } from '../components/CrewHeader';
import { CrewTabs } from '../components/CrewTabs';
import { Icons } from '@/shared/ui/Icons';
import { useTaskList } from '@/task';
import { useProjects } from '@/project';
import { useCrew, useCrewMembers, useCrewChannels, useCrewProjects, useLeaveCrew } from '../features/hooks/useCrews';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog';
import { WorkspaceShell, ManagementLayout, PageStateContainer } from '@/shared/workspace-framework';
import { useAuth } from '@/identity';
import { toast } from 'sonner';

export function CrewDetailPage() {
  const { crewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const { data: crew, isLoading: isCrewLoading } = useCrew(crewId);
  const { data: members = [] } = useCrewMembers(crewId);
  
  const { data: rawCrewTasks = [] } = useTaskList({ crewId });
  
  const isCreator = useMemo(() => {
    if (!crew) return false;
    if (crew.myRole === 'CREATOR' || crew.myRole === 'OWNER') return true;
    if (!user) return false;
    const myMembership = members.find(m => m.userId === user.id || m.username === user.username);
    return myMembership?.role === 'CREATOR' || myMembership?.role === 'OWNER';
  }, [crew, members, user]);

  const leaveCrewMutation = useLeaveCrew();
  const handleLeaveCrew = async () => {
    if (isCreator && members.length > 1) {
      toast.error('You cannot leave a crew you created while other members remain.');
      return;
    }
    const confirmed = await confirm({
      title: 'Leave Crew?',
      message: `Are you sure you want to exit ${crew?.name}?`,
      confirmText: 'Leave',
      variant: 'danger'
    });
    if (!confirmed) return;

    leaveCrewMutation.mutate(crewId, {
      onSuccess: () => {
        toast.success(`You have left ${crew?.name || 'the crew'}.`);
        navigate('/app/crews');
      },
      onError: (err) => {
        toast.error(err?.response?.data?.error || err?.message || 'Failed to leave crew.');
      }
    });
  };

  const crewTasks = useMemo(() => {
    if (!Array.isArray(rawCrewTasks)) return [];
    return rawCrewTasks.filter(t => (t.crewId && String(t.crewId) === String(crewId)) || (t.crew && String(t.crew.id) === String(crewId)));
  }, [rawCrewTasks, crewId]);

  const { data: sharedProjects = [] } = useCrewProjects(crewId);
  const { data: allProjects = [] } = useProjects();
  const { data: channels = [] } = useCrewChannels(crewId);

  const completionRate = useMemo(() => {
    if (crewTasks.length === 0) return 0;
    const done = crewTasks.filter(t => t.status === 'Done' || t.status === 'COMPLETED').length;
    return Math.round((done / crewTasks.length) * 100);
  }, [crewTasks]);

  const tabCounts = useMemo(() => ({
    tasks: crewTasks.length,
    channels: channels.length,
    projects: sharedProjects.length,
    members: members.length,
  }), [crewTasks.length, channels.length, sharedProjects.length, members.length]);

  const pageState = isCrewLoading ? 'loading' : !crew ? 'empty' : 'ready';

  return (
    <WorkspaceShell maxWidth="wide">
      <ManagementLayout
        header={
          crew ? (
            <div className="pb-4">
              <CrewHeader
                crew={crew}
                members={members}
                sharedProjects={sharedProjects}
                crewTasks={crewTasks}
                channels={channels}
                completionRate={completionRate}
                isCreator={isCreator}
                onLeave={handleLeaveCrew}
                onOpenChat={() => setActiveTab('channels')}
                onOpenTasks={() => setActiveTab('tasks')}
                onNewBoard={() => setActiveTab('whiteboards')}
              />
            </div>
          ) : null
        }
        tabs={
          <CrewTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabCounts={tabCounts}
          />
        }
      >
        <PageStateContainer
          state={pageState}
          loadingConfig={{ variant: 'dashboard' }}
          emptyConfig={{ icon: Icons.users, title: 'Crew Not Found', description: 'The requested crew does not exist or you do not have permission to view it.', actionLabel: 'Back to Crews', onAction: () => navigate('/app/crews') }}
        >
          <div className="flex flex-col min-h-full pt-4">
            <div className="flex-1 min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  {activeTab === 'overview' && (
                    <OverviewTab
                      crew={crew}
                      members={members}
                      sharedProjects={sharedProjects}
                      crewTasks={crewTasks}
                      channels={channels}
                      completionRate={completionRate}
                      setActiveTab={setActiveTab}
                      isCreator={isCreator}
                    />
                  )}
                  {activeTab === 'tasks' && <TasksTab crewId={crewId} tasks={crewTasks} />}
                  {activeTab === 'channels' && <ChannelsTab crewId={crewId} channels={channels} isCreator={isCreator} />}
                  {activeTab === 'projects' && <ProjectsTab crewId={crewId} sharedProjects={sharedProjects} allProjects={allProjects} />}
                  {activeTab === 'whiteboards' && <WhiteboardsTab crewId={crewId} isCreator={isCreator} />}
                  {activeTab === 'members' && <MembersTab crewId={crewId} members={members} memberCap={crew.memberCap} isCreator={isCreator} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </PageStateContainer>
        {confirmDialog}
      </ManagementLayout>
    </WorkspaceShell>
  );
}
