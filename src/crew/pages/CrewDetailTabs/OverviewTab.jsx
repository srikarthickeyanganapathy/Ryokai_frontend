import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import { ProgressBar } from '../../components/CrewShared';
import {
  ListTodo,
  Pencil,
  Plus,
  MessageSquare,
  Folder,
  Users,
  TrendingUp,
  Activity,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
  PlayCircle,
  ChevronRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  Zap,
  Target,
  Layers,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';

// Helper function to format relative timestamps
function formatTimeAgo(dateString) {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently';
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// -----------------------------------------------------------------------------
// Component: Velocity Sparkline Chart (SVG)
// -----------------------------------------------------------------------------
function VelocitySparkline({ data = [4, 6, 5, 8, 7, 10, 12] }) {
  const width = 240;
  const height = 54;
  const padding = 6;
  const minVal = Math.min(...data, 0);
  const maxVal = Math.max(...data, 1);

  const points = useMemo(() => {
    return data.map((val, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - minVal) / (maxVal - minVal || 1)) * (height - padding * 2);
      return { x, y, val };
    });
  }, [data, minVal, maxVal]);

  const pathD = useMemo(() => {
    if (points.length < 2) return '';
    return points.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      const prev = points[i - 1];
      const cx = (prev.x + point.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${point.y}, ${point.x} ${point.y}`;
    }, '');
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length < 2) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `${pathD} L ${last.x} ${height} L ${first.x} ${height} Z`;
  }, [pathD, points]);

  const lastPoint = points[points.length - 1] || { x: width - padding, y: height / 2 };

  return (
    <div className="relative w-full h-[60px] overflow-hidden">
      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Fill under line */}
        <path d={areaD} fill="url(#velocityGradient)" />

        {/* Sparkline curve */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Peak indicator point */}
        <circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill="var(--accent)" />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="7" fill="var(--accent)" opacity="0.25" className="animate-ping" />
      </svg>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Component: Crew Health Gauge Meter (SVG Radial)
// -----------------------------------------------------------------------------
function CrewHealthGauge({ healthScore = 94 }) {
  const radius = 38;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, healthScore));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const tone = healthScore >= 80 ? 'success' : healthScore >= 50 ? 'warning' : 'danger';
  const strokeColor = tone === 'success' ? 'var(--success)' : tone === 'warning' ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="var(--bg-subtle)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-extrabold tracking-tight tabular-nums text-[var(--text-primary)]">
            {healthScore}%
          </span>
          <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
            Health
          </span>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sub-component: Skeleton Shimmer (Loading State)
// -----------------------------------------------------------------------------
function OverviewSkeleton() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-44 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] p-6 space-y-4" />
      
      {/* Bento Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-80 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]" />
        <div className="lg:col-span-4 h-80 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]" />
        <div className="lg:col-span-8 h-72 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]" />
        <div className="lg:col-span-4 h-72 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]" />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sub-component: Error State Card
// -----------------------------------------------------------------------------
function OverviewErrorState({ error, onRetry }) {
  return (
    <div className="p-8 max-w-2xl mx-auto my-12 text-center bg-[var(--bg-card)] border border-[var(--danger-soft)] rounded-2xl shadow-sm space-y-4">
      <div className="w-12 h-12 rounded-full bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <Heading level={3} className="text-lg font-semibold">Unable to load Crew Overview</Heading>
      <Text variant="muted" size="sm" className="max-w-md mx-auto">
        {error?.message || 'An unexpected error occurred while fetching operational metrics for this crew.'}
      </Text>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 mt-2">
          <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
        </Button>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main Component: OverviewTab
// -----------------------------------------------------------------------------
export function OverviewTab({
  crew,
  members = [],
  sharedProjects = [],
  crewTasks = [],
  channels = [],
  completionRate = 0,
  setActiveTab,
  isCreator,
  isLoading = false,
  isError = false,
  error = null,
  onRetry = null,
  isFetching = false
}) {
  // Render Loading Skeleton (State 1)
  if (isLoading) {
    return <OverviewSkeleton />;
  }

  // Render Error State (State 2)
  if (isError) {
    return <OverviewErrorState error={error} onRetry={onRetry} />;
  }

  // Derived Task Metrics
  const totalTasks = crewTasks.length;
  const activeTasks = useMemo(() => {
    return crewTasks.filter(t => {
      const status = String(t.status || '').toUpperCase();
      return status === 'IN_PROGRESS' || status === 'IN_REVIEW' || status === 'DOING' || status === 'REVIEW' || status === 'IN PROGRESS';
    });
  }, [crewTasks]);

  const doneTasksCount = useMemo(() => {
    return crewTasks.filter(t => {
      const status = String(t.status || '').toUpperCase();
      return status === 'DONE' || status === 'COMPLETED';
    }).length;
  }, [crewTasks]);

  const openTasksCount = totalTasks - doneTasksCount;

  // Global Empty State Check (State 3)
  const isCrewEmpty = totalTasks === 0 && sharedProjects.length === 0 && channels.length === 0;

  // Health Score Calculation (Dynamic metric)
  const healthScore = useMemo(() => {
    if (isCrewEmpty) return 100;
    const taskRate = totalTasks > 0 ? (doneTasksCount / totalTasks) * 50 : 30;
    const memberRate = Math.min(50, (members.length / (crew?.memberCap || 10)) * 50);
    return Math.round(taskRate + memberRate);
  }, [totalTasks, doneTasksCount, members.length, crew?.memberCap, isCrewEmpty]);

  // Derived Unified Activity Feed
  const activityFeed = useMemo(() => {
    const events = [];

    // Task events
    crewTasks.forEach(task => {
      events.push({
        id: `task-${task.id || task.title}`,
        type: 'task',
        title: task.title,
        status: task.status || 'TODO',
        timestamp: task.updatedAt || task.createdAt || Date.now(),
        actor: task.assignee?.username || task.assignedTo || 'Squad Member',
        icon: ListTodo,
        badgeVariant: task.status === 'COMPLETED' || task.status === 'Done' ? 'success' : 'primary'
      });
    });

    // Project events
    sharedProjects.forEach(proj => {
      events.push({
        id: `proj-${proj.id || proj.name}`,
        type: 'project',
        title: `Project "${proj.name || proj.title}" linked`,
        status: 'Linked',
        timestamp: proj.createdAt || Date.now(),
        actor: 'Squad Owner',
        icon: Folder,
        badgeVariant: 'secondary'
      });
    });

    // Channel events
    channels.forEach(ch => {
      events.push({
        id: `chan-${ch.id || ch.name}`,
        type: 'channel',
        title: `Channel #${ch.name} operational`,
        status: 'Active',
        timestamp: ch.createdAt || Date.now(),
        actor: 'System',
        icon: MessageSquare,
        badgeVariant: 'default'
      });
    });

    // Sort descending by date
    return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 6);
  }, [crewTasks, sharedProjects, channels]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* ----------------------------------------------------------------- */}
      {/* Header Operational Sync Status Bar (State 6: Revalidating indicator) */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--success)]"></span>
          </div>
          <span className="text-[12px] font-medium text-[var(--text-secondary)] tracking-tight">
            {isFetching ? 'Synchronizing Operational Feed...' : 'Live Crew Workspace Operational'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] font-mono">
          <span>Sprint Goal Active</span>
          <span className="text-[var(--border-default)]">•</span>
          <span>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* HERO BANNER: Today's Mission (Requirement 1)                      */}
      {/* ----------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--bg-elevated)] via-[var(--bg-card)] to-[var(--bg-subtle)] border border-[var(--border-default)] p-6 sm:p-8 shadow-[var(--shadow-sm)]">
        {/* Subtle mesh background accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[var(--accent)]/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="primary" size="sm" className="gap-1 font-semibold uppercase tracking-wider text-[10px]">
                <Target className="w-3 h-3" /> Today's Mission
              </Badge>
              <Badge variant="outline" size="sm" className="text-[11px] font-mono text-[var(--text-muted)] border-[var(--border-subtle)]">
                {crew?.name || 'Crew Operations'}
              </Badge>
              {healthScore >= 80 && (
                <Badge variant="success" size="sm" className="gap-1 text-[10px]">
                  <Sparkles className="w-3 h-3" /> Target Ahead
                </Badge>
              )}
            </div>

            <div>
              <Heading level={2} className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                {crew?.name ? `${crew.name} Dashboard` : 'Squad Operations Center'}
              </Heading>
              <Text size="sm" className="text-[var(--text-secondary)] mt-1 line-clamp-2">
                {crew?.description || 'Execute sprint tasks, collaborate in channels, and monitor squad velocity in real time.'}
              </Text>
            </div>

            {/* Mission Progress Meter */}
            <div className="pt-2 max-w-md space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[var(--accent)]" /> Mission Progress
                </span>
                <span className="font-semibold tabular-nums text-[var(--text-primary)]">
                  {completionRate}% <span className="text-[var(--text-muted)] font-normal">({doneTasksCount}/{totalTasks || 1} Done)</span>
                </span>
              </div>
              <ProgressBar value={completionRate} max={100} barClassName="bg-[var(--accent)] h-2" />
            </div>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
            <Button
              variant="primary"
              size="md"
              className="gap-2 justify-center shadow-md font-semibold text-[13px] flex-1 lg:flex-none"
              onClick={() => setActiveTab('tasks')}
            >
              <Plus className="w-4 h-4" /> Add Task
            </Button>
            <div className="flex gap-2 w-full lg:w-auto">
              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5 justify-center text-[12px] flex-1"
                onClick={() => setActiveTab('channels')}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[var(--accent)]" /> Chat
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5 justify-center text-[12px] flex-1"
                onClick={() => setActiveTab('whiteboards')}
              >
                <Pencil className="w-3.5 h-3.5 text-[var(--warning)]" /> Board
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* GLOBAL EMPTY STATE (State 3: New Crew Onboarding)                  */}
      {/* ----------------------------------------------------------------- */}
      {isCrewEmpty && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-card)] border border-dashed border-[var(--border-default)] rounded-2xl p-8 text-center space-y-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <Heading level={3} className="text-lg font-bold">Welcome to {crew?.name || 'your new Crew'}!</Heading>
            <Text size="sm" variant="muted">
              Get started by creating your crew's first task, opening a discussion channel, or linking a shared project.
            </Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-2">
            <div
              onClick={() => setActiveTab('tasks')}
              className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] hover:border-[var(--accent)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ListTodo className="w-4 h-4" />
              </div>
              <div className="font-semibold text-[13px] text-[var(--text-primary)]">1. Create First Task</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">Assign work to squad members</div>
            </div>

            <div
              onClick={() => setActiveTab('channels')}
              className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] hover:border-[var(--accent)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="font-semibold text-[13px] text-[var(--text-primary)]">2. Open Channel</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">Start real-time squad chat</div>
            </div>

            <div
              onClick={() => setActiveTab('projects')}
              className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] hover:border-[var(--accent)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Folder className="w-4 h-4" />
              </div>
              <div className="font-semibold text-[13px] text-[var(--text-primary)]">3. Link Project</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">Connect team project workspace</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MAIN BENTO GRID (Requirement 6: Fully Responsive Desktop/Tablet/Mobile) */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

        {/* --------------------------------------------------------------- */}
        {/* CARD 1: ACTIVE WORK CARDS (Requirement 2, lg:col-span-8)         */}
        {/* --------------------------------------------------------------- */}
        <div className="lg:col-span-8 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-xs">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <Heading level={4} className="text-[15px] font-bold tracking-tight">Active Work</Heading>
                <Text size="xs" variant="muted">Assigned tasks currently in progress or review</Text>
              </div>
            </div>
            <Badge variant="primary" size="sm" className="tabular-nums font-semibold">
              {activeTasks.length} Active
            </Badge>
          </div>

          {/* Active Work Task List */}
          {activeTasks.length === 0 ? (
            /* STATE 4: Partial Active Work Empty State */
            <div className="py-8 px-4 text-center bg-[var(--bg-subtle)]/40 rounded-xl border border-dashed border-[var(--border-subtle)] space-y-3">
              <CheckCircle2 className="w-8 h-8 text-[var(--success)] mx-auto opacity-80" />
              <div className="space-y-1">
                <Text size="sm" className="font-semibold text-[var(--text-primary)]">No tasks currently in progress</Text>
                <Text size="xs" variant="muted">All assigned sprint items are completed or in backlog.</Text>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 mt-2 text-[12px]"
                onClick={() => setActiveTab('tasks')}
              >
                <Plus className="w-3 h-3" /> Start New Task
              </Button>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {activeTasks.slice(0, 4).map(task => {
                const isReview = String(task.status).toUpperCase().includes('REVIEW');
                const priority = String(task.priority || 'MEDIUM').toUpperCase();

                return (
                  <div
                    key={task.id || task.title}
                    onClick={() => setActiveTab('tasks')}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-subtle)]/60 hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1 pr-3">
                      <div className={`w-2 h-10 rounded-full shrink-0 mt-0.5 ${isReview ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]'}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[13px] text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] mt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-[var(--text-tertiary)]" /> {formatTimeAgo(task.updatedAt || task.createdAt)}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{task.assignee?.username || 'Assigned to Squad'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={priority === 'HIGH' || priority === 'URGENT' ? 'danger' : 'default'}
                        size="xs"
                        className="uppercase text-[9px] font-mono tracking-wider"
                      >
                        {priority}
                      </Badge>
                      <Badge
                        variant={isReview ? 'warning' : 'primary'}
                        size="sm"
                        className="text-[10px] font-medium"
                      >
                        {isReview ? 'In Review' : 'In Progress'}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)]">
              Showing top active tasks out of {totalTasks} total
            </span>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-[12px] font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              View Task Board <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* CARD 2: VELOCITY SPARKLINE & HEALTH GAUGE (Req 4, lg:col-span-4)   */}
        {/* --------------------------------------------------------------- */}
        <div className="lg:col-span-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--accent)]" />
              <Heading level={4} className="text-[15px] font-bold tracking-tight">Crew Velocity & Health</Heading>
            </div>
            <Badge variant="success" size="xs" className="gap-1 font-mono">
              <TrendingUp className="w-3 h-3" /> {completionRate}% Complete
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center py-1">
            {/* Health Gauge Meter */}
            <div className="flex flex-col items-center border-r border-[var(--border-subtle)] pr-2">
              <CrewHealthGauge healthScore={healthScore} />
              <span className="text-[11px] font-medium text-[var(--text-secondary)] mt-2 text-center">
                {healthScore >= 80 ? 'Optimal Performance' : healthScore >= 50 ? 'Healthy Pace' : 'Needs Action'}
              </span>
            </div>

            {/* Velocity Metrics */}
            <div className="space-y-3">
              <div>
                <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">
                  Completed Tasks
                </div>
                <div className="text-lg font-extrabold text-[var(--text-primary)] tabular-nums">
                  {doneTasksCount} <span className="text-xs font-normal text-[var(--text-muted)]">/ {totalTasks} total</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">
                  Completion Rate
                </div>
                <div className="text-sm font-bold text-[var(--success)] tabular-nums">
                  {completionRate}%
                </div>
              </div>
            </div>
          </div>

          {/* Velocity Sparkline SVG Chart */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1">
              <span>Velocity Trend</span>
              <span className="font-mono text-[var(--accent)] font-semibold">Done: {doneTasksCount}</span>
            </div>
            <VelocitySparkline data={[0, Math.round(totalTasks * 0.2), Math.round(totalTasks * 0.4), Math.round(totalTasks * 0.6), doneTasksCount]} />
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* CARD 3: ACTIVITY TIMELINE FEED (Requirement 3, lg:col-span-8)    */}
        {/* --------------------------------------------------------------- */}
        <div className="lg:col-span-8 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent)]" />
              <Heading level={4} className="text-[15px] font-bold tracking-tight">Activity Timeline</Heading>
            </div>
            <Badge variant="outline" size="sm" className="text-[10px] text-[var(--text-muted)]">
              Realtime Stream
            </Badge>
          </div>

          {activityFeed.length === 0 ? (
            /* STATE 5: Partial Timeline Empty State */
            <div className="py-8 text-center bg-[var(--bg-subtle)]/30 rounded-xl border border-dashed border-[var(--border-subtle)]">
              <Text size="xs" variant="muted">No recent activity events recorded in this crew.</Text>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-subtle)]">
              {activityFeed.map((event, idx) => {
                const IconComponent = event.icon || Activity;

                return (
                  <div key={event.id || idx} className="relative flex items-start gap-3 group">
                    {/* Node Dot */}
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[var(--bg-card)] border-2 border-[var(--accent)] flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                    </div>

                    <div className="min-w-0 flex-1 bg-[var(--bg-subtle)]/40 p-3 rounded-xl border border-[var(--border-subtle)] group-hover:border-[var(--border-default)] transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                          {event.title}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">
                          {formatTimeAgo(event.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] mt-1">
                        <span>{event.actor}</span>
                        <span>•</span>
                        <Badge variant={event.badgeVariant || 'default'} size="xs" className="text-[9px]">
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --------------------------------------------------------------- */}
        {/* CARD 4: QUICK CONTINUE & SQUAD RAIL (Requirement 4, lg:col-span-4) */}
        {/* --------------------------------------------------------------- */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Jump Rail */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4">
            <Heading level={4} className="text-[14px] font-bold tracking-tight">Quick Action Shortcuts</Heading>
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 justify-start h-9 text-[12px] w-full"
                onClick={() => setActiveTab('tasks')}
              >
                <ListTodo className="w-3.5 h-3.5 text-[var(--accent)]" /> Task Board
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 justify-start h-9 text-[12px] w-full"
                onClick={() => setActiveTab('channels')}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[var(--success)]" /> Channels
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 justify-start h-9 text-[12px] w-full"
                onClick={() => setActiveTab('projects')}
              >
                <Folder className="w-3.5 h-3.5 text-[var(--warning)]" /> Projects
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 justify-start h-9 text-[12px] w-full"
                onClick={() => setActiveTab('whiteboards')}
              >
                <Pencil className="w-3.5 h-3.5 text-[var(--danger)]" /> Canvas
              </Button>
            </div>
          </div>

          {/* Squad Roster Snippet */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <Heading level={4} className="text-[14px] font-bold tracking-tight">Squad Roster</Heading>
              <button
                onClick={() => setActiveTab('members')}
                className="text-[11px] font-semibold text-[var(--accent)] hover:underline"
              >
                View All ({members.length}) →
              </button>
            </div>

            {members.length === 0 ? (
              <Text size="xs" variant="muted" className="italic">No squad members assigned.</Text>
            ) : (
              <div className="space-y-3">
                {members.slice(0, 4).map(m => {
                  const isOwner = m.role === 'CREATOR' || m.role === 'OWNER';

                  return (
                    <div key={m.userId || m.username} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white font-bold text-[11px] flex items-center justify-center shadow-sm">
                            {m.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--success)] border-2 border-[var(--bg-card)]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12px] font-semibold text-[var(--text-primary)] truncate">
                            @{m.username}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] capitalize">
                            {isOwner ? 'Squad Owner' : 'Squad Member'}
                          </div>
                        </div>
                      </div>
                      {isOwner && (
                        <Badge variant="primary" size="xs" className="text-[9px]">Owner</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

