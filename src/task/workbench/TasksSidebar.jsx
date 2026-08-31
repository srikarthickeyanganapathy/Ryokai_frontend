import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/ui/Icons";
import { Button } from "@/shared/ui/Button";
import { useAuth } from "@/identity";

const SCOPES = [
  { id: "all",        label: "All" },
  { id: "assigned",   label: "Mine" },
  { id: "today",      label: "Today" },
  { id: "upcoming",   label: "Upcoming" },
  { id: "completed",  label: "Done" },
  { id: "archived",   label: "Archived" },
];

const VIEWS = [
  { id: "kanban",  label: "Kanban",  iconKey: "layout" },
  { id: "list",    label: "List",    iconKey: "listTodo" },
];

const Icon = ({ name, className }) => {
  const Comp = Icons[name];
  return Comp ? <Comp className={className} /> : null;
};

export function TasksSidebar({
  tasks = [], activeView: activeViewProp, viewMode, onViewChange, taskScope = "all", onScopeChange,
  selectedTaskId, onTaskSelect, collapsed = false, onToggleCollapse, onNavigate,
  hideScopeTabs = false, hideViewToggle = false,
}) {
  const activeView = activeViewProp || viewMode || "list";
  const { user } = useAuth();

  const scopeCounts = useMemo(() => {
    const c = {};
    SCOPES.forEach(s => { c[s.id] = 0; });
    tasks.forEach(t => {
      c.all++;
      if (t.assignedTo === user?.username) c.assigned++;
      if (t.status === "Done") c.completed++;
      if (t.archived) c.archived++;
      const today = new Date().toDateString();
      if (t.dueDate && new Date(t.dueDate).toDateString() === today) c.today++;
      if (t.dueDate && new Date(t.dueDate) > new Date() && new Date(t.dueDate).toDateString() !== today) c.upcoming++;
    });
    return c;
  }, [tasks, user]);

  if (collapsed) {
    return (
      <div className="h-full flex flex-col items-center py-4 bg-[var(--bg-card)]/80 border-r border-[var(--border-subtle)]">
        <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="mb-4" aria-label="Expand sidebar">
          <Icons.chevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[var(--bg-card)]/80 border-r border-[var(--border-subtle)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-[var(--border-subtle)]">
        <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Tasks</span>
        <Button variant="ghost" size="sm" onClick={onToggleCollapse} aria-label="Collapse sidebar">
          <Icons.chevronLeft className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Scope tabs -- only if not hidden */}
      {!hideScopeTabs && (
        <div className="px-3 py-2 space-y-0.5">
          {SCOPES.map(s => (
            <button
              key={s.id}
              onClick={() => { onScopeChange?.(s.id); onNavigate?.(); }}
              className={cn(
                "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors text-left",
                taskScope === s.id
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              )}
            >
              <span>{s.label}</span>
              <span className="text-[10px] text-[var(--text-muted)] tabular-nums">{scopeCounts[s.id] || 0}</span>
            </button>
          ))}
        </div>
      )}

      {/* Task mini-list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2">
        <div className="space-y-0.5">
          {tasks.slice(0, 50).map(t => (
            <button
              key={t.id}
              onClick={() => { onTaskSelect?.(t); onNavigate?.(); }}
              className={cn(
                "w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] transition-colors truncate",
                selectedTaskId && String(selectedTaskId) === String(t.id)
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] font-medium"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              )}
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>

      {/* View toggle -- only if not hidden */}
      {!hideViewToggle && (
        <div className="px-3 py-2 border-t border-[var(--border-subtle)]">
          <div className="flex items-center bg-[var(--bg-subtle)] rounded-lg p-0.5 gap-0.5">
            {VIEWS.map(v => {
              const IconComp = Icons[v.iconKey];
              return (
                <button
                  key={v.id}
                  onClick={() => onViewChange?.(v.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                    activeView === v.id
                      ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  )}
                >
                  {IconComp && <IconComp className="w-3 h-3" />}
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
