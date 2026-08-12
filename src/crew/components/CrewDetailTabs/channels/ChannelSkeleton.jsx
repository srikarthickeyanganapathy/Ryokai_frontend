import React from 'react';

/* Loading skeleton (State 1) shown when initial channels are still loading. */
export function ChannelSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-170px)] min-h-[580px] animate-pulse">
      <div className="lg:col-span-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-4">
        <div className="h-4 bg-[var(--bg-hover)] rounded w-1/2" />
        <div className="h-8 bg-[var(--bg-hover)] rounded-lg w-full" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 bg-[var(--bg-hover)] rounded-lg w-full" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col justify-between">
        <div className="h-10 bg-[var(--bg-hover)] rounded-lg w-full" />
        <div className="space-y-4 py-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-xl bg-[var(--bg-hover)]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[var(--bg-hover)] rounded w-1/4" />
                <div className="h-4 bg-[var(--bg-hover)] rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-10 bg-[var(--bg-hover)] rounded-lg w-full" />
      </div>
      <div className="lg:col-span-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3">
        <div className="h-4 bg-[var(--bg-hover)] rounded w-1/3" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--bg-hover)]" />
            <div className="h-3 bg-[var(--bg-hover)] rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
