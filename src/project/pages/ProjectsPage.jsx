import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { useProjects, useCreateProject } from '../features/hooks/useProjects';
import { usePermissions } from '@/identity';
import { ProjectCard } from '../components/ProjectCard';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { ProjectForm } from '../components/ProjectForm';
import { useOrgTeams } from '@/organization';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { PageShell, PageHero, PageStats, PageToolbar, PageContent, PageEmptyState, FloatingActions } from '@/shared/ui/PageShell';
import { FilterTabs } from '@/shared/ui/FilterTabs';
import { SearchPlugin } from '@/shared/workspace-framework';
import { getPortfolioMetrics, calculateHealthScore, formatRelativeDate } from '../features/utils/projectUtils';
import {
  FolderKanban, Plus, TrendingUp, CalendarClock,
  AlertTriangle, Folder, Activity
} from 'lucide-react';

const PROJECT_TABS = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export function ProjectsPage() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const navigate = useNavigate();

  const { workspaceMode, activeOrganization } = useWorkspace();
  const { canCreateProject } = usePermissions();
  const canCreate = workspaceMode === 'PERSONAL' || workspaceMode === 'CREWS' || canCreateProject;

  // Debounce search input to avoid per-keystroke API requests
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilter(globalFilter), 300);
    return () => clearTimeout(timer);
  }, [globalFilter]);

  const { data: allProjects = [], isLoading, isError, error, refetch } = useProjects({ search: debouncedFilter });
  const createProjectMutation = useCreateProject();

  const projects = useMemo(() => {
    return allProjects.filter(p => {
      if (workspaceMode === 'PERSONAL') return !p.organizationId;
      if (workspaceMode === 'CREWS') return !!p.crewId || (Array.isArray(p.sharedCrewIds) && p.sharedCrewIds.length > 0);
      if (workspaceMode === 'ORG') return p.organizationId === activeOrganization?.id;
      return true;
    }).filter(p => {
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

  const atRiskProjects = useMemo(() => {
    return projects.filter(p => calculateHealthScore(p) < 60 && p.status !== 'COMPLETED').slice(0, 3);
  }, [projects]);

  const handleCreateProject = (data) => {
    createProjectMutation.mutate(data, { onSuccess: () => setIsCreateOpen(false) });
  };

  return (
    <PageShell workspaceMode={workspaceMode} maxWidth="default">
      <PageHero
        title="Project Directory"
        subtitle="Manage strategic initiatives, track timelines, and supervise milestones."
        eyebrow="Projects"
        icon={FolderKanban}
      >
        {canCreate && (
          <Button size="sm" className="shrink-0 gap-1.5 shadow-sm" onClick={() => setIsCreateOpen(true)}>
            <Plus size={14} strokeWidth={1.5} />
            New Project
          </Button>
        )}
      </PageHero>

      <PageStats>
        <StatTile icon={Folder} label="Portfolio" value={metrics.total} tone="default" />
        <StatTile icon={TrendingUp} label="Progress" value={metrics.total > 0 ? `${Math.round(metrics.overallProgress / metrics.total)}%` : '0%'} tone="success" />
        <StatTile icon={CalendarClock} label="Due This Week" value={metrics.endingThisWeek} tone="warning" />
        <StatTile icon={AlertTriangle} label="At Risk" value={metrics.atRisk + metrics.overdue} tone={metrics.atRisk + metrics.overdue > 0 ? 'danger' : 'default'} />
      </PageStats>

      <PageToolbar>
        <FilterTabs filters={PROJECT_TABS} value={activeTab} onChange={setActiveTab} />
        <SearchPlugin value={globalFilter} onChange={setGlobalFilter} placeholder="Search projects..." className="w-full sm:w-72" />
      </PageToolbar>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-[var(--border-subtle)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock size={16} strokeWidth={1.5} className="text-[var(--accent)]" />
            <Heading level={4} className="text-sm font-semibold">Upcoming Deadlines</Heading>
          </div>
          <div className="space-y-2">
            {upcomingDeadlines.length === 0 ? (
              <Text variant="muted" size="sm" className="py-2">No upcoming deadlines scheduled.</Text>
            ) : (
              upcomingDeadlines.map(p => (
                <button key={p.id} onClick={() => navigate(`/app/projects/${p.id}`)} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-left">
                  <span className="text-sm font-medium truncate">{p.name}</span>
                  <span className="text-xs font-mono px-2 py-1 rounded-md bg-[var(--bg-subtle)]">{formatRelativeDate(p.dueDate)}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-[var(--border-subtle)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} strokeWidth={1.5} className="text-[var(--accent)]" />
            <Heading level={4} className="text-sm font-semibold">Risk Projects</Heading>
          </div>
          <div className="space-y-2">
            {atRiskProjects.length === 0 ? (
              <Text variant="muted" size="sm" className="py-2">All active projects are currently healthy.</Text>
            ) : (
              atRiskProjects.map(p => (
                <button key={p.id} onClick={() => navigate(`/app/projects/${p.id}`)} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-left">
                  <div className="flex items-center gap-2 truncate">
                    <AlertTriangle size={14} className="text-yellow-500 shrink-0" />
                    <span className="text-sm font-medium truncate">{p.name}</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-[var(--text-muted)]">{p.progress}%</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <PageContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <PageEmptyState
            icon={AlertTriangle}
            title="Failed to load projects"
            description={error?.message || 'An unexpected error occurred.'}
            action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
          />
        ) : projects.length === 0 ? (
          <PageEmptyState
            moduleId="projects"
            icon={FolderKanban}
            action={canCreate ? <Button onClick={() => setIsCreateOpen(true)}>Create Project</Button> : null}
          />
        ) : activeTab !== 'ALL' && projects.length === 0 ? (
          <PageEmptyState
            icon={FolderKanban}
            title={`No ${activeTab.toLowerCase()} projects`}
            description="Try a different filter or create a new project."
            action={<Button variant="outline" onClick={() => setActiveTab('ALL')}>Show All</Button>}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </PageContent>

      <FloatingActions show={canCreate && projects.length > 3}>
        <Button
          size="lg"
          className="rounded-2xl shadow-lg shadow-[var(--accent)]/25"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus size={18} strokeWidth={1.5} />
          New Project
        </Button>
      </FloatingActions>

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
    </PageShell>
  );
}

function StatTile({ icon: Icon, label, value, tone = 'default' }) {
  const toneMap = {
    default: 'text-[var(--text-primary)]',
    success: 'text-[var(--success)]',
    warning: 'text-[var(--warning)]',
    danger: 'text-[var(--danger)]',
  };
  const bgMap = {
    default: 'bg-[var(--bg-subtle)]',
    success: 'bg-[var(--success-soft)]',
    warning: 'bg-[var(--warning-soft)]',
    danger: 'bg-[var(--danger-soft)]',
  };

  return (
    <motion.div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-border)] transition-colors">
      <div className={`${bgMap[tone]} w-9 h-9 rounded-lg flex items-center justify-center shrink-0`}>
        <Icon className={`${toneMap[tone]} w-4 h-4`} strokeWidth={1.5} />
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{label}</div>
        <div className="text-lg font-bold tabular-nums text-[var(--text-primary)]">{value}</div>
      </div>
    </motion.div>
  );
}
