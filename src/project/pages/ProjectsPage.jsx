import React, { useState, useMemo, useEffect } from 'react';
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
import { SearchPlugin } from '@/shared/workspace-framework';
import { getPortfolioMetrics, calculateHealthScore, formatRelativeDate } from '../features/utils/projectUtils';
import { cn } from '@/shared/lib/cn';
import {
  FolderKanban, Plus, TrendingUp, CalendarClock,
  AlertTriangle, Folder, Activity
} from 'lucide-react';

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

function StatKPI({ icon: Icon, label, value, sublabel, hue = 220 }) {
  const numericValue = typeof value === 'number' ? value : parseInt(value) || 0;
  const isPercent = typeof value === 'string' && value.endsWith('%');

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-xs)] transition-all duration-300 hover:border-[var(--border-default)] hover:shadow-[var(--shadow-sm)]">
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ background: `radial-gradient(circle at 90% -20%, hsl(${hue} 70% 55% / 0.4), transparent 60%)` }}
        aria-hidden="true"
      />
      <div className="relative flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">{label}</div>
          <div className="text-[24px] font-bold text-[var(--text-primary)] leading-none mt-2 tabular-nums">
            {isPercent ? value : <AnimatedCounter value={numericValue} />}
          </div>
          {sublabel && <div className="text-[11px] text-[var(--text-secondary)] mt-1.5 truncate">{sublabel}</div>}
        </div>
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
          style={{ background: `hsl(${hue} 60% 50% / 0.12)`, color: `hsl(${hue} 70% 60%)`, borderColor: `hsl(${hue} 60% 50% / 0.2)` }}
        >
          <Icon className="w-4 h-4" />
        </span>
      </div>
    </div>
  )
}

function CategoryChip({ label, count, isActive, onClick, hue = 230 }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        'relative px-4 py-2 rounded-xl text-[13px] font-medium transition-colors duration-200 whitespace-nowrap',
        isActive
          ? 'text-[var(--text-primary)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full tabular-nums',
          isActive ? 'bg-[var(--accent)]/12 text-[var(--accent)]' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
        )}
      >
        {count}
      </span>
      {isActive && (
        <motion.div
          layoutId="activeChip"
          className="absolute inset-0 bg-[var(--bg-subtle)] rounded-xl -z-10 border border-[var(--border-subtle)]"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </motion.button>
  )
}

const PROJECT_TABS = [
  { value: 'ALL', label: 'All', hue: 210 },
  { value: 'ACTIVE', label: 'Active', hue: 160 },
  { value: 'COMPLETED', label: 'Completed', hue: 260 },
  { value: 'ARCHIVED', label: 'Archived', hue: 40 },
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
        <StatKPI icon={Folder} label="Portfolio" value={metrics.total} sublabel="Projects in scope" hue={210} />
        <StatKPI icon={TrendingUp} label="Progress" value={metrics.total > 0 ? `${Math.round(metrics.overallProgress / metrics.total)}%` : '0%'} sublabel="Across all projects" hue={160} />
        <StatKPI icon={CalendarClock} label="Due This Week" value={metrics.endingThisWeek} sublabel="Deadlines closing in" hue={40} />
        <StatKPI icon={AlertTriangle} label="At Risk" value={metrics.atRisk + metrics.overdue} sublabel={metrics.atRisk + metrics.overdue > 0 ? 'Needs attention' : 'All healthy'} hue={metrics.atRisk + metrics.overdue > 0 ? 0 : 260} />
      </PageStats>

      <PageToolbar>
        <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-1 overflow-x-auto scrollbar-hide">
  {PROJECT_TABS.map(tab => (
    <CategoryChip key={tab.value} label={tab.label} count={statusCounts[tab.value]} isActive={activeTab === tab.value} onClick={() => setActiveTab(tab.value)} hue={tab.hue} />
  ))}
</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
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
