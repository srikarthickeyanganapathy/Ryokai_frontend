import React from 'react'
import { cn } from '@/shared/lib/cn'
import './entity-card.css'

const TONE_STYLE = {
  cyan: { color: 'var(--ec-cyan, #38bdf8)', background: 'var(--ec-cyan-soft, rgba(56,189,248,.14))' },
  amber: { color: 'var(--ec-amber, #fbbf24)', background: 'var(--ec-amber-soft, rgba(251,191,36,.14))' },
  emerald: { color: 'var(--ec-emerald, #34d399)', background: 'var(--ec-emerald-soft, rgba(52,211,153,.14))' },
  rose: { color: 'var(--ec-rose, #fb7185)', background: 'var(--ec-rose-soft, rgba(251,113,133,.14))' },
  accent: { color: 'var(--accent)', background: 'var(--accent-soft)' },
}

/**
 * EntityStatStrip — shared "data cards" row on top of entity pages.
 * stats: [{ key, label, value (node|string), sublabel, icon: LucideIcon,
 *           tone: 'cyan'|'amber'|'emerald'|'rose'|'accent', trend: {label, dir:'up'|'down'} }]
 */
export function EntityStatStrip({ stats, className }) {
  return (
    <div className={cn('ec-stats', className)}>
      {stats.map((s) => {
        const tone = TONE_STYLE[s.tone] || TONE_STYLE.accent
        return (
          <div key={s.key} className="ec-stat">
            <div className="ec-stat__tile" style={tone}>
              {s.icon && <s.icon />}
            </div>
            <div className="ec-stat__body">
              <div className="ec-stat__k">{s.label}</div>
              <div className="ec-stat__v">{s.value}</div>
              {s.sublabel && <div className="ec-stat__d">{s.sublabel}</div>}
            </div>
            {s.trend && (
              <span className={cn('ec-stat__trend', `ec-stat__trend--${s.trend.dir}`)}>
                {s.trend.label}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default EntityStatStrip
