import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { useAuth } from '@/identity';
import { usePermissions } from '@/identity';
import { useDrawerManager } from '@/shared/workspace-framework';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import {
  Sparkles, Zap, Target, Clock, ArrowRight, CheckCircle2,
  AlertTriangle, TrendingUp, Lightbulb, Brain, RefreshCw,
  FolderKanban, ListTodo, Users, Calendar, BarChart3
} from 'lucide-react';
import { ModeSelector } from '../features/ModeSelector';
import { PersonalContextRail } from '../features/PersonalContextRail';
import { CrewContextRail } from '../features/CrewContextRail';
import { OrgContextRail } from '../features/OrgContextRail';

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
  const navigate = useNavigate();

  if (!focusTask) return (
    <motion.div variants={itemVariants} className="w-full p-6 rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-subtle)]/50 text-center">
      <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-[var(--text-tertiary)]" strokeWidth={1.5} />
      <p className="text-sm font-medium text-[var(--text-secondary)]">All clear. No focus items require attention.</p>
      <p className="text-xs text-[var(--text-tertiary)] mt-1">Take a moment, or create a new task to get started.</p>
      <Button size="sm" variant="secondary" onClick={() => navigate('/app/tasks')} className="mt-3 text-xs rounded-xl">
        Create Task
      </Button>
    </motion.div>
  );

  const rawStatus = focusTask.status || focusTask.currentStatus || 'IN_PROGRESS';
  const displayStatus = rawStatus.replace(/_/g, ' ').toLowerCase();

  return (
    <motion.div
      variants={itemVariants}
      onClick={() => open('task', { taskId: focusTask.id || focusTask.taskId })}
      className="w-full group relative p-6 rounded-2xl bg-gradient-to-br from-[var(--bg-elevated)] via-[var(--bg-elevated)] to-[var(--accent-soft)]/10 border border-[var(--accent-border)]/40 hover:border-[var(--accent)] shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[var(--accent)]/15 to-transparent rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="primary" className="text-[10px] tracking-wide uppercase px-2 py-0.5">Primary Focus</Badge>
            <Badge className="bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning)]/20 text-[10px] capitalize">
              {displayStatus}
            </Badge>
            {focusTask.crewName && (
              <span className="text-[11px] font-semibold text-violet-400">· Crew: {focusTask.crewName}</span>
            )}
            {workspaceMode === 'CREWS' && activeCrew && !focusTask.crewName && (
              <span className="text-[11px] font-medium text-[var(--text-tertiary)]">· Crew: {activeCrew.name}</span>
            )}
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
            {focusTask.title || focusTask.taskTitle || 'Current Task'}
          </h3>
          <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] flex-wrap">
            {focusTask.project?.name && <span>Project: {focusTask.project.name}</span>}
            {focusTask.priority && <span className="uppercase font-semibold text-[10px]">· Priority: {focusTask.priority}</span>}
            {focusTask.dueDate && <span className="flex items-center gap-1"><Clock size={12} />Due {new Date(focusTask.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
          </div>
        </div>
        <Button size="sm" className="rounded-full shrink-0 group-hover:shadow-[0_0_16px_var(--accent)] transition-shadow">
          Resume Work <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-0.5 transition-transform" />
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

function TaskQueueCard({ relevantTasks = [], workspaceMode, selectedCrewFilter, setSelectedCrewFilter, crews = [] }) {
  const { open } = useDrawerManager();
  const navigate = useNavigate();

  // Filter tasks if crew filter is active
  const filteredTasks = (workspaceMode === 'CREWS' && selectedCrewFilter && selectedCrewFilter !== 'ALL')
    ? relevantTasks.filter(t => (t.crewId === selectedCrewFilter || t.crewName === selectedCrewFilter))
    : relevantTasks;

  if (!filteredTasks || filteredTasks.length === 0) {
    return (
      <motion.div variants={itemVariants} className="w-full p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo size={16} strokeWidth={1.5} className="text-[var(--accent)]" />
            <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">Execution Queue</h3>
          </div>
        </div>

        {workspaceMode === 'CREWS' && crews.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pb-2 border-b border-[var(--border-subtle)]">
            <button
              onClick={() => setSelectedCrewFilter && setSelectedCrewFilter('ALL')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all",
                (!selectedCrewFilter || selectedCrewFilter === 'ALL')
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "bg-[var(--bg-subtle)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              )}
            >
              All Crews ({relevantTasks.length})
            </button>
            {crews.map(crew => (
              <button
                key={crew.id}
                onClick={() => setSelectedCrewFilter && setSelectedCrewFilter(crew.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all",
                  selectedCrewFilter === crew.id
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "bg-[var(--bg-subtle)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                )}
              >
                {crew.name}
              </button>
            ))}
          </div>
        )}

        <div className="text-center py-6">
          <CheckCircle2 className="w-7 h-7 mx-auto mb-2 text-[var(--text-tertiary)]" strokeWidth={1.5} />
          <p className="text-xs font-medium text-[var(--text-secondary)]">Queue is clear</p>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-1">No active tasks found for this workspace view.</p>
          <Button size="sm" variant="secondary" onClick={() => navigate(workspaceMode === 'CREWS' ? '/app/crews/tasks' : '/app/tasks')} className="mt-3 text-xs rounded-xl">
            Create Task
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants} className="w-full p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo size={16} strokeWidth={1.5} className="text-[var(--accent)]" />
          <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">Execution Queue</h3>
        </div>
        <Badge variant="secondary" className="text-[10px]">{filteredTasks.length} active</Badge>
      </div>

      {/* Collective Crew Filter Pills in CREWS mode */}
      {workspaceMode === 'CREWS' && crews.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pb-2 border-b border-[var(--border-subtle)]">
          <button
            onClick={() => setSelectedCrewFilter && setSelectedCrewFilter('ALL')}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all",
              (!selectedCrewFilter || selectedCrewFilter === 'ALL')
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "bg-[var(--bg-subtle)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            )}
          >
            All Crews ({relevantTasks.length})
          </button>
          {crews.map(crew => (
            <button
              key={crew.id}
              onClick={() => setSelectedCrewFilter && setSelectedCrewFilter(crew.id)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all",
                selectedCrewFilter === crew.id
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "bg-[var(--bg-subtle)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              )}
            >
              {crew.name}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {filteredTasks.slice(0, 8).map((task, idx) => {
          const taskId = task.id || task.taskId || idx;
          const title = task.title || task.taskTitle || 'Untitled Task';
          const rawStatus = task.status || task.currentStatus || 'OPEN';
          const isDone = ['COMPLETED', 'DONE', 'RESOLVED'].includes(rawStatus.toUpperCase());
          const displayStatus = rawStatus.replace(/_/g, ' ').toLowerCase();

          // Derive Workspace Origin Tag
          const crewLabel = task.crewName || (task.crewId ? `Crew #${task.crewId}` : null);
          const orgLabel = task.organizationName || task.orgName;

          return (
            <div
              key={taskId}
              onClick={() => open('task', { taskId })}
              className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-subtle)]/60 hover:bg-[var(--bg-hover)] border border-transparent hover:border-[var(--border-subtle)] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  isDone ? "bg-[var(--success)]" : rawStatus.toUpperCase() === 'IN_PROGRESS' ? "bg-[var(--warning)]" : "bg-[var(--accent)]"
                )} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "text-[12px] font-medium truncate group-hover:text-[var(--accent)] transition-colors",
                      isDone ? "line-through text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"
                    )}>
                      {title}
                    </p>
                    {/* Collective Crew / Org / Personal Badge */}
                    {workspaceMode === 'CREWS' && crewLabel && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30 shrink-0">
                        {crewLabel}
                      </span>
                    )}
                    {workspaceMode === 'ORG' && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 shrink-0">
                        {orgLabel || 'Org'}
                      </span>
                    )}
                    {workspaceMode === 'PERSONAL' && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                        Personal
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--text-tertiary)] mt-0.5">
                    {task.project?.name && <span>{task.project.name}</span>}
                    {task.priority && (
                      <span className="font-semibold uppercase tracking-wider text-[9px]">· {task.priority}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                {task.dueDate && (
                  <span className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1 font-mono">
                    <Clock size={11} />
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                <Badge variant={isDone ? "success" : rawStatus.toUpperCase() === 'IN_PROGRESS' ? "warning" : "secondary"} className="text-[9px] capitalize">
                  {displayStatus}
                </Badge>
              </div>
            </div>
          );
        })}
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
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Focus on tasks currently in progress to maintain momentum.</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[var(--bg-subtle)]/50">
          <TrendingUp size={14} strokeWidth={1.5} className="text-[var(--success)] shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] font-medium text-[var(--text-primary)]">Productivity trend</p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Your workspace tasks are synced and updated in real-time.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CollectiveCrewContextRail({ crews = [], activeCrew, setActiveCrew }) {
  const navigate = useNavigate();

  return (
    <motion.div variants={itemVariants} className="w-full p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} strokeWidth={1.5} className="text-violet-400" />
          <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">All My Crews</h3>
        </div>
        <button
          onClick={() => navigate('/app/crews/discover')}
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
        >
          Discover <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {(!crews || crews.length === 0) ? (
        <div className="text-center py-4 text-xs text-[var(--text-tertiary)]">
          <p>You haven't joined any crews yet.</p>
          <Button size="sm" variant="secondary" onClick={() => navigate('/app/crews/discover')} className="mt-2 text-xs rounded-xl">
            Explore Crews
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {crews.map(crew => {
            const isActive = activeCrew?.id === crew.id;
            return (
              <div
                key={crew.id}
                onClick={() => setActiveCrew && setActiveCrew(crew)}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group",
                  isActive
                    ? "bg-violet-500/10 border-violet-500/30 text-violet-300"
                    : "bg-[var(--bg-subtle)]/50 border-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs font-bold shrink-0">
                    {crew.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate group-hover:text-violet-300 transition-colors">{crew.name}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{crew.memberCount ?? 1} members</p>
                  </div>
                </div>
                {isActive && (
                  <span className="text-[10px] font-semibold text-violet-400 bg-violet-500/20 px-2 py-0.5 rounded-full">Active</span>
                )}
              </div>
            );
          })}
        </div>
      )}
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

const DEFAULT_WIDGET_REGISTRY = [
  {
    id: 'focus_panel',
    component: 'FocusPanel',
    placement: 'primary',
    order: 1,
    workspaceModes: ['PERSONAL', 'CREWS', 'ORG'],
    requiredPermissions: [],
    visible: true
  },
  {
    id: 'signal_strip',
    component: 'SignalStrip',
    placement: 'header',
    order: 1,
    workspaceModes: ['PERSONAL', 'CREWS', 'ORG'],
    requiredPermissions: [],
    visible: true
  },
  {
    id: 'execution_queue',
    component: 'ExecutionQueue',
    placement: 'primary',
    order: 1,
    workspaceModes: ['PERSONAL', 'CREWS', 'ORG'],
    requiredPermissions: [],
    visible: true
  },
  {
    id: 'workload_brief',
    component: 'WorkloadBrief',
    placement: 'primary',
    order: 1,
    workspaceModes: ['ORG'],
    requiredPermissions: ['DASHBOARD_VIEW'],
    visible: true
  },
  {
    id: 'ai_copilot',
    component: 'AICopilotPanel',
    placement: 'context',
    order: 0,
    workspaceModes: ['PERSONAL', 'CREWS', 'ORG'],
    requiredPermissions: [],
    visible: true
  },
  {
    id: 'personal_context_rail',
    component: 'PersonalContextRail',
    placement: 'context',
    order: 1,
    workspaceModes: ['PERSONAL'],
    requiredPermissions: [],
    visible: true
  },
  {
    id: 'crew_context_rail',
    component: 'CrewContextRail',
    placement: 'context',
    order: 1,
    workspaceModes: ['CREWS'],
    requiredPermissions: [],
    visible: true
  },
  {
    id: 'org_context_rail',
    component: 'OrgContextRail',
    placement: 'context',
    order: 1,
    workspaceModes: ['ORG'],
    requiredPermissions: [],
    visible: true
  }
];

/* ─── V2 Widget Map ─── */
const V2_WIDGET_COMPONENTS = {
  SignalStrip: QuickActionBar,
  ExecutionQueue: TaskQueueCard,
  FocusPanel: FocusCardWidget,
  WorkloadBrief: StatsGrid,
  PersonalContextRail: PersonalContextRail,
  CrewContextRail: CollectiveCrewContextRail,
  OrgContextRail: OrgContextRail,
  AICopilotPanel: AICopilotBlock
};

/* ═══════════════════════════════════════════════ */
export function MissionControlV2({ vm }) {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { workspaceMode, activeCrew, setActiveCrew, crews, activeOrganization } = useWorkspace();
  const [selectedCrewFilter, setSelectedCrewFilter] = React.useState('ALL');

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
          eyebrow: 'Collective Crew Space',
          title: `${getGreeting()}, ${user?.name?.split(' ')[0] || user?.username || ''}`,
          subtitle: `Collective overview across your ${crews.length || 1} crews. Stay synchronized.`,
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

  /* ─── Task Aggregation with Fallback ─── */
  const context = vm?.context;
  const fallbackTasks = vm?.fallbackTasks || [];
  const queueTasks = context?.executionQueue?.tasks || [];
  const personalTasks = context?.personalContext?.activeTasks || context?.personalContext?.tasks || [];
  const crewTasks = context?.crewContext?.activeTasks || context?.crewContext?.tasks || [];
  const orgTasks = context?.organizationContext?.activeTasks || context?.organizationContext?.tasks || [];

  // Combine tasks from DTO and fallback API, deduplicating by ID
  const allRawTasks = [
    ...(workspaceMode === 'CREWS' ? crewTasks : workspaceMode === 'ORG' ? orgTasks : personalTasks),
    ...queueTasks,
    ...fallbackTasks,
  ];

  const taskMap = new Map();
  allRawTasks.forEach(t => {
    const id = t.id || t.taskId;
    if (id && !taskMap.has(id)) {
      taskMap.set(id, t);
    }
  });

  const relevantTasks = Array.from(taskMap.values());

  // Compute stats
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const activeTaskCount = relevantTasks.filter(t => {
    const s = (t.status || t.currentStatus || '').toUpperCase();
    return s !== 'COMPLETED' && s !== 'DONE' && s !== 'RESOLVED' && s !== 'ARCHIVED';
  }).length;

  const completedTaskCount = relevantTasks.filter(t => {
    const s = (t.status || t.currentStatus || '').toUpperCase();
    return s === 'COMPLETED' || s === 'DONE' || s === 'RESOLVED';
  }).length;

  const dueSoonCount = relevantTasks.filter(t => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return due >= now && due <= threeDaysFromNow;
  }).length;

  const teamSize = context?.organizationContext?.insights?.membersCount
    ?? context?.organizationContext?.memberCount
    ?? context?.crewContext?.memberCount
    ?? crews.length
    ?? 1;

  // Derive Focus Task (Psychology: Prioritize IN_PROGRESS, then high priority, then top task)
  const inProgressTask = relevantTasks.find(t => {
    const s = (t.status || t.currentStatus || '').toUpperCase();
    return s === 'IN_PROGRESS' || s === 'IN PROGRESS';
  });

  const focusTask = vm?.focusTask
    || context?.focusPanel
    || inProgressTask
    || (relevantTasks.length > 0 ? relevantTasks[0] : null);

  const recentActivities = relevantTasks.slice(0, 6).map(t => ({
    title: t.title || t.taskTitle || 'Task updated',
    time: t.updatedAt
      ? new Date(t.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : t.dueDate
        ? `Due ${new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : t.status || t.currentStatus || 'Queued',
  }));

  const upcomingDeadlines = relevantTasks
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)
    .map(t => ({
      title: t.title || t.taskTitle,
      date: new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

  const widgetProps = {
    focusTask,
    activeTaskCount,
    completedTaskCount,
    dueSoonCount,
    teamSize,
    recentActivities,
    upcomingDeadlines,
    relevantTasks,
    crews,
    activeCrew,
    setActiveCrew,
    selectedCrewFilter,
    setSelectedCrewFilter,
    resumeContext: vm?.resumeContext || context?.resumeContext,
    context,
  };

  const activeRegistry = DEFAULT_WIDGET_REGISTRY.filter(widget => 
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
        return <Component key={widget.id} {...widgetProps} workspaceMode={workspaceMode} activeCrew={activeCrew} />;
      });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-6xl mx-auto px-2 pb-8"
    >
      {/* ── Dynamic Header (workspace-framework PageHero contract) ── */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full justify-between sm:flex-row sm:items-start pb-5 border-b border-[var(--border-subtle)]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{headerConfig.eyebrow}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {headerConfig.title}
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1.5">{headerConfig.subtitle}</p>
        </div>
        <div className="mt-2 sm:mt-0">
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
