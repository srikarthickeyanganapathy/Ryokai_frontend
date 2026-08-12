import { Icons } from '@/shared/ui/Icons'

/* ══════════════════════════════════════════════════════
 * TEMPLATE DEFINITIONS (extracted from TeamsPage)
 * ══════════════════════════════════════════════════════ */

export const TEAM_TEMPLATES = [
  {
    id: 'engineering-sprint',
    title: 'Engineering Sprint',
    icon: Icons.code || Icons.zap,
    description: '2-week sprint cycles, backlog, code reviews, and CI/CD pipeline tracking.',
    hue: 220,
    categories: ['Backlog', 'In Progress', 'Review', 'Done'],
    mood: '⚡',
  },
  {
    id: 'marketing-campaign',
    title: 'Marketing Campaign',
    icon: Icons.megaphone,
    description: 'Campaign calendar, content pipeline, asset approvals, and analytics.',
    hue: 320,
    categories: ['Planning', 'Production', 'Review', 'Published'],
    mood: '📢',
  },
  {
    id: 'design-studio',
    title: 'Design Studio',
    icon: Icons.image || Icons.pencil,
    description: 'Design requests, critique rounds, handoff tracking, and asset library.',
    hue: 280,
    categories: ['Brief', 'Ideation', 'Review', 'Handoff'],
    mood: '🎨',
  },
  {
    id: 'blank-canvas',
    title: 'Blank Canvas',
    icon: Icons.plus,
    description: 'Start from scratch. Customize everything to fit your workflow.',
    hue: 180,
    categories: ['To Do', 'In Progress', 'Done'],
    mood: '✨',
  },
]
