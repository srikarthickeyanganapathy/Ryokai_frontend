import React, { useMemo } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Search, Plus, ChevronRight, Crown, Lock, ShieldAlert, ShieldCheck } from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';
import { roleHue, rolePurpose } from '../entities/constants';

export function CommandChain({ roles = [], selectedRole, onSelect, onCreateClick, searchQuery = '', onSearchChange, permissionMap = null }) {
  const sorted = useMemo(() => [...roles].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100)), [roles]);
  const q = searchQuery.trim().toLowerCase();
  const filtered = q ? sorted.filter((r) => r.name.toLowerCase().includes(q)) : sorted;

  const criticalOf = (role) => {
    if (!permissionMap) return 0;
    let n = 0;
    (role.permissions || []).forEach((p) => {
      const meta = permissionMap.get(p.permissionCode || p.code);
      if (meta && (meta.riskLevel === 'CRITICAL' || meta.riskLevel === 'HIGH')) n++;
    });
    return n;
  };

  return (
    <div className="mx-auto max-w-[860px] px-1">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="Find a role..." className="pl-8 h-8 text-[12.5px] rounded-lg border-[var(--border-subtle)] bg-[var(--bg-card)] focus:bg-[var(--bg-card)] transition-colors" />
        </div>
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          <strong className="text-[var(--text-secondary)] font-semibold">{filtered.length}</strong> link{filtered.length === 1 ? '' : 's'}   rank 01 = highest authority
        </span>
        <div className="flex-1" />
        <Button variant="primary" size="sm" onClick={onCreateClick} className="text-[12px] h-8 px-3.5">
          <Plus className="w-3.5 h-3.5 mr-1" /> New Role
        </Button>
      </div>

      <div className="relative pb-2">
        <div className="absolute left-[86px] top-2 bottom-2 w-px bg-[var(--border-subtle)]" />
        {filtered.map((role, i) => {
          const isSel = selectedRole?.id === role.id;
          const hue = roleHue(role.name);
          const monogram = role.name.slice(0, 2);
          const crit = criticalOf(role);
          const grantCount = role.permissions?.length ?? 0;
          return (
            <div key={role.id} className="relative flex items-center gap-5 py-1.5">
              <span className="w-10 text-right font-mono text-[11px] font-bold text-[var(--text-muted)] shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <span className={cn('absolute left-[84px] w-2 h-2 rounded-full border-2 bg-[var(--bg-primary)] transition-colors', isSel ? 'border-[var(--accent)]' : 'border-[var(--border-strong)]')} />
              <button
                onClick={() => onSelect(role)}
                className={cn('relative flex-1 min-w-0 flex items-center gap-3.5 rounded-2xl border px-4 py-3 text-left transition-all', isSel ? 'border-[var(--accent)]/40 bg-[var(--accent-soft)]' : 'border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent)]/40 hover:shadow-md hover:translate-x-0.5')}
              >
                {i === 0 && <Crown className="w-3.5 h-3.5 text-[var(--warning)] absolute -top-2 right-3" />}
                <span className="w-10 h-10 rounded-[13px] flex items-center justify-center font-mono font-bold text-[12px] shrink-0" style={{ backgroundColor: hue + '1c', color: hue }}>
                  {monogram}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] truncate">{role.name}</span>
                    {role.name === 'ADMIN' && <Lock className="w-3 h-3 text-[var(--text-muted)] shrink-0" />}
                  </span>
                  <span className="block text-[13px] font-semibold text-[var(--text-primary)] mt-0.5 truncate">{rolePurpose(role.name)}</span>
                  <span className="block text-[10.5px] text-[var(--text-muted)] mt-0.5">{grantCount} grants   priority {role.priority ?? 100}</span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  {role.name === 'ADMIN' ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-[var(--warning)] bg-[var(--warning-soft)] px-2 py-1 rounded-md"><span className="w-1 h-1 rounded-full bg-[var(--warning)]" />System</span>
                  ) : crit > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-[var(--danger)] bg-[var(--danger-soft)] px-2 py-1 rounded-md"><ShieldAlert className="w-2.5 h-2.5" />{crit} elevated</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-[var(--success)] bg-[var(--success-soft)] px-2 py-1 rounded-md"><ShieldCheck className="w-2.5 h-2.5" />Safe</span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </span>
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-10 text-[12.5px] text-[var(--text-muted)]">No roles match -- try a different search.</div>}
      </div>
    </div>
  );
}
