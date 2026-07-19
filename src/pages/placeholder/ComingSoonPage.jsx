import React from 'react'
import { motion } from 'framer-motion'
import { Icons } from '@/shared/ui/Icons'
import { Heading, Text } from '@/shared/ui/Typography'
import { useLocation } from 'react-router-dom'

const featureMeta = {
  '/app/notes': {
    icon: Icons.pencil,
    title: 'Notes & Drafts',
    description: 'A private scratchpad for meeting notes, brainstorms, and rough task ideas before sharing them with your team.',
    color: '#f59e0b',
  },
  '/app/calendar': {
    icon: Icons.calendar,
    title: 'Calendar',
    description: 'A time-blocking view to drag tasks onto your day and stay on top of deadlines.',
    color: '#6366f1',
  },
  '/app/saved': {
    icon: Icons.bookmark,
    title: 'Saved & Bookmarks',
    description: 'Quick-access folder for important tasks, projects, or files across your entire workspace.',
    color: '#ec4899',
  },
  '/app/goals': {
    icon: Icons.target,
    title: 'Goals & OKRs',
    description: 'Set quarterly company goals, link team projects to them, and track progress at the organizational level.',
    color: '#10b981',
  },
  '/app/directory': {
    icon: Icons.network,
    title: 'Organization Directory',
    description: 'An interactive org chart showing roles, teams, and the corporate hierarchy.',
    color: '#3b82f6',
  },
  '/app/announcements': {
    icon: Icons.megaphone,
    title: 'Announcements',
    description: 'A company-wide bulletin board for leadership to post updates, policy changes, and important notices.',
    color: '#f97316',
  },
  '/app/workload': {
    icon: Icons.scale,
    title: 'Resource Workload',
    description: 'Visualize team bandwidth to see who is overloaded and who has free capacity.',
    color: '#8b5cf6',
  },
  '/app/crews/discover': {
    icon: Icons.compass,
    title: 'Discover & Join Crews',
    description: 'Search for public crews, browse open invitations, or paste an invite link to join a new crew.',
    color: '#06b6d4',
  },
  '/app/crews/tasks': {
    icon: Icons.listTodo,
    title: 'All Crew Tasks',
    description: 'An aggregated view of tasks from all the crews you belong to.',
    color: '#14b8a6',
  },
}

export function ComingSoonPage({ title: propTitle, description: propDescription }) {
  const location = useLocation()
  const meta = featureMeta[location.pathname] || {}

  const IconComponent = meta.icon || Icons.sparkles
  const title = propTitle || meta.title || 'Coming Soon'
  const description = propDescription || meta.description || 'This feature is under construction.'
  const accentColor = meta.color || '#a78bfa'

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-center max-w-md"
      >
        {/* Glowing icon container */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
          className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8"
          style={{
            background: `${accentColor}15`,
            boxShadow: `0 0 60px ${accentColor}20, 0 0 120px ${accentColor}10`,
          }}
        >
          <IconComponent
            className="w-9 h-9"
            style={{ color: accentColor }}
            strokeWidth={1.5}
          />
          {/* Animated ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ border: `1.5px solid ${accentColor}30` }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <Heading level={2} className="text-2xl font-semibold tracking-tight mb-3">
          {title}
        </Heading>

        <Text
          variant="muted"
          className="text-[15px] leading-relaxed max-w-sm mx-auto mb-8"
        >
          {description}
        </Text>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wide uppercase"
          style={{
            background: `${accentColor}10`,
            color: accentColor,
            border: `1px solid ${accentColor}20`,
          }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: accentColor }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          In Development
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ComingSoonPage
