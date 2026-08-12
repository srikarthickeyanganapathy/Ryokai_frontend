import React from 'react'
import { motion } from 'framer-motion'
import { Text } from '@/shared/ui/Typography'

/* ══════════════════════════════════════════════════════
 * COMPARISON PANEL — CompareBar (extracted from TeamsPage)
 * ══════════════════════════════════════════════════════ */

export function CompareBar({ label, values, max, hues }) {
  return (
    <div className="space-y-1">
      <Text size="xs" className="text-[var(--text-muted)] font-medium">{label}</Text>
      <div className="space-y-1">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: `hsl(${hues[i]} 65% 50%)` }}
            />
            <div className="flex-1 h-6 bg-[var(--bg-subtle)] rounded-lg overflow-hidden">
              <motion.div
                className="h-full rounded-lg"
                style={{ background: `linear-gradient(90deg, hsl(${hues[i]} 65% 50%), hsl(${(hues[i] + 20) % 360} 55% 55%))` }}
                initial={{ width: 0 }}
                animate={{ width: `${max > 0 ? (v / max) * 100 : 0}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.1 }}
              />
            </div>
            <Text size="xs" className="text-[var(--text-primary)] tabular-nums w-8 text-right font-semibold">{v}</Text>
          </div>
        ))}
      </div>
    </div>
  )
}
