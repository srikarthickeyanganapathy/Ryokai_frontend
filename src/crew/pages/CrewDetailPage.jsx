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
import { useCrew, useCrewMembers, useCrewChannels, useCrewProjects, useLeaveCrew, useDeleteCrew } from '../features/hooks/useCrews';
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

  const deleteCrewMutation = useDeleteCrew();
  const leaveCrewMutation = useLeaveCrew();

  const handleLeaveCrew = async () => {
    if (isCreator) {
      if (members.length > 1) {
        const wantsTransfer = await confirm({
          title: 'Owner Action Required',
          description: `As the owner of ${crew?.name || 'this crew'}, you cannot leave while other members remain. Would you like to transfer ownership to another member?`,
          confirmLabel: 'Transfer Ownership',
          cancelLabel: 'Delete Crew Instead',
          danger: false,
        });

        if (wantsTransfer) {
          setActiveTab('members');
          toast.info('Please select a member and click Transfer Ownership before leaving.');
          return;
        }

        const confirmDelete = await confirm({
          title: 'Delete Crew Permanently?',
          description: `This will permanently delete ${crew?.name || 'this crew'} and remove all channels, tasks, and member access. This action cannot be undone.`,
          confirmLabel: 'Delete Crew',
          cancelLabel: 'Cancel',
          danger: true,
        });

        if (confirmDelete) {
          deleteCrewMutation.mutate(crewId, {
            onSuccess: () => {
              toast.success(`${crew?.name || 'Crew'} deleted successfully.`);
              navigate('/app/crews');
            },
            onError: (err) => {
              toast.error(err?.response?.data?.message || 'Failed to delete crew.');
            }
          });
        }
        return;
      } else {
        const confirmDelete = await confirm({
          title: 'Delete Crew & Leave?',
          description: `As the sole member of ${crew?.name || 'this crew'}, leaving will permanently delete it. Do you want to delete this crew?`,
          confirmLabel: 'Delete Crew',
          cancelLabel: 'Cancel',
          danger: true,
        });

        if (confirmDelete) {
          deleteCrewMutation.mutate(crewId, {
            onSuccess: () => {
              toast.success(`${crew?.name || 'Crew'} deleted.`);
              navigate('/app/crews');
            },
            onError: (err) => {
              toast.error(err?.response?.data?.message || 'Failed to delete crew.');
            }
          });
        }
        return;
      }
    }

    const confirmed = await confirm({
      title: 'Leave Crew?',
      description: `Are you sure you want to exit ${crew?.name || 'this crew'}?`,
      confirmLabel: 'Leave Crew',
      cancelLabel: 'Cancel',
      danger: true,
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
                  {activeTab === 'members' && <MembersTab crewId={crewId} members={members} memberCap={crew?.memberCap} isCreator={isCreator} />}
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
