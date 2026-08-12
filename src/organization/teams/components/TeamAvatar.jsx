import React from 'react'
import { cn } from '@/shared/lib/cn'
import { hashHue } from './utils'

/* ══════════════════════════════════════════════════════
 * TEAM AVATAR (extracted from TeamsPage)
 * ══════════════════════════════════════════════════════ */

export function TeamAvatar({ name, size = 'md', hue, className }) {
  const h = hue ?? hashHue(name || '?')
  const sizes = { sm: 'w-8 h-8 text-[10px]', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-base' }
  return (
    <div
      className={cn(
        'rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-sm border border-white/10',
        sizes[size] || sizes.md,
        className,
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${h} 72% 52%), hsl(${(h + 35) % 360} 68% 38%))`,
        boxShadow: `0 4px 14px -2px hsl(${h} 75% 50% / 0.3)`,
      }}
      aria-hidden="true"
    >
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  )
}
