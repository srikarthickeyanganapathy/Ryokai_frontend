import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'

export function OrganizationCard({ organization }) {
  const { 
    id, 
    name, 
    description, 
    createdBy,
    memberCount,
    createdAt
  } = organization

  return (
    <Link to={`/app/organizations/${id}`} className="block">
      <motion.div 
        whileHover={{ y: -2 }}
        className="group relative bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl p-6 transition-all hover:shadow-md hover:border-[var(--color-border-default)] h-full flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]"
            >
              <Icons.workspace className="w-5 h-5" />
            </div>
            <div>
              <Heading level={4} className="group-hover:text-[var(--accent-cyan)] transition-colors line-clamp-1">
                {name}
              </Heading>
              <Text size="sm" variant="muted" className="mt-0.5 line-clamp-2">{description || 'No description provided'}</Text>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-subtle)] mt-auto">
          <div className="flex items-center gap-3">
            <Text size="xs" variant="muted">
              <span className="text-[var(--text-primary)] font-medium">{createdBy || 'System'}</span>
            </Text>
            {memberCount !== undefined && (
              <Text size="xs" variant="muted">
                {memberCount} member{memberCount !== 1 ? 's' : ''}
              </Text>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Text size="xs" variant="muted">
              Created {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
