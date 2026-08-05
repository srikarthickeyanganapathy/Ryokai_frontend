import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { PageHeader } from '@/shared/ui/PageHeader';
import { FilterTabs } from '@/shared/ui/FilterTabs';
import { ImmersiveStatCard, MetricGrid, ImmersiveEmptyState } from '@/shared/ui/Immersive';
import { useProjects, useCreateProject } from '../features/hooks/useProjects';
import { usePermissions } from '@/identity';
import { ProjectCard } from '../components/ProjectCard';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { ProjectForm } from '../components/ProjectForm';
import { useOrgTeams } from '@/organization';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { WorkspaceShell, ManagementLayout, PageStateContainer, ModularToolbar } from '@/shared/workspace-framework';
import { SearchPlugin } from '@/shared/workspace-framework/toolbar/plugins/SearchPlugin';
import { FolderPlus, AlertTriangle, CalendarClock, Activity, Folder, TrendingUp } from 'lucide-react';
import { getPortfolioMetrics, calculateHealthScore, formatRelativeDate } from '../features/utils/projectUtils';

const PROJECT_TABS = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export function ProjectsPage() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { workspaceMode, activeOrganization } = useWorkspace();
  const { canCreateProject } = usePermissions();
  const canCreate = workspaceMode === 'PERSONAL' || workspaceMode === 'CREWS' || canCreateProject;

  const { data: allProjects = [], isLoading, isError, error, refetch } = useProjects({ search: globalFilter });
  const createProjectMutation = useCreateProject();

  const projects = useMemo(() => {
    return allProjects.filter(p => {
      let modeMatch = false;
      if (workspaceMode === 'PERSONAL') {
        modeMatch = !p.organizationId;
      } else if (workspaceMode === 'CREWS') {
        modeMatch = !!p.crewId || (Array.isArray(p.sharedCrewIds) && p.sharedCrewIds.length > 0);
      } else if (workspaceMode === 'ORG') {
        modeMatch = p.organizationId === activeOrganization?.id;
      }
      if (!modeMatch) return false;
      if (activeTab === 'ACTIVE') return p.status !== 'COMPLETED' && p.status !== 'ARCHIVED';
      if (activeTab === 'COMPLETED') return p.status === 'COMPLETED';
      if (activeTab === 'ARCHIVED') return p.status === 'ARCHIVED';
      return true;
    });
  }, [allProjects, workspaceMode, activeOrganization, activeTab]);

  const metrics = useMemo(() => getPortfolioMetrics(projects), [projects]);

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return projects
      .filter(p => p.dueDate && p.status !== 'COMPLETED' && p.status !== 'ARCHIVED' && new Date(p.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 4);
  }, [projects]);

  const handleCreateProject = (data) => {
    createProjectMutation.mutate(data, { onSuccess: () => setIsCreateOpen(false) });
  };

  const pageState = isLoading ? 'loading' : isError ? 'error' : projects.length === 0 ? 'empty' : 'ready';

  return (
    <WorkspaceShell maxWidth="default">
      <ManagementLayout
        header={
          <PageHeader
            eyebrow="Projects"
            title="Project Directory"
            subtitle="Manage strategic initiatives, track timelines, and supervise milestones."
            actions={
              canCreate && (
                <Button size="sm" className="shrink-0 gap-1.5 shadow-sm" onClick={() => setIsCreateOpen(true)}>
                  <Icons.plus className="w-3.5 h-3.5" />
                  New Project
                </Button>
              )
            }
          />
        }
        toolbar={
          <ModularToolbar
            left={
              <FilterTabs filters={PROJECT_TABS} value={activeTab} onChange={setActiveTab} />
            }
            right={
              <SearchPlugin
                value={globalFilter}
                onChange={setGlobalFilter}
                placeholder="Search projects..."
                className="w-full sm:w-72"
              />
            }
          />
        }
      >
        {/* Executive Metrics Dashboard */}
        <MetricGrid columns={4} className="mb-6">
          <ImmersiveStatCard
            icon={Folder}
            label="Portfolio Size"
            value={metrics.total}
            subtitle={`${metrics.active} Active · ${metrics.completed} Completed`}
          />
          <ImmersiveStatCard
            icon={TrendingUp}
            label="Overall Progress"
            value={`${metrics.total > 0 ? Math.round(metrics.overallProgress / metrics.total) : 0}%`}
            tone="success"
            subtitle="Average completion across portfolio"
          />
          <ImmersiveStatCard
            icon={CalendarClock}
            label="Due This Week"
            value={metrics.endingThisWeek}
            tone="warning"
            subtitle="Milestones closing within 7 days"
          />
          <ImmersiveStatCard
            icon={AlertTriangle}
            label="Needs Attention"
            value={metrics.atRisk + metrics.overdue}
            tone="danger"
            subtitle={`${metrics.overdue} Overdue · ${metrics.atRisk} At Risk`}
          />
        </MetricGrid>

        {/* Upcoming Deadlines & Risk Projects Quick View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 glass-panel rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="w-4 h-4 text-[var(--accent)]" />
              <Heading level={4} className="text-sm font-semibold">Upcoming Deadlines</Heading>
            </div>
            <div className="space-y-2">
              {upcomingDeadlines.length === 0 ? (
                <Text variant="muted" size="sm" className="py-2">No upcoming deadlines scheduled.</Text>
              ) : (
                upcomingDeadlines.map(p => (
                  <Link to={`/app/projects/${p.id}`} key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors border border-transparent hover:border-[var(--border-subtle)]">
                    <span className="text-sm font-medium truncate">{p.name}</span>
                    <span className="text-xs font-mono px-2 py-1 rounded-md bg-[var(--bg-subtle)]">{formatRelativeDate(p.dueDate)}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-[var(--accent)]" />
              <Heading level={4} className="text-sm font-semibold">Risk Projects</Heading>
            </div>
            <div className="space-y-2">
              {projects.filter(p => calculateHealthScore(p) < 60 && p.status !== 'COMPLETED').slice(0, 3).map(p => (
                <Link to={`/app/projects/${p.id}`} key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors border border-transparent hover:border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2 truncate">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                    <span className="text-sm font-medium truncate">{p.name}</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-[var(--text-muted)]">{p.progress}%</span>
                </Link>
              ))}
              {projects.filter(p => calculateHealthScore(p) < 60 && p.status !== 'COMPLETED').length === 0 && (
                <Text variant="muted" size="sm" className="py-2">All active projects are currently healthy.</Text>
              )}
            </div>
          </div>
        </div>

        <PageStateContainer
          state={pageState}
          loadingConfig={{ variant: 'cards' }}
          errorConfig={{
            title: 'Failed to load projects',
            description: error?.message || 'An unexpected error occurred.',
            onRetry: refetch,
          }}
          emptyConfig={{
            customComponent: (
              <ImmersiveEmptyState
                icon={FolderPlus}
                title={canCreate ? "Start your first project" : "No projects found"}
                description={canCreate ? "Create a new project to organize your tasks and collaborate with your team." : "Check back later for active projects."}
                action={canCreate ? <Button onClick={() => setIsCreateOpen(true)}>Create Project</Button> : null}
              />
            )
          }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {projects.map(project => (
              <motion.div
                key={project.id}
                variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </motion.div>
        </PageStateContainer>
      </ManagementLayout>

      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ModalContent className="sm:max-w-xl">
          <Heading level={3} className="mb-4">Create Project</Heading>
          <ProjectForm
            defaultValues={{
              name: '',
              description: '',
              organizationId: workspaceMode === 'ORG' && activeOrganization ? activeOrganization.id.toString() : '',
              teamId: 'none',
              dueDate: '',
            }}
            onSubmit={handleCreateProject}
            isLoading={createProjectMutation.isPending}
            workspaceMode={workspaceMode}
            useOrgTeamsHook={useOrgTeams}
          />
        </ModalContent>
      </Modal>
    </WorkspaceShell>
  );
}