import React, { useMemo } from 'react'
import { AlertTriangle, Clock, ShieldAlert, Users, Zap, ChevronRight, Waves } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

const SEVERITY_STYLES = {
  critical: {
    bg: 'bg-rose-500/8 hover:bg-rose-500/15',
    border: 'border-rose-500/20',
    icon: 'text-rose-400',
    text: 'text-rose-200',
    dot: 'bg-rose-400'
  },
  warning: {
    bg: 'bg-amber-500/8 hover:bg-amber-500/15',
    border: 'border-amber-500/20',
    icon: 'text-amber-400',
    text: 'text-amber-200',
    dot: 'bg-amber-400'
  },
  info: {
    bg: 'bg-cyan-500/8 hover:bg-cyan-500/15',
    border: 'border-cyan-500/20',
    icon: 'text-cyan-400',
    text: 'text-cyan-200',
    dot: 'bg-cyan-400'
  }
}

const TYPE_ICONS = {
  blocker: ShieldAlert,
  queue: Waves,
  overdue: Clock,
  unassigned: Users
}

export default function InsightEngine({ insights = [], onInsightClick }) {
  if (insights.length === 0) return null

  return (
    <div className="fixed bottom-6 left-6 z-30 pointer-events-auto max-w-sm">
      <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2.5 px-1">
          <Zap size={12} className="text-cyan-400" />
          <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Insights</span>
          <span className="text-[10px] text-white/25 font-mono ml-auto">{insights.length}</span>
        </div>

        {/* Insight Cards */}
        <div className="space-y-1">
          {insights.slice(0, 5).map((insight, idx) => {
            const style = SEVERITY_STYLES[insight.severity] || SEVERITY_STYLES.info
            const Icon = TYPE_ICONS[insight.type] || AlertTriangle

            return (
              <button
                key={idx}
                onClick={() => onInsightClick?.(insight)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all cursor-pointer group",
                  style.bg, style.border
                )}
              >
                <Icon size={14} className={cn(style.icon, "shrink-0")} />
                <span className={cn("text-xs text-left flex-1 leading-snug", style.text)}>
                  {insight.message}
                </span>
                <ChevronRight size={12} className="text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
