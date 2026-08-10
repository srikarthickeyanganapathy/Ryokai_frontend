import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/cn";
import { ListTodo, CheckCircle2, AlertTriangle, Users } from "lucide-react";

function StatItem({ icon: Icon, label, value, tone = "default", onClick }) {
  const toneMap = {
    default:  { text: "text-[var(--text-primary)]",       bg: "bg-[var(--bg-subtle)]" },
    accent:   { text: "text-[var(--accent)]",             bg: "bg-[var(--accent-soft)]" },
    success:  { text: "text-[var(--success)]",            bg: "bg-[var(--success-soft)]" },
    warning:  { text: "text-[var(--warning)]",            bg: "bg-[var(--warning-soft)]" },
  };
  const t = toneMap[tone] || toneMap.default;

  const inner = (
    <>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", t.bg)}>
        <Icon className={cn("w-3.5 h-3.5", t.text)} strokeWidth={1.5} />
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          {label}
        </div>
        <div className={cn("text-base font-bold tabular-nums", t.text)}>
          {value ?? 0}
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left",
          "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]",
          "hover:border-[var(--border-default)] transition-colors duration-150"
        )}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-xl",
      "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
    )}>
      {inner}
    </div>
  );
}

export function DashboardStats({ activeTaskCount, completedTaskCount, dueSoonCount, teamSize, workspaceMode }) {
  const navigate = useNavigate();

  const stats = [
    { icon: ListTodo,      label: "Active",    value: activeTaskCount,    tone: "accent",  to: "/app/tasks" },
    { icon: CheckCircle2,  label: "Completed",  value: completedTaskCount, tone: "success", to: "/app/tasks" },
    { icon: AlertTriangle, label: "Due Soon",   value: dueSoonCount,      tone: "warning" },
    { icon: Users,         label: "Team",       value: teamSize,          tone: "default", to: "/app/teams" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {stats.map((s) => (
        <StatItem
          key={s.label}
          icon={s.icon}
          label={s.label}
          value={s.value}
          tone={s.tone}
          onClick={s.to ? () => navigate(s.to) : undefined}
        />
      ))}
    </div>
  );
}
