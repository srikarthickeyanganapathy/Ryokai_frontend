import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, Inbox, CheckSquare, FolderClosed, Github, Zap, Calendar,
  Pencil, BarChart3, Bookmark, Sun, Bell, Plus, Lightbulb, TrendingUp, Circle, ListTodo,
  Users, Building2, Rocket, User, CheckCircle2, AlertTriangle, ArrowRight, Clock,
  Megaphone, Compass, ShieldCheck, Network, Play, Pause, RotateCcw, Link2, FileText,
  GitBranch, GitMerge, Activity, Target,
} from 'lucide-react';

/* ── shared tone/badge helpers ── */
const TONE = {
  accent: 'bg-[var(--accent-soft)] text-[var(--accent)]',
  success: 'bg-[var(--success-soft)] text-[var(--success)]',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning)]',
  default: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]',
};
const STATUS_CLS = {
  'in progress': 'bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning)]/20',
  open: 'bg-[var(--bg-subtle)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]',
  done: 'bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/20',
  'in review': 'bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning)]/20',
  claimed: 'bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning)]/20',
  merged: 'bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/20',
  review: 'bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning)]/20',
  approved: 'bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/20',
  pending: 'bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning)]/20',
};
function Badge({ children, tone = 'open' }) {
  return <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${STATUS_CLS[tone] || STATUS_CLS.open}`}>{children}</span>;
}
function Chip({ children, color }) {
  return <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${color}`}>{children}</span>;
}

/* ── data ── */
const MODES = {
  PERSONAL: {
    name: 'Personal', swIcon: User, swCls: 'bg-cyan-500/20 text-cyan-400',
    header: { eyebrow: 'Personal Space', title: 'Good morning, Alex', sub: 'Your private execution space. Focus on what matters.', pill: 'Personal' },
    nav: [
      { sec: 'Workspace', items: [['home', 'Home', LayoutDashboard], ['inbox', 'Inbox', Inbox], ['tasks', 'My Tasks', CheckSquare], ['projects', 'Projects', FolderClosed]] },
      { sec: 'Code', items: [['github', 'GitHub', Github], ['focus', 'Focus', Zap]] },
      { sec: 'Tools', items: [['calendar', 'Calendar', Calendar], ['notes', 'Notes', Pencil], ['analytics', 'Analytics', BarChart3], ['saved', 'Saved', Bookmark]] },
    ],
    stats: [['list', 'Active Tasks', '4', 'accent'], ['check', 'Completed', '12', 'success'], ['alert', 'Due Soon', '2', 'warning'], ['users', 'Team', '1', 'default']],
  },
  ORG: {
    name: 'Atlas Org', swIcon: Building2, swCls: 'bg-blue-500/20 text-blue-400',
    header: { eyebrow: 'Organization · Atlas', title: 'Mission Control', sub: 'Organization-wide overview for Atlas.', pill: 'Org' },
    nav: [
      { sec: 'Workspace', items: [['home', 'Home', LayoutDashboard], ['tasks', 'Tasks', CheckSquare], ['projects', 'Projects', FolderClosed]] },
      { sec: 'Code', items: [['github', 'GitHub', Github]] },
      { sec: 'Workspace', items: [['teams', 'Teams', Users], ['directory', 'Directory', Network]] },
      { sec: 'Tools', items: [['calendar', 'Calendar', Calendar], ['notes', 'Notes', Pencil], ['goals', 'Goals', Target], ['workload', 'Workload', Activity], ['leave', 'Leaves', Clock], ['announce', 'Announce', Megaphone]] },
      { sec: 'Admin', items: [['roles', 'Roles', ShieldCheck]] },
    ],
    stats: [['list', 'Active Tasks', '48', 'accent'], ['check', 'Completed', '132', 'success'], ['alert', 'Due Soon', '9', 'warning'], ['users', 'Team', '24', 'default']],
  },
  CREWS: {
    name: 'Crews', swIcon: Rocket, swCls: 'bg-purple-500/20 text-purple-400',
    header: { eyebrow: 'Collective Crew Space', title: 'Good morning, Alex', sub: 'Collective overview across your 2 crews. Stay synchronized.', pill: 'Crews' },
    nav: [
      { sec: 'Crews', items: [['home', 'Home', LayoutDashboard], ['crews', 'My Crews', Rocket], ['discover', 'Discover', Compass]] },
      { sec: 'Workspace', items: [['projects', 'Projects', FolderClosed]] },
      { sec: 'Code', items: [['github', 'GitHub', Github]] },
      { sec: 'Tools', items: [['calendar', 'Calendar', Calendar], ['notes', 'Notes', Pencil], ['analytics', 'Analytics', BarChart3]] },
    ],
    stats: [['list', 'Active Tasks', '7', 'accent'], ['check', 'Completed', '21', 'success'], ['alert', 'Due Soon', '3', 'warning'], ['users', 'Crews', '2', 'default']],
  },
};

const TASKS = [
  { id: 't1', t: 'Ship the new landing page', p: 'Q3 Landing', pr: 'High', due: 'Aug 21', st: 'in progress' },
  { id: 't2', t: 'Review Q3 permissions audit', p: 'Security', pr: 'High', due: 'Aug 24', st: 'open' },
  { id: 't3', t: 'Draft crew onboarding flow', p: 'Crews', pr: 'Medium', due: 'Aug 28', st: 'open' },
  { id: 't4', t: 'Fix CI flake in deploy pipeline', p: 'Infra', pr: 'Medium', due: 'Aug 19', st: 'in progress' },
  { id: 't5', t: 'Write release notes for v1.4', p: 'Product', pr: 'Low', due: 'Aug 26', st: 'open' },
  { id: 't6', t: 'Update analytics dashboard', p: 'Analytics', pr: 'Low', due: 'Aug 18', st: 'done' },
  { id: 't7', t: 'Approve Q2 expense report', p: 'Finance', pr: 'High', due: 'Aug 16', st: 'done' },
];
const PROJECTS = [
  { name: 'Q3 Landing', desc: 'Marketing site + demo', pct: 72, tasks: '4 / 6', chip: 'on track', chipc: 'bg-[var(--success-soft)] text-[var(--success)]', hue: 16 },
  { name: 'Atlas Mobile', desc: 'React Native app', pct: 45, tasks: '9 / 20', chip: 'at risk', chipc: 'bg-[var(--warning-soft)] text-[var(--warning)]', hue: 210 },
  { name: 'Security Audit', desc: 'Permissions & RBAC review', pct: 88, tasks: '7 / 8', chip: 'on track', chipc: 'bg-[var(--success-soft)] text-[var(--success)]', hue: 150 },
  { name: 'Internal Tools', desc: 'Admin & platform tooling', pct: 30, tasks: '3 / 10', chip: 'planned', chipc: 'bg-[var(--bg-subtle)] text-[var(--text-tertiary)]', hue: 270 },
  { name: 'Onboarding Revamp', desc: 'New user flow', pct: 60, tasks: '6 / 10', chip: 'on track', chipc: 'bg-[var(--success-soft)] text-[var(--success)]', hue: 190 },
  { name: 'Data Pipeline', desc: 'ETL + reporting', pct: 15, tasks: '2 / 13', chip: 'blocked', chipc: 'bg-[var(--danger-soft)] text-[var(--danger)]', hue: 300 },
];
const PRS = [
  { repo: 'ryokai/frontend', n: '#482', t: 'Ship the new landing page', st: 'open', files: 3, branch: 'feature/landing' },
  { repo: 'ryokai/backend', n: '#479', t: 'Fix auth token refresh', st: 'merged', files: 2, branch: 'fix/auth-refresh' },
  { repo: 'ryokai/frontend', n: '#475', t: 'Refactor dock reducer', st: 'review', files: 5, branch: 'refactor/dock' },
  { repo: 'ryokai/infra', n: '#470', t: 'Update CI pipeline', st: 'merged', files: 1, branch: 'ci/update' },
];
const NOTES = [
  { t: 'Landing page ideas', s: 'Three scopes, one permission model. Keep the demo front and center.', d: '2h ago', hue: 16 },
  { t: 'Q4 goals draft', s: 'OKRs: adoption, retention, time-to-approve.', d: 'Yesterday', hue: 210 },
  { t: 'Sprint planning notes', s: 'Reassign the permissions audit to Maya.', d: 'Aug 14', hue: 150 },
  { t: 'Reading list', s: 'Work governance patterns, optimistic locking, RBAC.', d: 'Aug 12', hue: 270 },
];
const BARS = [4, 7, 5, 9, 8, 12, 10, 14];
const INBOX = [
  { ic: Users, t: 'Maya mentioned you in "Q3 permissions audit"', d: '2m ago', unread: true },
  { ic: CheckSquare, t: '"Ship the new landing page" moved to in progress', d: '18m ago', unread: true },
  { ic: Rocket, t: 'Crew "Apollo Launch" updated a whiteboard', d: '1h ago', unread: false },
  { ic: AlertTriangle, t: 'Reminder: Q3 audit due Aug 24', d: '3h ago', unread: true },
  { ic: CheckCircle2, t: 'Your task "Update analytics dashboard" was approved', d: 'Yesterday', unread: false },
];

/* ── views ── */
function Home({ mode }) {
  const m = MODES[mode];
  const tag = mode === 'PERSONAL' ? 'Personal' : mode === 'ORG' ? 'Org' : 'Crew';
  const tagCls = mode === 'PERSONAL' ? 'bg-[var(--info-soft)] text-[var(--info)]' : mode === 'ORG' ? 'bg-blue-500/15 text-blue-400' : 'bg-purple-500/15 text-purple-300';
  const quick = mode === 'PERSONAL'
    ? [['Create Task', Plus, 'T'], ['New Project', FolderClosed, 'P'], ['Focus Mode', Zap, 'F']]
    : mode === 'ORG'
      ? [['Create Task', Plus, 'T'], ['Invite Member', Users, 'I'], ['View Reports', BarChart3, 'R']]
      : [['Create Task', Plus, 'T'], ['New Project', FolderClosed, 'P'], ['Discover Crews', Compass, 'D']];
  const focusTitle = mode === 'ORG' ? 'Q3 permissions audit' : mode === 'CREWS' ? 'Draft crew onboarding flow' : 'Ship the new landing page';
  const focusStatus = mode === 'ORG' ? 'in review' : mode === 'CREWS' ? 'claimed' : 'in progress';
  const queue = mode === 'CREWS'
    ? [['doing', 'Draft crew onboarding flow', 'Apollo', 'Aug 28', 'claimed'], ['open', 'Ship the new landing page', 'Apollo', 'Aug 21', 'claimed'], ['open', 'Whiteboard: Q4 roadmap', 'Orion', 'Aug 27', 'open'], ['done', 'Fix CI flake', 'Orion', 'Aug 15', 'done', true]]
    : [['doing', 'Ship the new landing page', tag, 'Aug 21', 'in progress'], ['review', 'Q3 permissions audit', tag, 'Aug 24', 'in review'], ['open', 'Draft crew onboarding flow', tag, 'Aug 28', 'open'], ['done', 'Update analytics dashboard', tag, 'Aug 18', 'done', true]];

  return (
    <>
      <div className="flex gap-1.5 flex-wrap mb-3.5">
        {quick.map(([label, Icon, kb]) => (
          <span key={label} className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 bg-[var(--bg-subtle)]/40"><Icon size={13} strokeWidth={1.6} className="text-[var(--text-tertiary)]" />{label}<span className="mono text-[9px] border border-[var(--border-subtle)] rounded px-1">{kb}</span></span>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3.5">
        {m.stats.map(([ic, label, value, tone]) => {
          const Icon = { list: ListTodo, check: CheckCircle2, alert: AlertTriangle, users: Users }[ic];
          return (
            <div key={label} className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${TONE[tone]}`}><Icon size={16} strokeWidth={1.5} /></div>
              <div><div className="text-[9px] uppercase tracking-wide text-[var(--text-tertiary)] font-mono">{label}</div><div className="text-lg font-bold tabular-nums leading-tight">{value}</div></div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1.72fr_1fr] gap-3">
        <div className="flex flex-col gap-3 min-w-0">
          <div className="rounded-[13px] border border-[var(--accent-border)] p-4 bg-gradient-to-br from-[var(--accent-soft)] to-transparent relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full" style={{ background: 'radial-gradient(circle, var(--accent-soft), transparent 70%)' }} />
            <div className="flex gap-1.5 mb-2 flex-wrap"><Badge tone="accent">Primary Focus</Badge><Badge tone={focusStatus}>{focusStatus}</Badge></div>
            <div className="text-base font-bold tracking-tight">{focusTitle}</div>
            <div className="text-[10.5px] text-[var(--text-tertiary)] my-2.5">Project: Q3 Landing · Priority: High · Due Aug 21</div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-on-accent)] bg-[var(--accent)] rounded-full px-3.5 py-1.5">Resume Work <ArrowRight size={12} /></span>
          </div>
          <div className="rounded-[13px] border border-[var(--border-subtle)] p-3.5 bg-[var(--bg-subtle)]/30">
            <div className="flex items-center gap-1.5 mb-2"><ListTodo size={14} className="text-[var(--accent)]" /><span className="text-[12.5px] font-semibold">Execution Queue</span><span className="ml-auto text-[9px] text-[var(--text-tertiary)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">4 active</span></div>
            {queue.map(([d, t, tg, du, st, done]) => (
              <div key={t} className={`flex items-center gap-2.5 py-2 border-t border-[var(--border-subtle)] first:border-0 ${done ? 'opacity-60' : ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${d === 'doing' ? 'bg-[var(--warning)]' : d === 'review' ? 'bg-[var(--accent-violet)]' : d === 'done' ? 'bg-[var(--success)]' : 'bg-[var(--accent)]'}`} />
                <span className={`text-[12px] flex-1 truncate ${done ? 'line-through text-[var(--text-tertiary)]' : ''}`}>{t}</span>
                <span className={`text-[8px] font-bold rounded px-1.5 py-0.5 ${tagCls}`}>{tg}</span>
                <span className="text-[9.5px] text-[var(--text-tertiary)] font-mono">{du}</span>
                <Badge tone={st}>{st}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 min-w-0">
          <div className="rounded-[13px] border border-[var(--border-subtle)] p-3.5 bg-[var(--bg-subtle)]/30">
            <div className="flex items-center gap-1.5 mb-2 text-[12px] font-semibold"><Lightbulb size={13} className="text-[var(--accent)]" /> Focus Recommendations</div>
            <div className="flex gap-2 p-2 rounded-lg bg-[var(--bg-subtle)]/60 mb-1.5"><Lightbulb size={14} className="text-amber-400 shrink-0 mt-0.5" /><div><div className="text-[11px] font-medium">Suggested focus</div><div className="text-[10px] text-[var(--text-tertiary)]">Focus on tasks currently in progress to maintain momentum.</div></div></div>
            <div className="flex gap-2 p-2 rounded-lg bg-[var(--bg-subtle)]/60"><TrendingUp size={14} className="text-emerald-400 shrink-0 mt-0.5" /><div><div className="text-[11px] font-medium">Productivity trend</div><div className="text-[10px] text-[var(--text-tertiary)]">Your workspace tasks are synced and updated in real-time.</div></div></div>
          </div>
          <div className="rounded-[13px] border border-[var(--border-subtle)] p-3.5 bg-[var(--bg-subtle)]/30">
            <div className="flex items-center gap-1.5 mb-2 text-[12px] font-semibold"><Calendar size={13} className="text-[var(--accent)]" /> Upcoming</div>
            {[['Landing page', 'Aug 21'], ['Permissions audit', 'Aug 24'], ['Crew onboarding', 'Aug 28']].map(([t, d]) => (
              <div key={t} className="flex gap-2 p-1.5"><Circle size={11} className="text-[var(--text-tertiary)] shrink-0 mt-0.5" /><div><div className="text-[11px] font-medium">{t}</div><div className="text-[10px] text-[var(--text-tertiary)]">{d}</div></div></div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Tasks({ filter, setFilter, done, toggleDone }) {
  const rows = TASKS.filter((t) => (filter === 'all' ? true : t.st === filter));
  const prCls = { High: 'text-[var(--danger)]', Medium: 'text-[var(--warning)]', Low: 'text-[var(--text-tertiary)]' };
  return (
    <>
      <div className="flex items-center gap-2 flex-wrap mb-3.5">
        <div className="inline-flex gap-0.5 p-1 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-subtle)]/40">
          {[['all', 'All'], ['in progress', 'In progress'], ['open', 'Open'], ['done', 'Done']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} className={`text-[11.5px] font-medium px-2.5 py-1 rounded-md transition ${filter === v ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold' : 'text-[var(--text-tertiary)]'}`}>{l}</button>
          ))}
        </div>
        <span className="mono text-[10.5px] text-[var(--text-tertiary)]">{rows.length} tasks · governed lifecycle</span>
      </div>
      <div className="flex flex-col">
        {rows.map((t) => {
          const isDone = done[t.id];
          return (
            <div key={t.id} onClick={() => toggleDone(t.id)} className="flex items-center gap-3 py-2.5 border-t border-[var(--border-subtle)] first:border-0 cursor-pointer group">
              <span className={`w-[18px] h-[18px] rounded-md border-[1.5px] flex items-center justify-center shrink-0 transition ${isDone ? 'bg-[var(--success)] border-[var(--success)] text-white' : 'border-[var(--border-strong)] text-transparent'}`}><CheckCircle2 size={11} /></span>
              <div className="flex-1 min-w-0">
                <div className={`text-[12.5px] font-medium ${isDone ? 'line-through text-[var(--text-tertiary)]' : 'group-hover:text-[var(--accent)]'}`}>{t.t}</div>
                <div className="text-[10.5px] text-[var(--text-tertiary)]">{t.p} · <span className={`font-semibold ${prCls[t.pr]}`}>{t.pr}</span></div>
              </div>
              <span className="hidden sm:flex items-center gap-1 text-[10.5px] text-[var(--text-tertiary)] font-mono"><Clock size={11} />{t.due}</span>
              <Badge tone={t.st}>{t.st}</Badge>
            </div>
          );
        })}
        {rows.length === 0 && <div className="text-center py-10 text-[var(--text-tertiary)] text-[12.5px]">No tasks here yet</div>}
      </div>
    </>
  );
}

function Projects() {
  return (
    <>
      <div className="flex items-center gap-2 flex-wrap mb-3.5"><span className="mono text-[10.5px] text-[var(--text-tertiary)]">{PROJECTS.length} projects · org plane</span><span className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5"><Plus size={13} /> New Project</span></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PROJECTS.map((p) => (
          <div key={p.name} className="rounded-xl border border-[var(--border-subtle)] p-3.5 bg-[var(--bg-subtle)]/30 hover:border-[var(--border-default)] transition">
            <div className="flex items-center gap-2 mb-2"><span className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] text-white shrink-0" style={{ background: `hsl(${p.hue} 60% 48%)` }}>{p.name.charAt(0)}</span><span className="text-[13px] font-semibold flex-1 truncate">{p.name}</span><span className={`text-[8.5px] font-bold uppercase rounded px-1.5 py-0.5 ${p.chipc}`}>{p.chip}</span></div>
            <div className="text-[11.5px] text-[var(--text-tertiary)] mb-3">{p.desc}</div>
            <div className="h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden mb-2"><div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: 'var(--accent-gradient)' }} /></div>
            <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] font-mono"><span>{p.tasks} tasks</span><span className="font-bold text-[var(--text-secondary)]">{p.pct}%</span></div>
          </div>
        ))}
      </div>
    </>
  );
}

function GithubView() {
  return (
    <>
      <div className="mb-3.5 mono text-[10.5px] text-[var(--text-tertiary)]">Linked via your GitHub connection · read-only for crew viewers</div>
      <div className="flex flex-col">
        {PRS.map((pr) => (
          <div key={pr.n} className="flex items-center gap-3 py-2.5 border-t border-[var(--border-subtle)] first:border-0">
            <span className="w-7 h-7 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)] flex items-center justify-center shrink-0">{pr.st === 'merged' ? <GitMerge size={13} /> : <GitBranch size={13} />}</span>
            <div className="flex-1 min-w-0"><div className="text-[12.5px] font-medium">{pr.t}</div><div className="text-[10.5px] text-[var(--text-tertiary)] font-mono">{pr.repo} · {pr.n} · {pr.branch}</div></div>
            <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{pr.files} files</span>
            <Badge tone={pr.st}>{pr.st}</Badge>
          </div>
        ))}
      </div>
    </>
  );
}

function Focus({ seconds, running, onToggle, onReset }) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="flex flex-col items-center gap-1.5 mb-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-tertiary)]">Focus Session</span>
        <span className="text-6xl font-bold tracking-tight tabular-nums">{m}:{s}</span>
        <span className="text-[12.5px] text-[var(--text-secondary)]">Ship the new landing page</span>
      </div>
      <div className="flex gap-2.5 mb-6">
        <button onClick={onToggle} className="inline-flex items-center gap-1.5 text-[12.5px] font-medium px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--text-on-accent)] border border-[var(--accent)]">{running ? <Pause size={14} /> : <Play size={14} />} {running ? 'Pause' : 'Start'}</button>
        <button onClick={onReset} className="inline-flex items-center gap-1.5 text-[12.5px] font-medium px-4 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-primary)]"><RotateCcw size={14} /> Reset</button>
      </div>
      <div className="flex gap-8">
        {[['3', 'Sessions today'], ['1h 20m', 'Total focus'], ['25m', 'Session length']].map(([v, l]) => (
          <div key={l} className="flex flex-col items-center"><span className="text-lg font-bold tabular-nums">{v}</span><span className="text-[10px] text-[var(--text-tertiary)]">{l}</span></div>
        ))}
      </div>
    </div>
  );
}

function CalendarView() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const ev = { 2: 1, 4: 2, 8: 1, 14: 1, 18: 1, 21: 2, 24: 1, 28: 1 };
  return (
    <>
      <div className="flex items-center justify-between mb-3.5"><span className="text-sm font-semibold">August 2026</span><span className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]"><span className="border border-[var(--border-subtle)] rounded px-2 py-1">Today</span></span></div>
      <div className="grid grid-cols-7 gap-1 mb-1">{days.map((d) => <span key={d} className="text-center font-mono text-[9px] uppercase text-[var(--text-tertiary)]">{d}</span>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
          <div key={d} className={`aspect-square rounded-lg border flex flex-col items-center justify-center gap-0.5 ${d === 18 ? 'border-[var(--accent-border)] bg-[var(--accent-soft)]' : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)]/30'}`}>
            <span className={`text-[11px] font-medium ${d === 18 ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-secondary)]'}`}>{d}</span>
            {ev[d] && <span className="flex gap-0.5">{Array.from({ length: ev[d] }).map((_, i) => <i key={i} className="w-1 h-1 rounded-full bg-[var(--accent)]" />)}</span>}
          </div>
        ))}
      </div>
    </>
  );
}

function Notes() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-3">
        <div className="flex flex-col gap-1.5">
          {NOTES.map((n) => (
            <div key={n.t} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/30">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] text-white shrink-0" style={{ background: `hsl(${n.hue} 60% 48%)` }}>{n.t.charAt(0)}</span>
              <div className="flex-1 min-w-0"><div className="text-[12.5px] font-semibold">{n.t}</div><div className="text-[10.5px] text-[var(--text-tertiary)] truncate">{n.s}</div></div>
              <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{n.d}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] p-4 bg-[var(--bg-subtle)]/30 flex flex-col">
          <div className="text-[15px] font-bold mb-2">Landing page ideas</div>
          <div className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed flex-1">Three scopes, one permission model.<br /><br />Keep the interactive demo front and center on the hero — it is the fastest way for a visitor to understand the product.</div>
          <div className="mt-3"><span className="inline-flex items-center gap-1.5 text-[11px] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5"><CheckSquare size={13} /> Convert to task</span></div>
        </div>
      </div>
    </>
  );
}

function Analytics() {
  const max = Math.max(...BARS);
  return (
    <>
      <div className="grid grid-cols-3 gap-2.5 mb-3.5">
        {[['14', 'Tasks / week'], ['2.3d', 'Avg cycle time'], ['94%', 'On-time delivery']].map(([v, l]) => (
          <div key={l} className="rounded-xl border border-[var(--border-subtle)] p-3 bg-[var(--bg-subtle)]/30"><span className="block text-lg font-bold tabular-nums">{v}</span><span className="text-[10px] text-[var(--text-tertiary)]">{l}</span></div>
        ))}
      </div>
      <div className="rounded-xl border border-[var(--border-subtle)] p-4 bg-[var(--bg-subtle)]/30">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold mb-4"><BarChart3 size={13} className="text-[var(--accent)]" /> Tasks completed per week</div>
        <div className="flex items-end gap-2.5 h-[140px]">
          {BARS.map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 justify-end h-full">
              <div className="w-full max-w-[34px] rounded-t-md relative" style={{ height: `${(b / max) * 100}%`, background: 'var(--accent-gradient)', minHeight: 4 }}><span className="absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[var(--text-secondary)]">{b}</span></div>
              <span className="font-mono text-[9px] text-[var(--text-tertiary)]">W{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Saved() {
  const items = [
    ['Linear vs Ryokai comparison', 'link', 'Aug 15', Link2],
    ['Rebalance simulator docs', 'doc', 'Aug 13', FileText],
    ['Figma: onboarding flow', 'link', 'Aug 11', Link2],
    ['RFC: authorization engine', 'doc', 'Aug 9', FileText],
    ['Best practices: evidence', 'note', 'Aug 6', Pencil],
  ];
  return (
    <div className="flex flex-col">
      {items.map(([t, type, d, Icon]) => (
        <div key={t} className="flex items-center gap-3 py-2.5 border-t border-[var(--border-subtle)] first:border-0">
          <span className="w-7 h-7 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)] flex items-center justify-center shrink-0"><Icon size={13} /></span>
          <div className="flex-1 min-w-0"><div className="text-[12.5px] font-medium">{t}</div><div className="text-[10px] text-[var(--text-tertiary)]">Saved {d}</div></div>
          <span className="text-[8.5px] uppercase tracking-wide font-mono text-[var(--text-tertiary)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">{type}</span>
        </div>
      ))}
    </div>
  );
}

function InboxView() {
  return (
    <>
      <div className="mb-3.5 mono text-[10.5px] text-[var(--text-tertiary)]">3 unread notifications</div>
      <div className="flex flex-col">
        {INBOX.map((n, i) => (
          <div key={i} className={`flex items-center gap-3 py-2.5 border-t border-[var(--border-subtle)] first:border-0 ${n.unread ? 'bg-[var(--accent-soft)] -mx-2 px-2 rounded-lg' : ''}`}>
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${n.unread ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'}`}><n.ic size={13} /></span>
            <div className="flex-1 min-w-0"><div className="text-[12.5px] font-medium">{n.t}</div><div className="text-[10px] text-[var(--text-tertiary)]">{n.d}</div></div>
            {n.unread && <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />}
          </div>
        ))}
      </div>
    </>
  );
}

function Teams() {
  const teams = [
    ['Frontend', 6, 24, 210], ['Backend', 5, 19, 150], ['Design', 3, 8, 300], ['Data', 4, 11, 270],
  ];
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {teams.map(([name, members, tasks, hue]) => (
        <div key={name} className="rounded-xl border border-[var(--border-subtle)] p-3.5 bg-[var(--bg-subtle)]/30">
          <div className="flex items-center gap-2 mb-2.5"><span className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] text-white" style={{ background: `hsl(${hue} 60% 48%)` }}>{name.charAt(0)}</span><span className="text-[13px] font-semibold">{name}</span></div>
          <div className="flex gap-3.5 text-[11px] text-[var(--text-tertiary)]"><span className="inline-flex items-center gap-1"><Users size={12} />{members} members</span><span className="inline-flex items-center gap-1"><CheckSquare size={12} />{tasks} tasks</span></div>
        </div>
      ))}
    </div>
  );
}

function Directory() {
  const people = [
    ['Priya Sharma', 'Frontend Lead', 'online', 210], ['Dev Patel', 'Backend', 'online', 150], ['Jonas Weber', 'Platform', 'away', 270],
    ['Lin Chen', 'Design', 'online', 190], ['Maya Rao', 'Data', 'offline', 300], ['Omar Haddad', 'Mobile', 'online', 30],
  ];
  const st = { online: 'text-[var(--success)] bg-[var(--success-soft)]', away: 'text-[var(--warning)] bg-[var(--warning-soft)]', offline: 'text-[var(--text-tertiary)] bg-[var(--bg-subtle)]' };
  return (
    <div className="flex flex-col">
      {people.map(([name, role, status, hue]) => (
        <div key={name} className="flex items-center gap-3 py-2.5 border-t border-[var(--border-subtle)] first:border-0">
          <span className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white shrink-0" style={{ background: `hsl(${hue} 60% 48%)` }}>{name.charAt(0)}</span>
          <div className="flex-1 min-w-0"><div className="text-[12.5px] font-medium">{name}</div><div className="text-[10.5px] text-[var(--text-tertiary)]">{role}</div></div>
          <span className={`text-[9px] uppercase tracking-wide font-mono rounded px-1.5 py-0.5 ${st[status]}`}>{status}</span>
        </div>
      ))}
    </div>
  );
}

function Goals() {
  return (
    <div className="flex flex-col gap-3">
      {[['Ship governed workflows', 'on track', 72, '4 / 6 tasks · due Aug 30'], ['Improve approval latency', 'at risk', 38, '3 / 8 tasks · due Sep 14'], ['Grow to 3 crews', 'on track', 66, '2 / 3 crews · due Sep 30']].map(([t, chip, pct, meta]) => (
        <div key={t} className="rounded-xl border border-[var(--border-subtle)] p-3.5 bg-[var(--bg-subtle)]/30">
          <div className="flex items-center justify-between mb-2.5"><span className="text-[13px] font-semibold">{t}</span><Badge tone={chip === 'on track' ? 'merged' : 'in review'}>{chip}</Badge></div>
          <div className="h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden mb-2"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent-gradient)' }} /></div>
          <div className="text-[10.5px] text-[var(--text-tertiary)] font-mono">{pct}% · {meta}</div>
        </div>
      ))}
    </div>
  );
}

function WorkloadMini() {
  return (
    <>
      <div className="rounded-xl border border-dashed border-[var(--border-default)] p-4 text-[12.5px] text-[var(--text-secondary)] mb-3.5 bg-[var(--bg-subtle)]/30">Full workload view — distribution, rebalance simulator and 14-day heatmap — lives in the Workload section below.</div>
      <div className="grid grid-cols-3 gap-2.5">
        {[['24', 'Members'], ['3', 'Overloaded'], ['82', 'Health score']].map(([v, l]) => (
          <div key={l} className="rounded-xl border border-[var(--border-subtle)] p-3 bg-[var(--bg-subtle)]/30"><span className="block text-lg font-bold tabular-nums">{v}</span><span className="text-[10px] text-[var(--text-tertiary)]">{l}</span></div>
        ))}
      </div>
    </>
  );
}

function Leaves() {
  const rows = [['Maya Rao', 'Aug 24 – 26', 'pending'], ['Omar Haddad', 'Aug 19', 'approved'], ['Lin Chen', 'Sep 2 – 5', 'pending']];
  return (
    <div className="flex flex-col">
      {rows.map(([name, range, status]) => (
        <div key={name} className="flex items-center gap-3 py-2.5 border-t border-[var(--border-subtle)] first:border-0">
          <span className="w-7 h-7 rounded-full bg-[var(--bg-hover-strong)] flex items-center justify-center font-bold text-[11px]">{name.charAt(0)}</span>
          <div className="flex-1 min-w-0"><div className="text-[12.5px] font-medium">{name}</div><div className="text-[10.5px] text-[var(--text-tertiary)]">{range}</div></div>
          <Badge tone={status}>{status}</Badge>
        </div>
      ))}
    </div>
  );
}

function Announce() {
  return (
    <div className="flex flex-col gap-3">
      {[['Q3 permissions audit — kickoff', 'Posted by Sarah · Aug 14', 'All hands: review scopes for frontend and data teams before Aug 24.'], ['Release train Aug 30', 'Posted by Dev · Aug 12', 'Feature freeze Aug 26. Code freeze Aug 29.']].map(([t, d, b]) => (
        <div key={t} className="flex gap-3 p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/30">
          <span className="w-7 h-7 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0"><Megaphone size={13} /></span>
          <div><div className="text-[13px] font-semibold">{t}</div><div className="text-[10px] text-[var(--text-tertiary)] my-0.5">{d}</div><div className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{b}</div></div>
        </div>
      ))}
    </div>
  );
}

function Roles() {
  const roles = [['Owner', 'full control'], ['Admin', 'manage users & scopes'], ['Lead', 'approve & assign'], ['Member', 'execute tasks']];
  return (
    <div className="flex flex-col">
      {roles.map(([name, perm], i) => (
        <div key={name} className="flex items-center gap-3 py-3 border-t border-[var(--border-subtle)] first:border-0">
          <span className="w-6 h-6 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-mono text-[11px] font-bold">{i + 1}</span>
          <span className="text-[13px] font-semibold w-24">{name}</span>
          <span className="text-[11.5px] text-[var(--text-tertiary)]">{perm}</span>
        </div>
      ))}
    </div>
  );
}

function Crews() {
  const crews = [['Apollo Launch', 4, 6, 270], ['Orion', 5, 4, 190]];
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {crews.map(([name, members, tasks, hue]) => (
        <div key={name} className="rounded-xl border border-[var(--border-subtle)] p-3.5 bg-[var(--bg-subtle)]/30">
          <div className="flex items-center gap-2 mb-2.5"><span className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] text-white" style={{ background: `hsl(${hue} 60% 48%)` }}>{name.charAt(0)}</span><span className="text-[13px] font-semibold">{name}</span></div>
          <div className="flex gap-3.5 text-[11px] text-[var(--text-tertiary)]"><span className="inline-flex items-center gap-1"><Users size={12} />{members} members</span><span className="inline-flex items-center gap-1"><CheckSquare size={12} />{tasks} tasks</span></div>
        </div>
      ))}
    </div>
  );
}

function Discover() {
  const crews = [['Design Ops', 7, 'design systems', 200], ['Platform Guild', 9, 'infra, SRE', 280], ['Launchpad', 5, 'growth', 240]];
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {crews.map(([name, members, topics, hue]) => (
        <div key={name} className="rounded-xl border border-[var(--border-subtle)] p-3.5 bg-[var(--bg-subtle)]/30">
          <div className="flex items-center gap-2 mb-2"><span className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] text-white" style={{ background: `hsl(${hue} 60% 48%)` }}>{name.charAt(0)}</span><span className="text-[13px] font-semibold">{name}</span></div>
          <div className="text-[11px] text-[var(--text-tertiary)] mb-2.5"><span className="inline-flex items-center gap-1"><Users size={12} />{members} members</span> · {topics}</div>
          <span className="inline-flex items-center gap-1.5 text-[11px] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5"><Plus size={13} /> Join</span>
        </div>
      ))}
    </div>
  );
}

/* ── shell ── */
export default function AppWindowPreview() {
  const [mode, setMode] = useState('PERSONAL');
  const [view, setView] = useState('home');
  const [taskFilter, setTaskFilter] = useState('all');
  const [done, setDone] = useState({});
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  useEffect(() => {
    if (seconds === 0) setRunning(false);
  }, [seconds]);

  const m = MODES[mode];

  const header = (
    <div className="ph">
      <div>
        <span className="ph-eyebrow">{m.header.eyebrow}</span>
        <h2>{m.header.title}</h2>
        <div className="sub">{m.header.sub}</div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="pill">{m.header.pill}</span>
        <div className="modesel">
          <button className={mode === 'PERSONAL' ? 'active' : ''} onClick={() => { setMode('PERSONAL'); setView('home'); }}><User size={13} strokeWidth={1.6} /> Personal</button>
          <button className={mode === 'ORG' ? 'active' : ''} onClick={() => { setMode('ORG'); setView('home'); }}><Building2 size={13} strokeWidth={1.6} /> Org</button>
          <button className={mode === 'CREWS' ? 'active' : ''} onClick={() => { setMode('CREWS'); setView('home'); }}><Rocket size={13} strokeWidth={1.6} /> Crews</button>
        </div>
      </div>
    </div>
  );

  const viewMap = {
    home: <Home mode={mode} />,
    tasks: <Tasks filter={taskFilter} setFilter={setTaskFilter} done={done} toggleDone={(id) => setDone((p) => ({ ...p, [id]: !p[id] }))} />,
    projects: <Projects />,
    github: <GithubView />,
    focus: <Focus seconds={seconds} running={running} onToggle={() => setRunning((r) => !r)} onReset={() => { setRunning(false); setSeconds(25 * 60); }} />,
    calendar: <CalendarView />,
    notes: <Notes />,
    analytics: <Analytics />,
    saved: <Saved />,
    inbox: <InboxView />,
    teams: <Teams />,
    directory: <Directory />,
    goals: <Goals />,
    workload: <WorkloadMini />,
    leave: <Leaves />,
    announce: <Announce />,
    roles: <Roles />,
    crews: <Crews />,
    discover: <Discover />,
  };

  return (
    <div className="app-stage">
      <div className="stage-glow" />
      <motion.div
        className="appwin reveal"
        initial={{ y: 60, opacity: 0, rotateX: 10, scale: 0.95 }}
        whileInView={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: 'top center', perspective: 1000 }}
      >
        <div className="app-shell">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sb-user">
              <span className="av">AM</span>
              <div><div className="nm">Alex Morgan</div><div className="em">alex@ryokai.dev</div></div>
            </div>
            <div
              className="sb-ws"
              onClick={() => { setMode((p) => (p === 'PERSONAL' ? 'ORG' : p === 'ORG' ? 'CREWS' : 'PERSONAL')); setView('home'); }}
              title="Switch workspace"
            >
              <span className={`ic ${m.swCls}`}><m.swIcon size={13} strokeWidth={1.6} /></span>
              <div><div className="t">{m.name}</div><div className="s">Switch workspace</div></div>
            </div>
            <div className="sb-search"><Search size={14} /><span>Search…</span><span className="kb">⌘K</span></div>
            {m.nav.map((group) => (
              <div key={group.sec}>
                <div className="sb-sec">{group.sec}</div>
                {group.items.map(([key, label, Icon]) => (
                  <div key={key} className={`sb-item${view === key ? ' active' : ''}`} onClick={() => setView(key)}>
                    <Icon size={15} strokeWidth={1.6} /> {label}
                  </div>
                ))}
              </div>
            ))}
            <div className="sb-spacer" />
          </div>

          {/* Main */}
          <div className="mainarea">
            <div className="maincard">
              <div className="topbar">
                <div className="tb-left" />
                <div className="tb-search"><Search size={13} /> Search or jump to… <span className="kb">⌘K</span></div>
                <div className="tb-right">
                  <motion.span className="tb-ic" whileHover={{ scale: 1.1 }} title="Quick actions"><Plus size={15} /></motion.span>
                  <motion.span className="tb-ic" whileHover={{ scale: 1.1 }} title="Theme"><Sun size={15} /></motion.span>
                  <motion.span className="tb-ic" whileHover={{ scale: 1.1 }} title="Notifications"><Bell size={15} /><span className="bdot">2</span></motion.span>
                  <span className="tb-logo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M4 8h3M4 12h3M4 16h3M10 8h6M10 12h4M10 16h7" /></svg>
                  </span>
                </div>
              </div>
              <div className="pagebody">
                <AnimatePresence mode="wait">
                  <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                    {header}
                    {viewMap[view] || viewMap.home}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
