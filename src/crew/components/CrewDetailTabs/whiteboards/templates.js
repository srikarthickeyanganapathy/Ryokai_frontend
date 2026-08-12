import { 
  Lightbulb, 
  GitBranch, 
  MessageSquare, 
  Compass, 
  LayoutGrid 
} from '@/shared/ui/Icons';

// Template Definitions with Visual Configurations
export const TEMPLATES = [
  {
    id: 'brainstorming',
    name: 'Brainstorming',
    category: 'Ideation',
    icon: Lightbulb,
    desc: 'Mind maps, sticky note clusters & freeform team ideation.',
    accentColor: 'var(--warning)',
    bgColor: 'var(--warning-soft)'
  },
  {
    id: 'architecture',
    name: 'Architecture Diagram',
    category: 'System Design',
    icon: GitBranch,
    desc: 'System topology, flowcharts, microservices & DB schemas.',
    accentColor: 'var(--accent)',
    bgColor: 'var(--accent-soft)'
  },
  {
    id: 'retrospective',
    name: 'Retrospective',
    category: 'Agile',
    icon: MessageSquare,
    desc: 'Sprint recap with What Went Well, To Improve & Action Items.',
    accentColor: 'var(--success)',
    bgColor: 'var(--success-soft)'
  },
  {
    id: 'user-journey',
    name: 'User Journey',
    category: 'UX Design',
    icon: Compass,
    desc: 'Map persona touchpoints, user pain points & solution paths.',
    accentColor: 'var(--accent)',
    bgColor: 'var(--accent-soft)'
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    category: 'Freeform',
    icon: LayoutGrid,
    desc: 'Clean infinite canvas for custom sketching and notes.',
    accentColor: 'var(--text-tertiary)',
    bgColor: 'var(--bg-subtle)'
  }
];
