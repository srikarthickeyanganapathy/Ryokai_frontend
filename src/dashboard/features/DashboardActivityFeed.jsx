import React from "react";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/Badge";
import { Clock, TrendingUp, Sparkles } from "lucide-react";

export function DashboardActivityFeed({ recentActivities = [] }) {
  if (!recentActivities || recentActivities.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={15} strokeWidth={1.5} className="text-[var(--accent)]" />
          <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">Recent Activity</h3>
        </div>
        <div className="text-center py-8">
          <Sparkles className="w-5 h-5 mx-auto mb-2 text-[var(--text-tertiary)]" strokeWidth={1.5} />
          <p className="text-xs text-[var(--text-tertiary)]">No recent activity yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={15} strokeWidth={1.5} className="text-[var(--accent)]" />
          <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">Recent Activity</h3>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          {recentActivities.length}
        </Badge>
      </div>
      <div className="space-y-0">
        {recentActivities.slice(0, 6).map((a, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg",
              "hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            )}
          >
            <div className="w-7 h-7 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center shrink-0">
              {a.icon || <Clock size={13} strokeWidth={1.5} className="text-[var(--text-tertiary)]" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-[var(--text-primary)] truncate">
                {a.title}
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)]">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
