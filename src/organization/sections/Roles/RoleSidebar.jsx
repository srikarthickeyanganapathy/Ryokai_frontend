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
    ? roles.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : roles;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] text-left select-none">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
          Roles
        </span>
        <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded-full border border-[var(--border-subtle)]">
          {roles.length}
        </span>
      </div>

      {/* Search */}
      <div className="px-2.5 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter roles..."
            className="pl-8 h-7 text-xs rounded-md border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50"
          />
        </div>
      </div>

      {/* Role list */}
      <div className="flex-1 overflow-y-auto px-1 space-y-0.5 min-h-0">
        {filtered.map((role, i) => {
          const isSelected = selectedRole?.id === role.id;
          const permCount = role.permissions?.length ?? 0;
          return (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02, duration: 0.12 }}
              onClick={() => onSelectRole(role)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-md transition-all duration-150 flex items-center justify-between gap-2 border-l-2',
                isSelected
                  ? 'bg-[var(--accent-soft)]/60 border-[var(--accent)] text-[var(--accent)] font-semibold shadow-2xs'
                  : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Shield
                    className={cn(
                      'w-3.5 h-3.5 shrink-0',
                      isSelected
                        ? 'text-[var(--accent)]'
                        : 'text-[var(--text-muted)]'
                    )}
                  />
                  <span className="text-[13px] truncate">{role.name}</span>
                </div>
                <div className="text-[10px] font-mono text-[var(--text-muted)] pl-5 mt-0.5 flex items-center gap-1">
                  <span>{permCount} perms</span>
                  <span>·</span>
                  <span>Priority {role.priority ?? 0}</span>
                </div>
              </div>

              {role.name === 'ADMIN' && (
                <Lock className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
              )}
            </motion.button>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-4 text-center text-xs text-[var(--text-muted)]">
            No roles match.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-[var(--border-subtle)] space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateClick}
          className="w-full justify-start text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] h-7 px-2"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> New Role
        </Button>
      </div>
    </div>
  );
}
