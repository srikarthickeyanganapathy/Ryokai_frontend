import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Lock, Plus, Search, Shield } from 'lucide-react';

export function RoleSidebar({
  roles,
  selectedRole,
  onSelectRole,
  onCreateClick,
  searchQuery,
  onSearchChange,
}) {
  const filtered = searchQuery.trim()
    ? roles.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : roles;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] text-left select-none">
      <div className="px-3 pt-3 pb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Roles
        </span>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">
          {roles.length}
        </span>
      </div>

      <div className="px-2.5 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter roles..."
            className="pl-8 h-7 text-[12px] rounded-md border-[var(--border-subtle)] bg-[var(--bg-subtle)]/40"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1.5 space-y-0.5 min-h-0">
        {filtered.map((role, i) => {
          const isSelected = selectedRole?.id === role.id;
          const permCount = role.permissions?.length ?? 0;
          return (
            <motion.button
              key={role.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02, duration: 0.12 }}
              onClick={() => onSelectRole(role)}
              className={cn(
                'w-full text-left px-2.5 py-2 rounded-md transition-colors flex items-center justify-between gap-2',
                isSelected
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Shield
                    className={cn('w-3.5 h-3.5 shrink-0', isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')}
                  />
                  <span className={cn('text-[13px] truncate', isSelected && 'font-semibold')}>
                    {role.name}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[var(--text-muted)] pl-5 mt-0.5">
                  {permCount} perms · P{role.priority ?? 0}
                </div>
              </div>

              {role.name === 'ADMIN' && (
                <Lock className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
              )}
            </motion.button>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-4 text-center text-[12px] text-[var(--text-muted)]">
            No roles match.
          </div>
        )}
      </div>

      <div className="p-2 border-t border-[var(--border-subtle)]">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateClick}
          className="w-full justify-start text-[12px] text-[var(--text-secondary)] hover:text-[var(--accent)] h-7 px-2"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> New Role
        </Button>
      </div>
    </div>
  );
}