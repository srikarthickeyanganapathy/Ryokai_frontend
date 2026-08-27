import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { GitCommitHorizontal, ExternalLink, RefreshCw } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/Badge';
import { Skeleton } from '@/shared/ui/Skeleton';

const HUES = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#6366f1'];

function CommitAvatar({ commit }) {
  if (commit.avatarUrl) {
    return (
      <img
        src={commit.avatarUrl}
        alt="" /* decorative — author name is rendered right next to it */
        loading="lazy"
        className="h-7 w-7 shrink-0 rounded-full ring-1 ring-[var(--border-subtle)]"
      />
    );
  }
  const login = commit.authorLogin || commit.authorName || '?';
  const hue = HUES[login.charCodeAt(0) % HUES.length];
  return (
    <div aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: hue }}>
      {login.slice(0, 2).toUpperCase()}
    </div>
  );
}

function relativeTime(iso) {
  if (!iso) return '';
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '';
  }
}

function absoluteTime(iso) {
  if (!iso) return undefined;
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return undefined;
  }
}

export function CommitList({ commits, isLoading, onRefreshAll, isRefreshing }) {
  const branches = useMemo(() => [...new Set(commits.map((c) => c.branch).filter(Boolean))], [commits]);
  const [branch, setBranch] = useState('all');

  const filtered = useMemo(
    () => (branch === 'all' ? commits : commits.filter((c) => c.branch === branch)),
    [commits, branch]
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Live region: announces loading, syncing, and filter result counts */}
      <p className="sr-only" role="status">
        {isRefreshing
          ? 'Syncing commits…'
          : isLoading
          ? 'Loading commits…'
          : `${filtered.length} ${filtered.length === 1 ? 'commit' : 'commits'}${branch !== 'all' ? ` on ${branch}` : ''}`}
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {branches.length > 1 && (
          <div
            role="group"
            aria-label="Filter commits by branch"
            className="flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-1"
          >
            {['all', ...branches].map((b) => (
              <button
                key={b}
                onClick={() => setBranch(b)}
                aria-pressed={branch === b}
                className={cn(
                  'rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-colors duration-150',
                  branch === b
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                )}
              >
                {b}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={onRefreshAll}
          disabled={isRefreshing}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 px-2.5 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--text-primary)] disabled:opacity-45"
        >
          <RefreshCw className={cn('h-3.5 w-3.5 motion-reduce:animate-none', isRefreshing && 'animate-spin')} strokeWidth={1.5} aria-hidden="true" />
          {isRefreshing ? 'Syncing…' : 'Sync'}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1" aria-busy={isLoading}>
        {isLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] p-3.5">
                <Skeleton className="h-7 w-7 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-1/2" />
                  <div className="mt-2">
                    <Skeleton className="h-2.5 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center rounded-xl border border-dashed border-[var(--border-subtle)] px-6 py-14 text-center"
          >
            <div className="relative">
              <div aria-hidden="true" className="absolute inset-0 rounded-full bg-[var(--accent)]/15 blur-md" />
              <GitCommitHorizontal className="relative h-6 w-6 text-[var(--accent)]" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <p className="mt-3 text-[13px] font-semibold text-[var(--text-primary)]">No commits yet</p>
            <p className="mt-1 max-w-xs text-[12px] text-[var(--text-tertiary)]">
              Push to GitHub and hit Sync — commits land here in near real time.
            </p>
          </motion.div>
        ) : (
          <ul className="space-y-1.5">
            {filtered.map((commit, i) => (
              <motion.li
                key={commit.sha}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.35), duration: 0.25 }}
                className="group flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-3.5 transition-colors duration-150 hover:border-[var(--accent-border)]"
              >
                <CommitAvatar commit={commit} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="truncate text-[13px] font-medium text-[var(--text-primary)]"
                      title={commit.message}
                    >
                      {commit.message?.split('\n')[0] || '(no message)'}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-[var(--text-tertiary)]">
                    <span className="font-mono text-[var(--text-secondary)]">{commit.sha?.slice(0, 7)}</span>
                    <span>{commit.authorName || commit.authorLogin || 'unknown'}</span>
                    {commit.branch && (
                      <Badge variant="outline" size="xs" className="font-mono">{commit.branch}</Badge>
                    )}
                    {commit.committedAt && (
                      <time dateTime={commit.committedAt} title={absoluteTime(commit.committedAt)}>
                        {relativeTime(commit.committedAt)}
                      </time>
                    )}
                  </div>
                </div>
                {commit.htmlUrl && (
                  <a
                    href={commit.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md p-1.5 text-[var(--text-tertiary)] opacity-0 transition-all duration-150 hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus-visible:opacity-100 group-hover:opacity-100"
                    aria-label={`Open commit ${commit.sha?.slice(0, 7)} on GitHub (opens in a new tab)`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                  </a>
                )}
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}