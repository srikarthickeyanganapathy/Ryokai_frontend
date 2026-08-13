import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Lock, Globe, Search } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/Badge';

export function RepoList({ repos, selectedFullName, onSelect, isLoading }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return repos;
    const q = query.toLowerCase();
    return repos.filter((r) => r.fullName.toLowerCase().includes(q));
  }, [repos, query]);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40">
      <div className="border-b border-[var(--border-subtle)] p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter repositories…"
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] py-1.5 pl-8 pr-3 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-colors duration-150 focus:border-[var(--accent-border)]"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg px-2.5 py-3">
              <div className="h-3 w-2/3 rounded bg-[var(--bg-hover)]" />
              <div className="mt-2 h-2 w-1/3 rounded bg-[var(--bg-hover)]" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <GitBranch className="mx-auto h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.5} />
            <p className="mt-2 text-[12px] text-[var(--text-tertiary)]">
              {query ? 'No repos match your filter' : 'No connected repositories'}
            </p>
          </div>
        ) : (
          filtered.map((repo, i) => {
            const active = repo.fullName === selectedFullName;
            return (
              <motion.button
                key={repo.fullName}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.025, 0.3), duration: 0.25 }}
                onClick={() => onSelect(repo.fullName)}
                className={cn(
                  'group mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors duration-150',
                  active ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--bg-hover)]'
                )}
              >
                <div className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150',
                  active ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]' : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                )}>
                  <GitBranch className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={cn('truncate text-[13px] font-medium', active ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]')}>
                    {repo.fullName}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                    {repo.isPrivate ? <Lock className="h-3 w-3" strokeWidth={1.5} /> : <Globe className="h-3 w-3" strokeWidth={1.5} />}
                    <span>{repo.isPrivate ? 'Private' : 'Public'}</span>
                    {repo.defaultBranch && (
                      <>
                        <span className="text-[var(--border-default)]">·</span>
                        <span className="font-mono">{repo.defaultBranch}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {repo.openPullRequests > 0 && (
                    <Badge variant="primary" size="xs" className="tabular-nums">{repo.openPullRequests} open</Badge>
                  )}
                  {repo.mergedPullRequests > 0 && (
                    <Badge size="xs" className="tabular-nums text-[var(--text-tertiary)]">{repo.mergedPullRequests} merged</Badge>
                  )}
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}