import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Lock, Globe, Search, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/Badge';

export function RepoList({ repos, selectedFullName, onSelect, isLoading }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return repos;
    const q = query.toLowerCase();
    return repos.filter((r) => r.fullName.toLowerCase().includes(q));
  }, [repos, query]);

  const clearFilter = () => {
    setQuery('');
    // Keep keyboard users where they were instead of dropping focus
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40">
      <div className="border-b border-[var(--border-subtle)] p-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter repositories…"
            aria-label="Filter repositories"
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] py-1.5 pl-8 pr-8 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-colors duration-150 focus:border-[var(--accent-border)]"
          />
          {query && (
            <button
              type="button"
              onClick={clearFilter}
              aria-label="Clear filter"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-[var(--text-tertiary)] transition-colors duration-150 hover:text-[var(--text-primary)]"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          )}
        </div>
        {query && (
          <p aria-hidden="true" className="mt-1.5 px-1 text-[10.5px] tabular-nums text-[var(--text-tertiary)]">
            {filtered.length} of {repos.length} repositor{filtered.length === 1 ? 'y' : 'ies'}
          </p>
        )}
      </div>

      {/* Screen-reader announcements: loading + live filter result counts */}
      <p className="sr-only" role="status">
        {isLoading
          ? 'Loading repositories…'
          : query
          ? `${filtered.length} of ${repos.length} repositories match`
          : ''}
      </p>

      <div className="min-h-0 flex-1 overflow-y-auto p-2" aria-busy={isLoading}>
        {isLoading ? (
          <div aria-hidden="true" className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg px-2.5 py-3">
                <div className="h-3 w-2/3 rounded bg-[var(--bg-hover)]" />
                <div className="mt-2 h-2 w-1/3 rounded bg-[var(--bg-hover)]" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <GitBranch className="mx-auto h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.5} aria-hidden="true" />
            <p className="mt-2 text-[12px] text-[var(--text-tertiary)]">
              {query ? 'No repos match your filter' : 'No connected repositories'}
            </p>
            {query && (
              <button
                type="button"
                onClick={clearFilter}
                className="mt-2.5 rounded-lg border border-[var(--border-subtle)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--text-primary)]"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <ul aria-label="Repositories">
            {filtered.map((repo, i) => {
              const active = repo.fullName === selectedFullName;
              return (
                <li key={repo.fullName}>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.025, 0.3), duration: 0.25 }}
                    onClick={() => onSelect(repo.fullName)}
                    aria-current={active ? 'true' : undefined}
                    title={repo.fullName}
                    className={cn(
                      'group mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors duration-150',
                      active ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--bg-hover)]'
                    )}
                  >
                    <div
                      aria-hidden="true"
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150',
                        active
                          ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                      )}
                    >
                      <GitBranch className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={cn('truncate text-[13px] font-medium', active ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]')}>
                        {repo.fullName}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                        {repo.isPrivate ? (
                          <Lock className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                        ) : (
                          <Globe className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                        )}
                        <span>{repo.isPrivate ? 'Private' : 'Public'}</span>
                        {repo.defaultBranch && (
                          <Badge variant="outline" size="xs" className="font-mono">{repo.defaultBranch}</Badge>
                        )}
                      </div>
                    </div>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}