import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";
import { ListTodo, FolderKanban, Zap, Users, BarChart3 } from "lucide-react";

const ACTION_SETS = {
  PERSONAL: [
    { icon: ListTodo,     label: "New Task",     to: "/app/tasks",           shortcut: "T", primary: true },
    { icon: FolderKanban, label: "New Project",   to: "/app/projects",        shortcut: "P" },
    { icon: Zap,          label: "Focus Mode",    to: "/app/focus",           shortcut: "F" },
  ],
  CREWS: [
    { icon: ListTodo,     label: "New Task",      to: "/app/crews/tasks",     shortcut: "T", primary: true },
    { icon: FolderKanban, label: "New Project",    to: "/app/projects",        shortcut: "P" },
    { icon: Users,        label: "Discover Crews", to: "/app/crews/discover",  shortcut: "D" },
  ],
  ORG: [
    { icon: ListTodo,     label: "New Task",      to: "/app/tasks",           shortcut: "T", primary: true },
    { icon: Users,        label: "Invite Member",  to: "/app/directory",       shortcut: "I" },
    { icon: BarChart3,    label: "View Reports",   to: "/app/analytics",       shortcut: "R" },
  ],
};

export function DashboardQuickActions({ workspaceMode = "PERSONAL" }) {
  const navigate = useNavigate();
  const actions = ACTION_SETS[workspaceMode] || ACTION_SETS.PERSONAL;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {actions.map((a) =>
        a.primary ? (
          <Button
            key={a.label}
            size="sm"
            onClick={() => navigate(a.to)}
            className="h-8 gap-1.5 text-[12px] rounded-lg font-semibold shadow-sm"
          >
            <a.icon size={13} strokeWidth={1.5} />
            {a.label}
          </Button>
        ) : (
          <Button
            key={a.label}
            variant="secondary"
            size="sm"
            onClick={() => navigate(a.to)}
            className={cn(
              "h-8 gap-1.5 text-[12px] rounded-lg",
              "border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:shadow-sm",
              "group"
            )}
          >
            <a.icon
              size={13}
              strokeWidth={1.5}
              className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors"
            />
            {a.label}
          </Button>
        )
      )}
    </div>
  );
}
