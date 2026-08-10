import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { useDrawerManager } from "@/shared/workspace-framework";
import { useWorkspace } from "@/app/providers/WorkspaceProvider";
import { CheckCircle2, Clock, ArrowRight, Target } from "lucide-react";

export function DashboardFocusCard({ focusTask }) {
  const { open } = useDrawerManager();
  const { workspaceMode, activeCrew } = useWorkspace();

  // Empty state — calm, reassuring
  if (!focusTask) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-subtle)]/30 text-center">
        <CheckCircle2 className="w-8 h-8 mb-3 text-[var(--text-tertiary)]" strokeWidth={1.5} />
        <p className="text-sm font-medium text-[var(--text-secondary)]">All clear.</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-xs">
          No items need your attention right now. Take a moment or plan ahead.
        </p>
      </div>
    );
  }

  return (
    <div
      onClick={() => open("task", { taskId: focusTask.id })}
      className={cn(
        "group relative w-full rounded-2xl cursor-pointer overflow-hidden",
        "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]",
        "hover:border-[var(--accent-border)] hover:shadow-sm",
        "transition-all duration-200"
      )}
    >
      {/* Subtle left accent bar — indicates importance without decoration */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-5 sm:p-6 space-y-3">
        {/* Meta row: labels */}
        <div className="flex items-center gap-2">
          <Badge variant="primary" className="text-[10px] gap-1">
            <Target size={10} strokeWidth={2} />
            Focus
          </Badge>
          {workspaceMode === "CREWS" && activeCrew && (
            <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
              · {activeCrew.name}
            </span>
          )}
        </div>

        {/* Title — the most prominent element */}
        <h2 className="text-lg font-bold text-[var(--text-primary)] leading-snug line-clamp-2">
          {focusTask.title}
        </h2>

        {/* Meta row: status, project, due date */}
        <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
          {focusTask.status && (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
              {focusTask.status}
            </span>
          )}
          {focusTask.project?.name && <span>· {focusTask.project.name}</span>}
          {focusTask.dueDate && (
            <span className="flex items-center gap-1">
              <Clock size={12} strokeWidth={1.5} />
              {focusTask.dueDate}
            </span>
          )}
        </div>

        {/* CTA — clear, direct */}
        <div className="pt-1">
          <Button size="sm" className="rounded-full">
            Continue <ArrowRight size={13} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
