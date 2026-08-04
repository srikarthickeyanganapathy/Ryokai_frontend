import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Card, CardContent } from '@/shared/ui/Card';
import { useProjects, useCreateProject } from '../features/hooks/useProjects';
import { usePermissions } from '@/identity';
import { ProjectCard } from '../sections/ProjectCard';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { ProjectForm } from '../sections/ProjectForm';
import { useOrgTeams } from '@/organization';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { cn } from '@/shared/lib/cn';
import { WorkspaceShell, ManagementLayout, PageStateContainer, ModularToolbar } from '@/shared/workspace-framework';
import { SearchPlugin } from '@/shared/workspace-framework/toolbar/plugins/SearchPlugin';
import { ImmersiveEmptyState } from '@/shared/ui/Immersive';
import { FolderPlus, AlertTriangle, CalendarClock, Activity, Folder, TrendingUp } from 'lucide-react';
import { getPortfolioMetrics, calculateHealthScore, formatRelativeDate } from '../features/utils/projectUtils';

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
                  Projects
                </span>
              </div>
              <Heading level={1} className="tracking-tight text-[22px] font-semibold mb-0">Project Directory</Heading>
              <Text variant="muted" className="text-[13px]">Manage strategic initiatives, track timelines, and supervise milestones.</Text>
            </div>
            {canCreate && (
              <Button size="sm" className="shrink-0 gap-1.5 shadow-sm" onClick={() => setIsCreateOpen(true)}>
                <Icons.plus className="w-3.5 h-3.5" />
                New Project
              </Button>
            )}
          </div>
        }
        toolbar={
          <ModularToolbar
            left={
              <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--color-border-subtle)]">
                {['ALL', 'ACTIVE', 'COMPLETED', 'ARCHIVED'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-lg transition-colors capitalize",
                      activeTab === tab
                        ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm font-semibold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {tab.toLowerCase()}
                  </button>
                ))}
              </div>
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
        {/* Executive 4-Card Metrics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border border-[var(--color-border-subtle)]">
            <CardContent className="p-4">
              <Text variant="muted" size="xs" className="uppercase tracking-wider font-semibold mb-1">Portfolio Size</Text>
              <div className="flex items-end gap-2 text-[var(--text-primary)]">
                <Folder className="w-5 h-5 text-[var(--accent)] mb-1" />
                <span className="text-2xl font-bold">{metrics.total}</span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">{metrics.active} Active · {metrics.completed} Completed</div>
            </CardContent>
          </Card>

          <Card className="border border-[var(--color-border-subtle)]">
            <CardContent className="p-4">
              <Text variant="muted" size="xs" className="uppercase tracking-wider font-semibold mb-1">Overall Progress</Text>
              <div className="flex items-end gap-2 text-[var(--text-primary)]">
                <TrendingUp className="w-5 h-5 text-green-500 mb-1" />
                <span className="text-2xl font-bold">{metrics.total > 0 ? Math.round(metrics.overallProgress / metrics.total) : 0}%</span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">Average completion across portfolio</div>
            </CardContent>
          </Card>

          <Card className="border border-[var(--color-border-subtle)]">
            <CardContent className="p-4">
              <Text variant="muted" size="xs" className="uppercase tracking-wider font-semibold mb-1">Due This Week</Text>
              <div className="flex items-end gap-2 text-[var(--text-primary)]">
                <CalendarClock className="w-5 h-5 text-[var(--warning)] mb-1" />
                <span className="text-2xl font-bold">{metrics.endingThisWeek}</span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">Milestones closing within 7 days</div>
            </CardContent>
          </Card>

          <Card className="border border-[var(--color-border-subtle)]">
            <CardContent className="p-4">
              <Text variant="muted" size="xs" className="uppercase tracking-wider font-semibold mb-1">Needs Attention</Text>
              <div className="flex items-end gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5 mb-1" />
                <span className="text-2xl font-bold">{metrics.atRisk + metrics.overdue}</span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">{metrics.overdue} Overdue · {metrics.atRisk} At Risk</div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Deadlines & Risk Projects Quick View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2 border border-[var(--color-border-subtle)]">
            <CardContent className="p-4">
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
            </CardContent>
          </Card>

          <Card className="border border-[var(--color-border-subtle)]">
            <CardContent className="p-4">
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
            </CardContent>
          </Card>
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