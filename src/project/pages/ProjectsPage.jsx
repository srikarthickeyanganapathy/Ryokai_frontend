import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { useProjects, useCreateProject } from '../features/hooks/useProjects';
import { usePermissions } from '@/identity';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { ProjectForm } from '../components/ProjectForm';
import { CreateFromGithubModal } from '../components/CreateFromGithubModal';
import { useOrgTeams } from '@/organization';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { PageShell, PageHero, PageContent, PageEmptyState, FloatingActions } from '@/shared/ui/PageShell';
import { SearchPlugin } from '@/shared/workspace-framework';
import { getPortfolioMetrics, calculateHealthScore, getHealthStatus, formatRelativeDate } from '../features/utils/projectUtils';
import { cn } from '@/shared/lib/cn';
import { EntityCard, EntityStatStrip, EntityFilterBar } from '@/shared/ui/entity-card';
import { CheckSquare, CalendarClock, ExternalLink, FolderKanban, Plus, TrendingUp, AlertTriangle, Folder, Activity, Github } from 'lucide-react';

function AnimatedCounter({ value, duration = 0.8 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let raf
    const start = performance.now()
    const from = display
    const tick = (now) => {
      const p = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return <>{typeof value === 'string' && value.includes('%') ? value : display.toLocaleString()}</>
}

const HEALTH_BADGE = {
  success: 'ec-badge--emerald',
  accent: 'ec-badge--accent',
  warning: 'ec-badge--amber',
  danger: 'ec-badge--rose',
}

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
  const [isGithubCreateOpen, setIsGithubCreateOpen] = useState(false);
  const navigate = useNavigate();

  const { workspaceMode, activeOrganization, activeCrew } = useWorkspace();
  const { canCreateProject } = usePermissions();
  const canCreate = workspaceMode === 'PERSONAL' || workspaceMode === 'CREWS' || canCreateProject;

  // Debounce search input to avoid per-keystroke API requests
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilter(globalFilter), 300);
    return () => clearTimeout(timer);
  }, [globalFilter]);

  // Scope the backend query to the active workspace (the backend no longer
  // mixes personal + org + crew projects into one response).
  const scopeParams = React.useMemo(() => {
    if (workspaceMode === 'ORG' && activeOrganization?.id) return { orgId: activeOrganization.id };
    if (workspaceMode === 'CREWS' && activeCrew?.id) return { crewId: activeCrew.id };
    if (workspaceMode === 'CREWS') return { scope: 'CREWS' };
    return {};
  }, [workspaceMode, activeOrganization, activeCrew]);

  const { data: allProjects = [], isLoading, isError, error, refetch } = useProjects({ search: debouncedFilter, ...scopeParams });
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

  const statusCounts = useMemo(() => ({
    ALL: projects.length,
    ACTIVE: projects.filter(p => p.status !== 'COMPLETED' && p.status !== 'ARCHIVED').length,
    COMPLETED: projects.filter(p => p.status === 'COMPLETED').length,
    ARCHIVED: projects.filter(p => p.status === 'ARCHIVED').length,
  }), [projects]);

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

  const openDrawer = (p) => {
    // Progressive disclosure: quick peek via drawer (unchanged contract)
    const event = new CustomEvent('open-project-drawer', {
      detail: {
        id: p.id, name: p.name, description: p.description, status: p.status, progress: p.progress,
        taskCount: p.tasksTotal, completedCount: p.tasksCompleted,
        dueDate: p.dueDate, teamName: p.teamName, organizationName: p.organizationName
      }
    })
    window.dispatchEvent(event)
  }

  const atRiskTotal = metrics.atRisk + metrics.overdue;

  return (
    <PageShell workspaceMode={workspaceMode} maxWidth="default">
      <PageHero
        title="Project Directory"
        subtitle="Manage strategic initiatives, track timelines, and supervise milestones."
        eyebrow="Projects"
        icon={FolderKanban}
      >
        {canCreate && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="shrink-0 gap-1.5" onClick={() => setIsGithubCreateOpen(true)}>
              <Github size={14} strokeWidth={1.5} />
              From GitHub
            </Button>
            <Button size="sm" className="shrink-0 gap-1.5 shadow-sm" onClick={() => setIsCreateOpen(true)}>
              <Plus size={14} strokeWidth={1.5} />
              New Project
            </Button>
          </div>
        )}
      </PageHero>

      <EntityStatStrip
        stats={[
          { key: 'portfolio', label: 'Portfolio', value: <AnimatedCounter value={metrics.total} />, sublabel: 'Projects in scope', icon: Folder, tone: 'cyan' },
          { key: 'progress', label: 'Progress', value: metrics.total > 0 ? `${Math.round(metrics.overallProgress / metrics.total)}%` : '0%', sublabel: 'Across all projects', icon: TrendingUp, tone: 'emerald' },
          { key: 'due', label: 'Due This Week', value: <AnimatedCounter value={metrics.endingThisWeek} />, sublabel: 'Deadlines closing in', icon: CalendarClock, tone: 'amber' },
          { key: 'risk', label: 'At Risk', value: <AnimatedCounter value={atRiskTotal} />, sublabel: atRiskTotal > 0 ? 'Needs attention' : 'All healthy', icon: AlertTriangle, tone: 'rose' },
        ]}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 ec-panel">
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

        <div className="ec-panel">
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

      <EntityFilterBar
        searchSlot={
          <SearchPlugin value={globalFilter} onChange={setGlobalFilter} placeholder="Search projects..." className="w-full sm:w-72" />
        }
        chips={PROJECT_TABS.map(tab => ({ id: tab.value, label: tab.label, count: statusCounts[tab.value] }))}
        activeChip={activeTab}
        onChip={setActiveTab}
      />

      <PageContent>
        {isLoading ? (
          <div className="ec-grid">
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
          <div className="ec-grid">
            {projects.map(project => {
              const healthScore = calculateHealthScore(project)
              const health = getHealthStatus(healthScore)
              const tasksLeft = (project.tasksTotal || 0) - (project.tasksCompleted || 0)
              const formattedDueDate = formatRelativeDate(project.dueDate)
              const isOverdue = formattedDueDate.includes('Overdue')
              return (
                <EntityCard
                  key={project.id}
                  type="project"
                  name={project.name}
                  tagline={project.description || 'No description provided.'}
                  showArrow
                  onClick={() => openDrawer(project)}
                  badges={[
                    <span key="health" className={cn('ec-badge', HEALTH_BADGE[health.tone] || 'ec-badge--accent')}>
                      <span className="ec-dot" />
                      {health.label} {healthScore}
                    </span>,
                    <span key="status" className={cn('ec-badge', project.status === 'COMPLETED' ? 'ec-badge--emerald' : project.status === 'ARCHIVED' ? 'ec-badge--ghost' : 'ec-badge--accent')}>
                      <span className="ec-dot" />
                      {project.status || 'ACTIVE'}
                    </span>,
                  ]}
                  actions={
                    <button
                      type="button"
                      className="ec-kebab"
                      title="Open full project"
                      aria-label="Open full project"
                      onClick={(e) => { e.stopPropagation(); navigate(`/app/projects/${project.id}`) }}
                    >
                      <ExternalLink size={14} />
                    </button>
                  }
                  meta={[
                    { icon: <CheckSquare />, text: `${project.tasksCompleted || 0}/${project.tasksTotal || 0} tasks${tasksLeft > 0 ? ` · ${tasksLeft} left` : ''}` },
                    ...(project.dueDate ? [{ icon: <CalendarClock />, text: formattedDueDate }] : []),
                  ]}
                  progress={project.progress || 0}
                  progressLabel={isOverdue ? `${formattedDueDate} · ${Math.round(project.progress || 0)}%` : `${Math.round(project.progress || 0)}%`}
                />
              )
            })}
          </div>
        )}
      </PageContent>



      {/* Create Project Modal */}
      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ModalContent className="sm:max-w-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl rounded-2xl p-6">
          <Heading level={3} className="text-[15px] font-bold text-[var(--text-primary)] mb-4">New Project</Heading>
          <ProjectForm
            onSubmit={handleCreateProject}
            isLoading={createProjectMutation.isPending}
            workspaceMode={workspaceMode}
            useOrgTeamsHook={useOrgTeams}
            defaultValues={workspaceMode === 'ORG' && activeOrganization?.id ? { organizationId: String(activeOrganization.id) } : undefined}
            />
        </ModalContent>
      </Modal>
      {isGithubCreateOpen && <CreateFromGithubModal open={isGithubCreateOpen} onOpenChange={setIsGithubCreateOpen} />}
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


    </PageShell>
  );
}
