import React, { useRef, useCallback, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Lock, Plus, Search, Pin, Clock, ShieldAlert } from '@/shared/ui/Icons';
import { roleHue } from '../entities/constants';

const MIN_WIDTH = 180;
const MAX_WIDTH = 320;
const DEFAULT_WIDTH = 232;

export function RoleSidebar({ roles, selectedRole, onSelectRole, onCreateClick, searchQuery, onSearchChange, pinnedRoleIds = new Set(), onTogglePin, recentRoleIds = [], permissionMap = null, resizable = true }) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const dragState = useRef(null);

  const startResize = useCallback((e) => {
    dragState.current = { startX: e.clientX, startWidth: width };
    const onMove = (ev) => {
      if (!dragState.current) return;
      const delta = ev.clientX - dragState.current.startX;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragState.current.startWidth + delta));
      setWidth(next);
    };
    const onUp = () => { dragState.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [width]);

  const filtered = searchQuery.trim() ? roles.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase())) : roles;
  const pinned = filtered.filter((r) => pinnedRoleIds.has(r.id));
  const recent = !searchQuery.trim() ? recentRoleIds.map((id) => roles.find((r) => r.id === id)).filter((r) => r && !pinnedRoleIds.has(r.id)) : [];
  const recentIds = new Set(recent.map((r) => r.id));
  const rest = filtered.filter((r) => !pinnedRoleIds.has(r.id) && !recentIds.has(r.id));
  const maxPermCount = useMemo(() => Math.max(1, ...roles.map((r) => r.permissions?.length ?? 0)), [roles]);

  // Rank by priority (lower number = higher authority), 01-based
  const rankMap = useMemo(() => {
    const sorted = [...roles].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
    const map = {};
    sorted.forEach((r, i) => { map[r.id] = i + 1; });
    return map;
  }, [roles]);

  return (
    <div className="relative flex h-full shrink-0 w-full" style={resizable ? { width } : undefined}>
      <div className="flex flex-col h-full w-full bg-[var(--bg-card)] text-left select-none overflow-hidden min-h-0">
        <div className="px-3.5 pt-3.5 pb-2 flex items-center justify-between shrink-0">
          <span className="text-[10.5px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Roles</span>
          <span className="text-[10px] font-mono font-medium text-[var(--text-muted)] bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded">{roles.length}</span>
        </div>
        <div className="px-2.5 pb-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="Filter roles..." className="pl-8 h-7 text-[12px] rounded-md border-[var(--border-subtle)] bg-[var(--bg-subtle)]/40 focus:bg-[var(--bg-card)] transition-colors" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-1.5 min-h-0">
          {pinned.length > 0 && <RoleGroup label="Pinned" icon={Pin}>{pinned.map((role, i) => <RoleItem key={role.id} role={role} isSelected={selectedRole?.id === role.id} isPinned onSelect={() => onSelectRole(role)} onTogglePin={() => onTogglePin(role.id)} delay={i} permissionMap={permissionMap} maxPermCount={maxPermCount} rank={rankMap[role.id]} />)}</RoleGroup>}
          {recent.length > 0 && <RoleGroup label="Recent" icon={Clock}>{recent.map((role, i) => <RoleItem key={role.id} role={role} isSelected={selectedRole?.id === role.id} isPinned={false} onSelect={() => onSelectRole(role)} onTogglePin={() => onTogglePin(role.id)} delay={i} permissionMap={permissionMap} maxPermCount={maxPermCount} rank={rankMap[role.id]} />)}</RoleGroup>}
          <RoleGroup label={pinned.length || recent.length ? 'All Roles' : null}>
            {rest.map((role, i) => <RoleItem key={role.id} role={role} isSelected={selectedRole?.id === role.id} isPinned={false} onSelect={() => onSelectRole(role)} onTogglePin={() => onTogglePin(role.id)} delay={i} permissionMap={permissionMap} maxPermCount={maxPermCount} rank={rankMap[role.id]} />)}
          </RoleGroup>
          {filtered.length === 0 && <div className="p-4 text-center text-[12px] text-[var(--text-muted)]">No roles match.</div>}
        </div>
        <div className="p-2 border-t border-[var(--border-subtle)] shrink-0">
          <Button variant="ghost" size="sm" onClick={onCreateClick} className="w-full justify-start text-[12px] text-[var(--text-secondary)] hover:text-[var(--accent)] h-7 px-2"><Plus className="w-3.5 h-3.5 mr-1.5" /> New Role</Button>
        </div>
      </div>
      {resizable && <div onMouseDown={startResize} className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-[var(--accent)]/40 transition-colors z-10" />}
    </div>
  );
}

function RoleGroup({ label, icon: Icon, children }) {
  if (React.Children.count(children) === 0) return null;
  return (
    <div className="mb-2">
      {label && <div className="flex items-center gap-1.5 px-2 py-1">{Icon && <Icon className="w-3 h-3 text-[var(--text-muted)]" />}<span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">{label}</span></div>}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function RoleItem({ role, isSelected, isPinned, onSelect, onTogglePin, delay = 0, permissionMap, maxPermCount = 1, rank }) {
  const permCount = role.permissions?.length ?? 0;
  const coverage = Math.min(100, Math.round((permCount / maxPermCount) * 100));
  const criticalCount = useMemo(() => {
    if (!permissionMap) return 0;
    let n = 0;
    (role.permissions || []).forEach((p) => { const meta = permissionMap.get(p.permissionCode || p.code); if (meta?.riskLevel === 'CRITICAL' || meta?.riskLevel === 'HIGH') n++; });
    return n;
  }, [role.permissions, permissionMap]);

  const hue = roleHue(role.name);
  const monogram = role.name.slice(0, 2);
  const rankLabel = rank ? String(rank).padStart(2, '0') : '--';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay * 0.02, duration: 0.12 }} className={cn('group w-full text-left px-2.5 py-2 rounded-md transition-colors cursor-pointer', isSelected ? 'bg-[var(--accent-soft)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]')} onClick={onSelect}>
      <div className="flex items-center gap-2">
        <span className="w-4 text-right font-mono text-[9px] font-bold text-[var(--text-muted)] shrink-0">{rankLabel}</span>
        <span className="w-6 h-6 rounded-md flex items-center justify-center font-mono text-[9px] font-bold shrink-0" style={{ backgroundColor: hue + '1c', color: hue }}>
          {monogram}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={cn('text-[13px] truncate', isSelected ? 'font-semibold text-[var(--text-primary)]' : '')}>{role.name}</span>
            {criticalCount > 0 && <ShieldAlert className="w-3 h-3 shrink-0 text-[var(--danger)]" aria-label={`${criticalCount} elevated permissions`} />}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {role.name === 'ADMIN' ? <Lock className="w-3 h-3 text-[var(--text-muted)]" /> : (
            <button onClick={(e) => { e.stopPropagation(); onTogglePin(); }} className={cn('p-0.5 rounded transition-opacity', isPinned ? 'opacity-100 text-[var(--accent)]' : 'opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--text-primary)]')} title={isPinned ? 'Unpin role' : 'Pin role'}>
              <Pin className="w-3 h-3" fill={isPinned ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 pl-10 mt-1.5">
        <div className="flex-1 h-1 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${coverage}%`, backgroundColor: isSelected ? 'var(--accent)' : 'var(--text-muted)', opacity: isSelected ? 1 : 0.5 }} />
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">{permCount} P{role.priority ?? 0}</span>
      </div>
    </motion.div>
  );
}
