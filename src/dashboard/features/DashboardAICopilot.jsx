import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import { Brain, Lightbulb, TrendingUp, Zap } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show:  { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

const DEFAULT_INSIGHTS = [
  {
    icon: Lightbulb,
    tone: "warning",
    title: "Suggested focus",
    body: "Review your priority queue — tasks are stacking up in the backlog.",
  },
  {
    icon: TrendingUp,
    tone: "success",
    title: "Productivity trend",
    body: "You are maintaining a steady pace this week. Keep it up.",
  },
];

export function DashboardAICopilot({ context }) {
  const insights = context?.aiInsights || DEFAULT_INSIGHTS;

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "p-5 rounded-2xl border border-[var(--border-subtle)]",
        "bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--accent-soft)]/5"
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Brain size={15} strokeWidth={1.5} className="text-[var(--accent)]" />
        <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">AI Insights</h3>
      </div>
      <div className="space-y-2.5">
        {insights.slice(0, 3).map((item, i) => {
          const Icon = item.icon || Zap;
          const toneBgs = { warning: "bg-[var(--warning-soft)]/30", success: "bg-[var(--success-soft)]/30", accent: "bg-[var(--accent-soft)]/30" };
          const toneTexts = { warning: "text-[var(--warning)]", success: "text-[var(--success)]", accent: "text-[var(--accent)]" };
          return (
            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[var(--bg-subtle)]/50">
              <Icon
                size={13}
                strokeWidth={1.5}
                className={cn("shrink-0 mt-0.5", toneTexts[item.tone] || "text-[var(--text-tertiary)]")}
              />
              <div>
                <p className="text-[12px] font-medium text-[var(--text-primary)]">{item.title}</p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  {item.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
