import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge'
import { SectionPanel } from '@/shared/ui/SectionPanel';
import { Icons } from '@/shared/ui/Icons';
import { 
  ListTodo, Plus, MessageSquare, Folder, Users, TrendingUp, 
  Activity, AlertCircle, ArrowRight, Sparkles, Clock, CheckCircle2, 
  Zap, Target, ChevronRight, Pencil
} from '@/shared/ui/Icons';

// Helper to format relative timestamps
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

// --- SVG Charts ---

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
        <path d={areaD} fill="url(#velocityGradient)" />
        <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill="var(--accent)" />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="7" fill="var(--accent)" opacity="0.25" className="animate-ping" />
      </svg>
    </div>
  );
}

function TeamHealthGauge({ healthScore = 94 }) {
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
          <circle cx="48" cy="48" r={radius} stroke="var(--bg-subtle)" strokeWidth={strokeWidth} fill="none" />
          <circle
            cx="48" cy="48" r={radius} stroke={strokeColor} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" fill="none" className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-extrabold tracking-tight tabular-nums text-[var(--text-primary)]">{healthScore}%</span>
          <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Health</span>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

export function OverviewTab({ team, insights, teamTasks, teamProjects, observerCount, hasTaskTimestamps, canCreateProject, canAssignTask, canManage, isReadOnly, onManageMembers, onCreateProject, onAssignTask, onOpenChat, onOpenTasks, setActiveTab }) {
  const totalTasks = teamTasks.length;
  const doneTasksCount = teamTasks.filter(t => t.status === 'Done' || t.status === 'COMPLETED').length;
  const activeTasks = teamTasks.filter(t => {
    const status = String(t.status || '').toUpperCase();
    return status === 'IN_PROGRESS' || status === 'REVIEW' || status === 'DOING' || status === 'IN PROGRESS';
  });

  const isTeamEmpty = totalTasks === 0 && teamProjects.length === 0;

  // Health Score: weighted by completion rate and workload balance
  const healthScore = useMemo(() => {
    if (isTeamEmpty) return 100;
    const taskRate = totalTasks > 0 ? (doneTasksCount / totalTasks) * 60 : 20;
    const balanceRate = (insights.balanceScore / 100) * 40;
    return Math.round(taskRate + balanceRate);
  }, [totalTasks, doneTasksCount, insights.balanceScore, isTeamEmpty]);

  // Activity Feed Derivation
  const activityFeed = useMemo(() => {
    const events = [];
    teamTasks.forEach(task => {
      events.push({
        id: `task-${task.id}`,
        title: task.title,
        status: task.status || 'TODO',
        timestamp: task.updatedAt || task.createdAt || Date.now(),
        actor: task.assignedTo || 'Team Member',
        type: 'task'
      });
    });
    insights.recentMessages.forEach(msg => {
      events.push({
        id: `msg-${msg.id}`,
        title: `Messaged in ${team.name}`,
        status: 'Sent',
        timestamp: msg.createdAt,
        actor: msg.authorUsername,
        type: 'message'
      });
    });
    return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
  }, [teamTasks, insights.recentMessages, team.name]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--bg-elevated)] via-[var(--bg-card)] to-[var(--bg-subtle)] border border-[var(--border-default)] p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[var(--accent)]/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="primary" size="sm" className="gap-1 font-semibold uppercase tracking-wider text-[10px]">
                <Target className="w-3 h-3" /> Team Mission
              </Badge>
              {healthScore >= 80 && (
                <Badge variant="success" size="sm" className="gap-1 text-[10px]">
                  <Sparkles className="w-3 h-3" /> Optimal Pace
                </Badge>
              )}
            </div>

            <div>
              <Heading level={2} className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                {team.name} Dashboard
              </Heading>
              <Text size="sm" className="text-[var(--text-secondary)] mt-1 line-clamp-2">
                {team.description || 'Execute sprint tasks, collaborate, and monitor team velocity in real time.'}
              </Text>
            </div>

            <div className="pt-2 max-w-md space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[var(--accent)]" Sprint Progress ></Zap>
                </span>
                <span className="font-semibold tabular-nums text-[var(--text-primary)]">
                  {insights.completionRate}% <span className="text-[var(--text-muted)] font-normal">({doneTasksCount}/{totalTasks || 1} Done)</span>
                </span>
              </div>
              <div className="h-2 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-500" style={{ width: `${insights.completionRate}%` }} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-2.5 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
            <Button variant="primary" size="md" className="gap-2 justify-center shadow-md font-semibold text-[13px] flex-1 lg:flex-none" onClick={onAssignTask} disabled={!canAssignTask || isReadOnly}>
              <Plus className="w-4 h-4" /> Assign Task
            </Button>
            <div className="flex gap-2 w-full lg:w-auto">
              <Button variant="secondary" size="sm" className="gap-1.5 justify-center text-[12px] flex-1" onClick={onOpenChat}>
                <MessageSquare className="w-3.5 h-3.5 text-[var(--accent)]" /> Chat
              </Button>
              <Button variant="secondary" size="sm" className="gap-1.5 justify-center text-[12px] flex-1" onClick={onCreateProject} disabled={!canCreateProject || isReadOnly}>
                <Folder className="w-3.5 h-3.5 text-[var(--warning)]" /> Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

        {/* CARD 1: ACTIVE WORK (lg:col-span-8) */}
        <SectionPanel
          className="lg:col-span-8 flex flex-col justify-between"
          icon={Zap}
          title="Active Work"
          subtitle="Tasks currently in progress or review"
          actions={<Badge variant="primary" size="sm" className="tabular-nums font-semibold">{activeTasks.length} Active</Badge>}
        >

          {activeTasks.length === 0 ? (
            <div className="py-8 px-4 text-center bg-[var(--bg-subtle)]/40 rounded-xl border border-dashed border-[var(--border-subtle)] space-y-3">
              <CheckCircle2 className="w-8 h-8 text-[var(--success)] mx-auto opacity-80" />
              <div className="space-y-1">
                <Text size="sm" className="font-semibold text-[var(--text-primary)]">No active tasks in progress</Text>
                <Text size="xs" variant="muted">All sprint items are completed or in backlog.</Text>
              </div>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {activeTasks.slice(0, 4).map(task => {
                const isReview = String(task.status).toUpperCase().includes('REVIEW');
                const priority = String(task.priority || 'MEDIUM').toUpperCase();
                return (
                  <div key={task.id} onClick={() => setActiveTab('tasks')} className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-subtle)]/60 hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] transition-all cursor-pointer group">
                    <div className="flex items-start gap-3 min-w-0 flex-1 pr-3">
                      <div className={`w-2 h-10 rounded-full shrink-0 mt-0.5 ${isReview ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]'}`} />
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-[13px] text-[var(--text-primary)] truncate block group-hover:text-[var(--accent)] transition-colors">
                          {task.title}
                        </span>
                        <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] mt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" /> {formatTimeAgo(task.updatedAt || task.createdAt)}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{task.assignedTo || 'Unassigned'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={priority === 'HIGH' || priority === 'URGENT' ? 'danger' : 'default'} size="xs" className="uppercase text-[9px] font-mono tracking-wider">
                        {priority}
                      </Badge>
                      <Badge variant={isReview ? 'warning' : 'primary'} size="sm" className="text-[10px] font-medium">
                        {isReview ? 'In Review' : 'In Progress'}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="pt-2 mt-5 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)]">Showing top active tasks out of {totalTasks} total</span>
            <button onClick={() => setActiveTab('tasks')} className="text-[12px] font-semibold text-[var(--accent)] hover:underline flex items-center gap-1">
              View Task Board <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </SectionPanel>

        {/* CARD 2: VELOCITY & HEALTH (lg:col-span-4) */}
        <SectionPanel
          className="lg:col-span-4 flex flex-col justify-between"
          icon={Activity}
          title="Team Velocity"
          actions={<Badge variant="success" size="xs" className="gap-1 font-mono"><TrendingUp className="w-3 h-3" /> {insights.completionRate}%</Badge>}
        >

          <div className="grid grid-cols-2 gap-4 items-center py-1">
            <div className="flex flex-col items-center border-r border-[var(--border-subtle)] pr-2">
              <TeamHealthGauge healthScore={healthScore} />
              <span className="text-[11px] font-medium text-[var(--text-secondary)] mt-2 text-center">
                {healthScore >= 80 ? 'Optimal Performance' : healthScore >= 50 ? 'Healthy Pace' : 'Needs Action'}
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">Completed</div>
                <div className="text-lg font-extrabold text-[var(--text-primary)] tabular-nums">
                  {doneTasksCount} <span className="text-xs font-normal text-[var(--text-muted)]">/ {totalTasks}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">Workload Balance</div>
                <div className="text-sm font-bold text-[var(--success)] tabular-nums">{insights.balanceScore}%</div>
              </div>
            </div>
          </div>

          <div className="pt-2 mt-5">
            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1">
              <span>Completion Trend</span>
              <span className="font-mono text-[var(--accent)] font-semibold">Done: {doneTasksCount}</span>
            </div>
            <VelocitySparkline data={[0, Math.round(totalTasks * 0.2), Math.round(totalTasks * 0.4), Math.round(totalTasks * 0.6), doneTasksCount]} />
          </div>
        </SectionPanel>

        {/* CARD 3: ACTIVITY TIMELINE (lg:col-span-8) */}
        <SectionPanel
          className="lg:col-span-8"
          icon={Clock}
          title="Activity Timeline"
          actions={<Badge variant="outline" size="sm" className="text-[10px] text-[var(--text-muted)]">Realtime Stream</Badge>}
        >

          {activityFeed.length === 0 ? (
            <div className="py-8 text-center bg-[var(--bg-subtle)]/30 rounded-xl border border-dashed border-[var(--border-subtle)]">
              <Text size="xs" variant="muted">No recent activity events recorded.</Text>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-subtle)]">
              {activityFeed.map((event, idx) => (
                <div key={event.id || idx} className="relative flex items-start gap-3 group">
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
                      <Badge variant={event.type === 'message' ? 'secondary' : 'primary'} size="xs" className="text-[9px]">
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionPanel>

        {/* CARD 4: QUICK ACTIONS & ROSTER (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          <SectionPanel title="Quick Action Shortcuts">
            <div className="grid grid-cols-2 gap-2.5">
              <Button variant="outline" size="sm" className="gap-2 justify-start h-9 text-[12px] w-full" onClick={() => setActiveTab('tasks')}>
                <ListTodo className="w-3.5 h-3.5 text-[var(--accent)]" /> Task Board
              </Button>
              <Button variant="outline" size="sm" className="gap-2 justify-start h-9 text-[12px] w-full" onClick={onOpenChat}>
                <MessageSquare className="w-3.5 h-3.5 text-[var(--success)]" /> Discuss
              </Button>
              <Button variant="outline" size="sm" className="gap-2 justify-start h-9 text-[12px] w-full" onClick={() => setActiveTab('projects')}>
                <Folder className="w-3.5 h-3.5 text-[var(--warning)]" /> Projects
              </Button>
              <Button variant="outline" size="sm" className="gap-2 justify-start h-9 text-[12px] w-full" onClick={() => setActiveTab('insights')}>
                <Activity className="w-3.5 h-3.5 text-[var(--danger)]" /> Analytics
              </Button>
            </div>
          </SectionPanel>

          <SectionPanel
            title="Team Roster"
            actions={
              <button onClick={() => setActiveTab('members')} className="text-[11px] font-semibold text-[var(--accent)] hover:underline">
                View All ({team.members?.length || 0}) →
              </button>
            }
          >
            {team.members?.length === 0 ? (
              <Text size="xs" variant="muted" className="italic">No team members assigned.</Text>
            ) : (
              <div className="space-y-3">
                {team.members?.slice(0, 4).map(m => (
                  <div key={m.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white font-bold text-[11px] flex items-center justify-center shadow-sm">
                          {m.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--success)] border-2 border-[var(--bg-card)]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-[var(--text-primary)] truncate">@{m.username}</div>
                        <div className="text-[10px] text-[var(--text-muted)] capitalize">{m.orgRole || 'Member'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionPanel>

        </div>

      </div>
    </div>
  );
}