import React from 'react'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'

/* ══════════════════════════════════════════════════════
 * EMPTY STATE (LOCAL — extracted from TeamsPage)
 * NOTE: this is the LOCAL EmptyState, NOT the shared one
 * from '@/shared/ui/EmptyState'.
 * ══════════════════════════════════════════════════════ */

export function EmptyState({ onCreateClick, organizationName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="text-center py-20 px-6"
    >
      {/* Abstract illustration */}
      <motion.div
        className="relative mx-auto mb-8 w-40 h-40"
        animate={{ rotate: [0, 5, 0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Base shape */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-[var(--bg-subtle)]" />
        {/* Decorative team blocks */}
        {[
          { x: 15, y: 15, size: 45, hue: 220, delay: 0 },
          { x: 85, y: 20, size: 50, hue: 320, delay: 0.3 },
          { x: 25, y: 90, size: 42, hue: 160, delay: 0.6 },
          { x: 85, y: 85, size: 38, hue: 40, delay: 0.9 },
        ].map((block, i) => (
          <motion.div
            key={i}
            className="absolute rounded-2xl flex items-center justify-center text-white font-bold shadow-sm"
            style={{
              width: block.size, height: block.size,
              left: block.x, top: block.y,
              background: `linear-gradient(135deg, hsl(${block.hue} 70% 55% / 0.3), hsl(${block.hue} 60% 40% / 0.2))`,
              border: '1px solid var(--border-subtle)',
            }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: block.delay }}
          >
            <Icons.users className="w-5 h-5" style={{ color: `hsl(${block.hue} 70% 50% / 0.6)` }} />
          </motion.div>
        ))}
      </motion.div>

      <Heading level={2} className="text-[18px] font-bold text-[var(--text-primary)] mb-2">
        No teams yet
      </Heading>
      <Text className="text-[13px] text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
        {organizationName
          ? `Organize work in ${organizationName} by creating your first team.`
          : 'Organize work by creating your first team.'}
      </Text>
      {onCreateClick && (
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button variant="primary" size="md" onClick={onCreateClick} className="gap-2 shadow-md">
            <Icons.plus className="w-4 h-4" />
            Create Your First Team
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
