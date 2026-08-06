import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { useAuth } from '@/identity';
import { usePermissions } from '@/identity/features/authentication/hooks/usePermissions';
import { useDrawerManager } from '@/shared/workspace-framework';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import {
  Sparkles, Zap, Target, Clock, ArrowRight, CheckCircle2,
  AlertTriangle, TrendingUp, Lightbulb, Brain, RefreshCw,
  FolderKanban, ListTodo, Users, Calendar, BarChart3
} from 'lucide-react';
import { ModeSelector } from '../features/ModeSelector';
import { WIDGET_REGISTRY } from '../config/WidgetRegistry';

/* ─── Stagger variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
};

/* ─── V2 Beautiful UI Components ─── */

function StatMini({ icon: Icon, label, value, tone = 'default', onClick }) {
  const toneMap = {
    default: 'text-[var(--text-primary)]',
    accent: 'text-[var(--accent)]',
    success: 'text-[var(--success)]',
    warning: 'text-[var(--warning)]',
    danger: 'text-[var(--danger)]',
  };
  const bgMap = {
    default: 'bg-[var(--bg-subtle)]',
    accent: 'bg-[var(--accent-soft)]',
    success: 'bg-[var(--success-soft)]',
    warning: 'bg-[var(--warning-soft)]',
    danger: 'bg-[var(--danger-soft)]',
  };
  return (
    <motion.button
      variants={itemVariants}
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:shadow-sm hover:-translate-y-[1px] transition-all duration-200 cursor-pointer text-left w-full"
    >
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", bgMap[tone])}>
        <Icon className={cn("w-4 h-4", toneMap[tone])} strokeWidth={1.5} />
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{label}</div>
        <div className={cn("text-lg font-bold tabular-nums", toneMap[tone])}>{value}</div>
      </div>
    </motion.button>
  );
}

function FocusCardWidget({ focusTask, workspaceMode, activeCrew }) {
  const { open } = useDrawerManager();
  if (!focusTask) return (
    <motion.div variants={itemVariants} className="w-full p-8 rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-subtle)]/50 text-center">
      <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-[var(--text-tertiary)]" strokeWidth={1.5} />
      <p className="text-sm font-medium text-[var(--text-secondary)]">All clear. No focus items require attention.</p>
      <p className="text-xs text-[var(--text-tertiary)] mt-1">Take a moment, or jump into your task queue.</p>
    </motion.div>
  );

  return (
    <motion.div
      variants={itemVariants}
      onClick={() => open('task', { taskId: focusTask.id })}
      className="w-full group relative p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:shadow-lg cursor-pointer transition-all duration-300 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--accent)]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-center justify-between gap-4">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="primary" className="text-[10px]">Focus</Badge>
            {workspaceMode === 'CREWS' && activeCrew && (
              <span className="text-[11px] font-medium text-[var(--text-tertiary)]">· {activeCrew.name}</span>
            )}
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] line-clamp-1">{focusTask.title}</h3>
          <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
            {focusTask.status && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />{focusTask.status}</span>}
            {focusTask.project && <span>· {focusTask.project.name}</span>}
            {focusTask.dueDate && <span className="flex items-center gap-1"><Clock size={12} />{focusTask.dueDate}</span>}
          </div>
        </div>
        <Button size="sm" className="rounded-full group-hover:shadow-[0_0_16px_var(--accent)] transition-shadow">
          Continue <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
}

function QuickActionBar({ workspaceMode }) {
  const navigate = useNavigate();
  const actions = {
    PERSONAL: [
      { icon: ListTodo, label: 'Create Task', to: '/app/tasks', shortcut: 'T' },
      { icon: FolderKanban, label: 'New Project', to: '/app/projects', shortcut: 'P' },
      { icon: Zap, label: 'Focus Mode', to: '/app/focus', shortcut: 'F' },
    ],
    CREWS: [
      { icon: ListTodo, label: 'Create Task', to: '/app/crews/tasks', shortcut: 'T' },
      { icon: FolderKanban, label: 'New Project', to: '/app/projects', shortcut: 'P' },
      { icon: Users, label: 'Discover Crews', to: '/app/crews/discover', shortcut: 'D' },
    ],
    ORG: [
      { icon: ListTodo, label: 'Create Task', to: '/app/tasks', shortcut: 'T' },
      { icon: Users, label: 'Invite Member', to: '/app/directory', shortcut: 'I' },
      { icon: BarChart3, label: 'View Reports', to: '/app/analytics', shortcut: 'R' },
    ],
  };

  return (
    <motion.div variants={itemVariants} className="flex items-center gap-2 flex-wrap mb-4">
      {(actions[workspaceMode] || actions.PERSONAL).map(a => (
        <Button
          key={a.label}
          variant="secondary"
          size="sm"
          onClick={() => navigate(a.to)}
          className="h-9 gap-2 text-[12px] rounded-xl border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:shadow-sm group"
        >
          <a.icon size={14} strokeWidth={1.5} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
          {a.label}
          <kbd className="ml-1 text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-tertiary)] font-mono hidden sm:inline">{a.shortcut}</kbd>
        </Button>
      ))}
    </motion.div>
  );
}

function ActivityCard({ recentActivities = [] }) {
  const activities = recentActivities;
  if (!activities || activities.length === 0) {
    return (
      <motion.div variants={itemVariants} className="w-full p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} strokeWidth={1.5} className="text-[var(--accent)]" />
          <h3 className="text-[13px] font-semibold">Recent Activity</h3>
        </div>
        <div className="text-center py-6">
          <Sparkles className="w-6 h-6 mx-auto mb-2 text-[var(--text-tertiary)]" strokeWidth={1.5} />
          <p className="text-xs text-[var(--text-tertiary)]">No recent activity to show.</p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Start working on tasks to see your activity feed.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants} className="w-full p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} strokeWidth={1.5} className="text-[var(--accent)]" />
          <h3 className="text-[13px] font-semibold">Recent Activity</h3>
        </div>
        <Badge variant="secondary" className="text-[10px]">{activities.length} updates</Badge>
      </div>
      <div className="space-y-1">
        {activities.slice(0, 5).map((a, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center shrink-0">
              {a.icon || <Clock size={14} strokeWidth={1.5} className="text-[var(--text-tertiary)]" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-[var(--text-primary)] truncate">{a.title}</p>
              <p className="text-[11px] text-[var(--text-tertiary)]">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AICopilotBlock() {
  return (
    <motion.div variants={itemVariants} className="w-full p-5 rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--accent-soft)]/5">
      <div className="flex items-center gap-2 mb-3">
        <Brain size={16} strokeWidth={1.5} className="text-[var(--accent)]" />
        <h3 className="text-[13px] font-semibold">AI Insights</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[var(--bg-subtle)]/50">
          <Lightbulb size={14} strokeWidth={1.5} className="text-[var(--warning)] shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] font-medium text-[var(--text-primary)]">Suggested focus</p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">"API Integration" has been in review for 5 days and is blocking 2 other tasks.</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[var(--bg-subtle)]/50">
          <TrendingUp size={14} strokeWidth={1.5} className="text-[var(--success)] shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] font-medium text-[var(--text-primary)]">Productivity trend</p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">You're 40% above your 4-week average this week. Great momentum!</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function UpcomingBlock({ upcomingDeadlines = [] }) {
  return (
    <motion.div variants={itemVariants} className="w-full p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={16} strokeWidth={1.5} className="text-[var(--accent)]" />
        <h3 className="text-[13px] font-semibold">Upcoming</h3>
      </div>
      <div className="space-y-2">
        {(!upcomingDeadlines || upcomingDeadlines.length === 0) ? (
          <p className="text-xs text-[var(--text-tertiary)] py-2">No upcoming deadlines. Nice!</p>
        ) : (
          upcomingDeadlines.slice(0, 3).map((d, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer">
              <span className="text-[12px] font-medium truncate">{d.title}</span>
              <span className="text-[11px] text-[var(--text-tertiary)] tabular-nums shrink-0 ml-2">{d.date}</span>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function StatsGrid({ activeTaskCount, completedTaskCount, dueSoonCount, teamSize }) {
  const navigate = useNavigate();
  return (
    <motion.div variants={itemVariants} className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatMini icon={ListTodo} label="Active Tasks" value={activeTaskCount ?? 0} tone="accent" onClick={() => navigate('/app/tasks')} />
      <StatMini icon={CheckCircle2} label="Completed" value={completedTaskCount ?? 0} tone="success" onClick={() => navigate('/app/tasks')} />
      <StatMini icon={AlertTriangle} label="Due Soon" value={dueSoonCount ?? 0} tone="warning" />
      <StatMini icon={Users} label="Team" value={teamSize ?? 0} tone="default" onClick={() => navigate('/app/teams')} />
    </motion.div>
  );
}

/* ─── V2 Widget Map ─── */
const V2_WIDGET_COMPONENTS = {
  SignalStrip: QuickActionBar,
  ExecutionQueue: ActivityCard,
  FocusPanel: FocusCardWidget,
  WorkloadBrief: StatsGrid,
  PersonalContextRail: UpcomingBlock,
  CrewContextRail: UpcomingBlock,
  OrgContextRail: UpcomingBlock,
  DailyBriefWidget: () => null, // Omitted in V2 aesthetic
  AICopilotPanel: AICopilotBlock
};

/* ═══════════════════════════════════════════════ */
export function MissionControlV2(vm) {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { workspaceMode, activeCrew, activeOrganization } = useWorkspace();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getHeaderConfig = () => {
    switch (workspaceMode) {
      case 'CREWS':
        return {
          eyebrow: activeCrew ? `Crew · ${activeCrew.name}` : 'Crew Space',
          title: `${getGreeting()}, ${user?.name?.split(' ')[0] || user?.username || ''}`,
          subtitle: activeCrew
            ? `Executing with ${activeCrew.name}. Stay in sync with your crew.`
            : 'Select a crew from the sidebar to get started.',
        };
      case 'ORG':
        return {
          eyebrow: activeOrganization ? `Organization · ${activeOrganization.name}` : 'Organization Space',
          title: 'Mission Control',
          subtitle: activeOrganization
            ? `Organization-wide overview for ${activeOrganization.name}.`
            : 'Organization-wide execution context.',
        };
      default:
        return {
          eyebrow: 'Personal Space',
          title: `${getGreeting()}, ${user?.name?.split(' ')[0] || user?.username || ''}`,
          subtitle: 'Your private execution space. Focus on what matters.',
        };
    }
  };

  const headerConfig = getHeaderConfig();

  const activeRegistry = WIDGET_REGISTRY.filter(widget => 
    widget.workspaceModes.includes(workspaceMode) && widget.visible
  );

  const renderWidgets = (placement) => {
    return activeRegistry
      .filter((widget) => widget.placement === placement)
      .sort((a, b) => a.order - b.order)
      .filter((widget) => {
        if (!widget.requiredPermissions || widget.requiredPermissions.length === 0) return true;
        return widget.requiredPermissions.every((perm) => can(perm));
      })
      .map((widget) => {
        const Component = V2_WIDGET_COMPONENTS[widget.component];
        if (!Component) return null;
        return <Component key={widget.id} {...vm} workspaceMode={workspaceMode} activeCrew={activeCrew} />;
      });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-6xl mx-auto px-2 pb-8"
    >
      {/* ── Dynamic Header ── */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1 w-full justify-between sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-wider">{headerConfig.eyebrow}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {headerConfig.title}
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)]">{headerConfig.subtitle}</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <ModeSelector />
        </div>
      </motion.div>

      {/* ── Dynamic Layout Grid ── */}
      {renderWidgets('header')}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {renderWidgets('primary')}
        </div>
        <div className="space-y-6">
          {renderWidgets('context')}
        </div>
      </div>
    </motion.div>
  );
}
