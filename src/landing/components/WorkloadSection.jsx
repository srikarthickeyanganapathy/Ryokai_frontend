import { useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Users,
  AlertCircle,
  TrendingUp,
  Wand2,
  ArrowRight,
  Search,
  Brain,
  Gauge,
  ListTodo,
  Plus,
} from 'lucide-react';

const AnimatedCounter = ({ value, color, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useMemo(() => {
    if (isInView) {
      const duration = 1.2;
      const steps = 24;
      const stepTime = (duration * 1000) / steps;
      const increment = value / steps;
      let current = 0;
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          current += increment;
          if (current >= value) { setCount(value); clearInterval(interval); }
          else setCount(Math.floor(current));
        }, stepTime);
        return () => clearInterval(interval);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, value, delay]);

  return <div ref={ref} className={`text-xl font-bold leading-tight tabular-nums ${color}`}>{count}</div>;
};

/* ── Roster data — reflects the real WorkloadPage shape ── */
const BASE_ROWS = [
  { id: 'p', name: 'Priya Sharma', role: 'Frontend', count: 11, hue: 210 },
  { id: 'd', name: 'Dev Patel', role: 'Backend', count: 10, hue: 150 },
  { id: 'j', name: 'Jonas Weber', role: 'Platform', count: 9, hue: 270 },
  { id: 'l', name: 'Lin Chen', role: 'Design', count: 3, hue: 190 },
  { id: 'm', name: 'Maya Rao', role: 'Data', count: 4, hue: 300 },
  { id: 'o', name: 'Omar Haddad', role: 'Mobile', count: 6, hue: 30 },
];

const HEATMAP = [
  [0, 1, 1, 2, 1, 0, 0, 1, 2, 1, 1, 0, 0, 1],
  [1, 2, 3, 4, 3, 1, 0, 2, 3, 2, 1, 1, 0, 1],
  [0, 1, 1, 2, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1],
  [1, 2, 3, 3, 2, 1, 0, 1, 2, 1, 1, 0, 0, 1],
  [0, 1, 1, 2, 2, 1, 0, 1, 1, 2, 1, 0, 0, 1],
];
const HEAT_LABELS = ['Empty', 'Light', 'Normal', 'Heavy', 'Max'];
const HEAT_CLS = [
  'bg-[var(--bg-elevated)] border border-[var(--border-subtle)]',
  'bg-[var(--success)]/20 border border-[var(--success)]/30',
  'bg-[var(--success)]/45 border border-[var(--success)]/50',
  'bg-[var(--warning)]/55 border border-[var(--warning)]/70',
  'bg-[var(--danger)]/65 border border-[var(--danger)]/80',
];

export default function WorkloadSection() {
  const [threshold, setThreshold] = useState(8);
  const rows = BASE_ROWS;

  const memberCount = rows.length;
  const totalActive = rows.reduce((a, r) => a + r.count, 0);
  const avgUtil = Math.round((totalActive / (memberCount * threshold)) * 100);
  const overAllocated = rows.filter((r) => r.count > threshold).length;
  const available = rows.filter((r) => r.count < threshold * 0.5).length;

  const dist = useMemo(() => {
    const d = { idle: 0, light: 0, normal: 0, heavy: 0, critical: 0 };
    rows.forEach((r) => {
      const pct = r.count / threshold;
      if (pct === 0) d.idle++;
      else if (pct <= 0.5) d.light++;
      else if (pct <= 0.8) d.normal++;
      else if (pct <= 1.0) d.heavy++;
      else d.critical++;
    });
    return d;
  }, [threshold, rows]);

  const balanced = rows.filter((r) => r.count < threshold * 0.75).length;
  const near = rows.filter((r) => r.count >= threshold * 0.75 && r.count <= threshold).length;
  const over = overAllocated;
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - over * 18 - near * 4)));
  const scoreColor = healthScore > 80 ? 'var(--success)' : healthScore > 50 ? 'var(--warning)' : 'var(--danger)';
  const circumference = 2 * Math.PI * 47;
  const dashOffset = circumference - (healthScore / 100) * circumference;

  const distMax = Math.max(dist.idle, dist.light, dist.normal, dist.heavy, dist.critical, 1);
  const distBars = [
    ['Idle', dist.idle, 'var(--bg-elevated)'],
    ['Light', dist.light, 'rgba(45, 212, 191, 0.4)'],
    ['Normal', dist.normal, 'var(--success)'],
    ['Heavy', dist.heavy, 'rgba(251, 191, 36, 0.6)'],
    ['Critical', dist.critical, 'rgba(251, 113, 133, 0.65)'],
  ];

  const kpis = [
    { icon: Users, label: 'Members', value: memberCount, caption: 'across 2 teams', tone: 'text-[var(--info)]', bar: 'var(--info)' },
    { icon: ListTodo, label: 'Active tasks', value: totalActive, caption: 'today', tone: 'text-[var(--accent)]', bar: 'var(--accent)' },
    { icon: TrendingUp, label: 'Avg utilization', value: `${avgUtil}%`, caption: `of ${memberCount * threshold} slots`, tone: 'text-[var(--accent)]', bar: 'var(--accent)' },
    { icon: AlertCircle, label: 'Overloaded', value: overAllocated, caption: `above ${threshold} tasks`, tone: 'text-[var(--danger)]', bar: 'var(--danger)' },
    { icon: Plus, label: 'Available capacity', value: available, caption: 'members free', tone: 'text-[var(--success)]', bar: 'var(--success)' },
  ];

  return (
    <section id="workload" className="py-24 relative overflow-hidden">
      <div className="wrap max-w-[1200px] mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} className="sec-label reveal text-[var(--accent)] text-sm font-semibold tracking-wider uppercase mb-4">
          Workload
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} className="sec-h reveal text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-tight mb-6">
          See who's overloaded,<br />before it becomes a bottleneck.
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} className="sec-sub reveal text-lg text-[var(--text-secondary)] max-w-2xl mb-16">
          Real capacity per member, a live team-health score, the load distribution, and a heatmap that shows the fortnight at a glance.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.7, ease: 'easeOut' }} className="app-stage mt-11 relative">
          <div className="stage-glow absolute inset-0 bg-blue-500/5 blur-[100px] -z-10 rounded-full"></div>
          <div className="appwin max-w-[1000px] mx-auto rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] shadow-2xl overflow-hidden relative">

            <div className="topbar h-12 border-b border-[var(--border-subtle)] flex items-center justify-between px-4 bg-[var(--bg-subtle)]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
              <div className="tb-search flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--bg-base)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] w-64 justify-center shadow-inner">
                <Search size={14} /> Search or jump to… <span className="kb px-1 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[10px] ml-2">⌘K</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-bold ring-2 ring-[var(--bg-base)]">U</div>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[var(--accent)] font-medium uppercase tracking-wider mb-2"><Gauge size={13} /> Resource Capacity</div>
                  <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">Team Capacity &amp; Utilization</h2>
                  <div className="text-sm text-[var(--text-secondary)]">Monitor team load balance and task allocation bottlenecks across the organization.</div>
                </div>
                <div className="flex items-center gap-2 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-subtle)] px-2 py-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] font-mono mr-1">Threshold</span>
                  <button onClick={() => setThreshold((t) => Math.max(2, t - 1))} className="w-6 h-6 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors" aria-label="Decrease threshold">−</button>
                  <span className="font-mono font-bold text-sm min-w-[20px] text-center">{threshold}</span>
                  <button onClick={() => setThreshold((t) => Math.min(20, t + 1))} className="w-6 h-6 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors" aria-label="Increase threshold">+</button>
                </div>
              </div>

              {/* KPI strip — OrgSnapshotBanner */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-8">
                {kpis.map((k) => (
                  <div key={k.label} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: k.bar }} />
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] font-mono mb-2"><k.icon size={12} className={k.tone} /> {k.label}</div>
                    <div className={`text-xl font-bold tabular-nums ${k.tone}`}>{k.value}</div>
                    <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{k.caption}</div>
                  </div>
                ))}
              </div>

              {/* Team pulse */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold">Team pulse</span>
                <span className="text-[8.5px] uppercase tracking-widest font-mono text-[var(--text-tertiary)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">Live</span>
                <span className="ml-auto text-[10px] text-[var(--text-tertiary)]">updated 2 min ago</span>
              </div>
              <div className="grid md:grid-cols-[1.55fr_1fr] gap-3 mb-8">
                {/* Team Health */}
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-semibold">Team Health Score</span>
                    <span className="ml-auto font-mono text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">0–100</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="relative w-[104px] h-[104px] shrink-0">
                      <svg viewBox="0 0 104 104" className="w-[104px] h-[104px] -rotate-90">
                        <circle cx="52" cy="52" r="47" fill="none" stroke="var(--bg-subtle)" strokeWidth="10" />
                        <circle cx="52" cy="52" r="47" fill="none" stroke={scoreColor} strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-mono text-2xl font-bold leading-none" style={{ color: scoreColor }}>{healthScore}</span>
                        <span className="font-mono text-[9px] text-[var(--text-tertiary)] mt-0.5">/ 100</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      {[
                        ['Balanced', balanced, 'var(--success)'],
                        ['Near capacity', near, 'var(--warning)'],
                        ['Overloaded', over, 'var(--danger)'],
                      ].map(([label, count, color]) => (
                        <div key={label} className="flex items-center gap-2">
                          <span className="text-[11px] text-[var(--text-secondary)] w-[92px] shrink-0">{label}</span>
                          <div className="flex-1 h-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: `${(count / memberCount) * 100}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: color }} />
                          </div>
                          <span className="font-mono text-[11px] font-bold w-5 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* AI Insights */}
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
                  <div className="flex items-center gap-2 font-semibold text-sm mb-3"><Brain size={16} className="text-[var(--accent)]" /> AI Insights</div>
                  <div className="space-y-2">
                    {overAllocated > 0 && (
                      <div className="flex items-center gap-2 p-2.5 bg-[var(--bg-subtle)] rounded-lg text-xs"><span className="w-2 h-2 rounded-full bg-[var(--danger)] flex-none" /><span className="flex-1 text-[var(--text-secondary)]">{overAllocated} members are overloaded.</span></div>
                    )}
                    {available > 0 && overAllocated > 0 && (
                      <div className="flex items-center gap-2 p-2.5 bg-[var(--bg-subtle)] rounded-lg text-xs"><span className="w-2 h-2 rounded-full bg-[var(--success)] flex-none" /><span className="flex-1 text-[var(--text-secondary)]">{available} members can absorb rebalanced tasks.</span></div>
                    )}
                    <div className="flex items-center gap-2 p-2.5 bg-[var(--bg-subtle)] rounded-lg text-xs"><span className="w-2 h-2 rounded-full bg-[var(--success)] flex-none" /><span className="flex-1 text-[var(--text-secondary)]">Average utilization is {avgUtil}%.</span></div>
                  </div>
                </div>
              </div>

              {/* Load shape */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold">Load shape</span>
                <span className="text-[8.5px] uppercase tracking-widest font-mono text-[var(--text-tertiary)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">Analytics</span>
              </div>
              <div className="grid md:grid-cols-2 gap-3 mb-8">
                {/* DistributionChart */}
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-semibold">Workload Distribution</span>
                    <span className="ml-auto font-mono text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">vs threshold</span>
                  </div>
                  <div className="space-y-3">
                    {distBars.map(([label, count, color]) => (
                      <div key={label} className="grid grid-cols-[58px_1fr_24px] items-center gap-2.5">
                        <span className="text-xs text-[var(--text-secondary)]">{label}</span>
                        <div className="h-2.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${(count / distMax) * 100}%` }} transition={{ duration: 0.7 }} className="h-full rounded-full" style={{ background: color }} />
                        </div>
                        <span className="font-mono text-xs font-bold text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* RebalanceSimulator */}
                <div className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)]/10 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Wand2 size={14} className="text-[var(--accent)]" />
                    <span className="text-xs font-semibold">Rebalance Simulator</span>
                    <span className="ml-auto font-mono text-[9px] uppercase tracking-widest text-[var(--text-tertiary)]">what-if</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mb-4">
                    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-2.5">
                      <div className="text-[9px] uppercase tracking-wider font-mono text-[var(--text-tertiary)] mb-1.5">From · Overloaded</div>
                      <div className="text-sm font-semibold">Priya Sharma</div>
                    </div>
                    <span className="w-7 h-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center"><ArrowRight size={14} /></span>
                    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-2.5">
                      <div className="text-[9px] uppercase tracking-wider font-mono text-[var(--text-tertiary)] mb-1.5">To · Available</div>
                      <div className="text-sm font-semibold">Lin Chen</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { name: 'Priya Sharma', before: 11, after: 9, tone: 'var(--danger)', delta: 'Δ −2', verdict: 'under threshold' },
                      { name: 'Lin Chen', before: 3, after: 5, tone: 'var(--success)', delta: 'Δ +2', verdict: 'headroom left' },
                    ].map((r) => (
                      <div key={r.name} className="rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] p-2.5">
                        <div className="text-xs font-medium truncate mb-2">{r.name}</div>
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-[var(--text-tertiary)] mb-1">
                          <span className="shrink-0">Before</span>
                          <div className="flex-1 h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(100, (r.before / threshold) * 100)}%`, background: r.tone }} /></div>
                          <b>{r.before}</b>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-[var(--text-tertiary)] mb-1">
                          <span className="shrink-0">After</span>
                          <div className="flex-1 h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(100, (r.after / threshold) * 100)}%`, background: r.tone }} /></div>
                          <b>{r.after}</b>
                        </div>
                        <div className="flex justify-between font-mono text-[8px] text-[var(--text-tertiary)]"><span>{r.delta}</span><span>{r.verdict}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Heatmap */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold">14-day capacity heatmap</span>
                <span className="text-[8.5px] uppercase tracking-widest font-mono text-[var(--text-tertiary)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">History</span>
                <span className="ml-auto text-[10px] text-[var(--text-tertiary)]">hover cells for detail</span>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 mb-8">
                <div className="grid grid-cols-14 gap-1">
                  {HEATMAP.flat().map((level, i) => (
                    <div key={i} className={`relative aspect-square rounded-[4px] ${HEAT_CLS[level]}`} title={`${HEAT_LABELS[level]} load`} />
                  ))}
                </div>
                <div className="flex justify-end items-center gap-3 mt-3 text-[8px] uppercase tracking-wider font-mono text-[var(--text-tertiary)]">
                  <span className="flex items-center gap-1"><i className={`w-2.5 h-2.5 rounded ${HEAT_CLS[0]}`} /> Empty</span>
                  <span className="flex items-center gap-1"><i className={`w-2.5 h-2.5 rounded ${HEAT_CLS[1]}`} /> Light</span>
                  <span className="flex items-center gap-1"><i className={`w-2.5 h-2.5 rounded ${HEAT_CLS[2]}`} /> Normal</span>
                  <span className="flex items-center gap-1"><i className={`w-2.5 h-2.5 rounded ${HEAT_CLS[3]}`} /> Heavy</span>
                  <span className="flex items-center gap-1"><i className={`w-2.5 h-2.5 rounded ${HEAT_CLS[4]}`} /> Max</span>
                </div>
              </div>

              {/* Member capacity */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold">Member capacity</span>
                <span className="text-[8.5px] uppercase tracking-widest font-mono text-[var(--text-tertiary)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">Roster</span>
                <span className="ml-auto font-mono text-[10px] text-[var(--text-tertiary)]">showing {memberCount} of {memberCount} members</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rows.map((r) => {
                  const pct = Math.min(100, Math.round((r.count / threshold) * 100));
                  const status = r.count > threshold ? 'Over' : r.count >= threshold * 0.75 ? 'Near' : 'OK';
                  const stCls = status === 'Over' ? 'text-[var(--danger)] bg-[var(--danger-soft)]' : status === 'Near' ? 'text-[var(--warning)] bg-[var(--warning-soft)]' : 'text-[var(--success)] bg-[var(--success-soft)]';
                  const barColor = r.count > threshold ? 'var(--danger)' : r.count >= threshold * 0.75 ? 'var(--warning)' : 'var(--success)';
                  return (
                    <div key={r.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0" style={{ background: `hsl(${r.hue} 60% 48%)` }}>{r.name.charAt(0)}</span>
                        <div className="min-w-0"><div className="text-[13px] font-semibold leading-tight truncate">{r.name}</div><div className="text-[10px] text-[var(--text-tertiary)]">{r.role}</div></div>
                        <span className={`ml-auto text-[8.5px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded ${stCls}`}>{status}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] mb-1.5"><span>Active tasks</span><b className="font-mono text-base">{r.count}</b></div>
                      <div className="h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: barColor }} /></div>
                      <div className="mt-1.5 font-mono text-[9px] text-[var(--text-tertiary)]">· {r.count} / {threshold} threshold</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-center text-xs text-[var(--text-tertiary)] font-mono uppercase tracking-widest">V1 · Capacity Command · workload view</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
