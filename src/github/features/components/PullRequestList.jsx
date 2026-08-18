import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { GitPullRequest, RefreshCw, ExternalLink } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/Badge';
import { Skeleton } from '@/shared/ui/Skeleton';

const STATE_META = {
  open: { label: 'Open', dot: 'bg-emerald-500', chip: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  merged: { label: 'Merged', dot: 'bg-violet-500', chip: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20' },
  closed: { label: 'Closed', dot: 'bg-rose-500', chip: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'merged', label: 'Merged' },
  { key: 'closed', label: 'Closed' },
];

const HUES = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#6366f1'];

function AuthorAvatar({ login }) {
  const hue = HUES[(login || '?').charCodeAt(0) % HUES.length];
  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ring-1 ring-black/10"
      style={{ background: hue }}
    >
      {(login || '?').slice(0, 2).toUpperCase()}
    </div>
  );
}

function DiffBar({ additions, deletions }) {
  const add = additions || 0;
  const del = deletions || 0;
  const total = add + del;
  if (total === 0) return <span className="text-[11px] tabular-nums text-[var(--text-tertiary)]">±0</span>;
  const addPct = Math.round((add / total) * 100);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex h-1 w-14 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
        <div className="bg-emerald-500/80 transition-all duration-300" style={{ width: `${addPct}%` }} />
        <div className="bg-rose-500/70 transition-all duration-300" style={{ width: `${100 - addPct}%` }} />
      </div>
      <span className="text-[11px] tabular-nums text-emerald-600 dark:text-emerald-400">+{add}</span>
      <span className="text-[11px] tabular-nums text-rose-500">−{del}</span>
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

export function PullRequestList({ pullRequests, isLoading, onRefreshAll, isRefreshing }) {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return pullRequests;
    if (filter === 'merged') return pullRequests.filter((pr) => Boolean(pr.mergedAt));
    return pullRequests.filter((pr) => pr.state === filter);
  }, [pullRequests, filter]);

  const counts = useMemo(() => {
    const c = { open: 0, merged: 0, closed: 0 };
    pullRequests.forEach((pr) => {
      if (pr.mergedAt) c.merged += 1;
      else if (pr.state === 'closed') c.closed += 1;
      else c.open += 1;
    });
    return c;
  }, [pullRequests]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors duration-150',
                filter === f.key
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              )}
            >
              {f.label}
              <span className="ml-1 tabular-nums opacity-60">
                {f.key === 'all' ? pullRequests.length : (counts[f.key] || 0)}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={onRefreshAll}
          disabled={isRefreshing}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 px-2.5 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--text-primary)] disabled:opacity-45"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} strokeWidth={1.5} />
          {isRefreshing ? 'Syncing…' : 'Sync'}
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--border-subtle)] p-3.5">
              <Skeleton className="h-3.5 w-2/3" />
              <div className="mt-2.5 flex gap-2">
                <Skeleton className="h-2.5 w-12" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center rounded-xl border border-dashed border-[var(--border-subtle)] px-6 py-14 text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[var(--accent)]/15 blur-md" />
              <GitPullRequest className="relative h-6 w-6 text-[var(--accent)]" strokeWidth={1.5} />
            </div>
            <p className="mt-3 text-[13px] font-semibold text-[var(--text-primary)]">
              {filter === 'all' ? 'No pull requests yet' : `No ${filter} pull requests`}
            </p>
            <p className="mt-1 max-w-xs text-[12px] text-[var(--text-tertiary)]">
              {filter === 'all'
                ? 'Open a PR on GitHub and hit Sync — it will show up here within seconds.'
                : 'Try a different filter, or sync to pull in fresh activity.'}
            </p>
          </motion.div>
        ) : (
          filtered.map((pr, i) => {
            const meta = STATE_META[pr.mergedAt ? 'merged' : pr.state] || STATE_META.closed;
            return (
              <motion.div
                key={`${pr.number}-${pr.headSha}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.35), duration: 0.25 }}
                className="group rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-3.5 transition-colors duration-150 hover:border-[var(--accent-border)]"
              >
                <div className="flex items-start gap-3">
                  <div className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', meta.dot)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{pr.title || `PR #${pr.number}`}</span>
                      {pr.draft && <Badge variant="secondary" size="xs">Draft</Badge>}
                      <span className="shrink-0 font-mono text-[11px] text-[var(--text-tertiary)]">#{pr.number}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <Badge variant="outline" size="xs" className={cn('border', meta.chip)}>{meta.label}</Badge>
                      <div className="flex items-center gap-1.5">
                        <AuthorAvatar login={pr.authorLogin} />
                        <span className="text-[11px] text-[var(--text-tertiary)]">{pr.authorLogin || 'unknown'}</span>
                      </div>
                      <DiffBar additions={pr.additions} deletions={pr.deletions} />
                      {pr.updatedAt && (
                        <span className="text-[11px] text-[var(--text-tertiary)]">{relativeTime(pr.updatedAt)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    {pr.htmlUrl && (
                      <a
                        href={pr.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md p-1.5 text-[var(--text-tertiary)] transition-colors duration-150 hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                        aria-label="Open on GitHub"
                      >
                        <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}