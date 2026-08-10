import React from "react";
import { cn } from "@/shared/lib/cn";
import { Calendar, Clock } from "lucide-react";

export function DashboardUpcoming({ upcomingDeadlines = [] }) {
  if (!upcomingDeadlines || upcomingDeadlines.length === 0) {
    return (
      <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={15} strokeWidth={1.5} className="text-[var(--accent)]" />
          <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">Upcoming</h3>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] py-2">No upcoming deadlines.</p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={15} strokeWidth={1.5} className="text-[var(--accent)]" />
        <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">Upcoming</h3>
      </div>
      <div className="space-y-0.5">
        {upcomingDeadlines.slice(0, 4).map((d, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg",
              "hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Clock size={12} strokeWidth={1.5} className="text-[var(--text-tertiary)] shrink-0" />
              <span className="text-[12px] font-medium text-[var(--text-primary)] truncate">
                {d.title}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-tertiary)] tabular-nums shrink-0 ml-3">
              {d.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
