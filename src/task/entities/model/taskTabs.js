import { Info, MessageSquare, Paperclip, GitPullRequest, Activity } from 'lucide-react'

/**
 * Workspace-customized task tabs (one source of truth for TaskDetailPage and
 * the TaskPanel drawer):
 * - PERSONAL: solo workspace - no collaboration tabs (comments/evidence).
 * - CREW / ORG: full collaboration surface (comments, evidence).
 * - Pull Requests: everywhere - personal = the user's own repos, crew = the
 *   crew project's federated repo set (workspace-scoped picker).
 */
export const TASK_TABS = [
  { id: 'details', label: 'Details', icon: Info },
  { id: 'comments', label: 'Comments', icon: MessageSquare, collaboration: true },
  { id: 'evidence', label: 'Evidence', icon: Paperclip, collaboration: true },
  { id: 'prs', label: 'Pull Requests', icon: GitPullRequest },
  { id: 'activity', label: 'Activity', icon: Activity },
]

export const taskTabsFor = (workspaceMode) =>
  TASK_TABS.filter((t) => (workspaceMode === 'PERSONAL' ? !t.collaboration : true))
