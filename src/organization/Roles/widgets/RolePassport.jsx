import React from 'react';
import { cn } from '@/shared/lib/cn';
import { ShieldAlert } from '@/shared/ui/Icons';
import { roleHue, rolePurpose } from '../entities/constants';

export function RolePassport({ role, isAdmin = false, stats = { read: 0, write: 0, workflow: 0, critical: 0 }, enabledCount = 0, totalCount = 0, supervisionNames = [] }) {
  if (!role) return null;
  const hue = roleHue(role.name);
  const monogram = role.name.slice(0, 2);
  const coverage = totalCount > 0 ? Math.min(100, Math.round((enabledCount / totalCount) * 100)) : 0;
  const C = 2 * Math.PI * 42;
  const riskPct = enabledCount > 0 ? Math.min(100, Math.round((stats.critical / enabledCount) * 100)) : 0;

  return (
    <aside className="rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 lg:sticky lg:top-0">
      <div className="relative w-[108px] h-[108px] mx-auto mb-4">
        <svg className="absolute inset-0" viewBox="0 0 108 108">
          <circle className="track" cx="54" cy="54" r="42" fill="none" stroke="var(--bg-subtle)" strokeWidth="4.5" />
          <circle
            className="arc"
            cx="54"
            cy="54"
            r="42"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - coverage / 100)}
            transform="rotate(-90 54 54)"
          />
        </svg>
        <span className="absolute inset-[9px] rounded-full flex items-center justify-center font-mono text-[21px] font-bold" style={{ backgroundColor: isAdmin ? 'var(--warning-soft)' : hue + '1c', color: isAdmin ? 'var(--warning)' : hue }}>
          {monogram}
        </span>
      </div>

      <div className="text-center">
        <div className="font-mono font-bold text-[15px] tracking-wide text-[var(--text-primary)]">{role.name}</div>
        <p className="text-[11.5px] leading-relaxed text-[var(--text-secondary)] mt-1.5">{rolePurpose(role.name)}</p>
        <div className="text-[11px] text-[var(--text-muted)] mt-1.5">
          Priority <strong className="text-[var(--text-secondary)] font-semibold font-mono">{role.priority ?? 100}</strong>
          {isAdmin && <span className="ml-2 text-[var(--warning)] font-semibold">· System</span>}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 mt-4">
        <PassportChip label="ON" value={`${enabledCount}/${totalCount}`} color="var(--text-primary)" />
        <PassportChip label="READ" value={stats.read} color="var(--success)" />
        <PassportChip label="WRITE" value={stats.write} color="var(--warning)" />
        <PassportChip label="FLOW" value={stats.workflow} color="var(--accent)" />
        <PassportChip label="RISK" value={stats.critical} color="var(--danger)" />
      </div>

      <div className="mt-4 rounded-xl bg-[var(--bg-subtle)] p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-mono font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">Risk exposure</span>
          <span className={cn('text-[9px] font-mono font-bold uppercase tracking-[0.1em]', stats.critical > 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]')}>
            {stats.critical > 0 ? `${stats.critical} elevated` : 'Low'}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${riskPct}%`, background: riskPct > 50 ? 'var(--danger)' : riskPct > 0 ? 'var(--warning)' : 'var(--success)' }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[8px] font-mono uppercase tracking-[0.06em] text-[var(--text-muted)]">
          <span>Safe</span><span>Caution</span><span>Critical</span>
        </div>
      </div>

      <div className="mt-4 pt-3.5 border-t border-[var(--border-subtle)]">
        <span className="block text-[9px] font-mono font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-2">Outranks</span>
        <div className="flex flex-wrap gap-1.5">
          {supervisionNames.length > 0 ? (
            supervisionNames.map((name) => (
              <span key={name} className="text-[10px] font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-2 py-1 rounded-md">{name}</span>
            ))
          ) : (
            <span className="text-[10px] italic text-[var(--text-muted)]">No one — lowest rank</span>
          )}
        </div>
      </div>

      {stats.critical > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--danger-soft)] px-3 py-2.5">
          <ShieldAlert className="w-3.5 h-3.5 text-[var(--danger)] shrink-0" />
          <span className="text-[10.5px] font-medium text-[var(--danger)]">Holds {stats.critical} elevated permission{stats.critical === 1 ? '' : 's'} — watch the red levels.</span>
        </div>
      )}
    </aside>
  );
}

function PassportChip({ label, value, color }) {
  return (
    <span className="font-mono text-[9.5px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-2 py-1 rounded-md">
      {label} <strong style={{ color }}>{value}</strong>
    </span>
  );
}
