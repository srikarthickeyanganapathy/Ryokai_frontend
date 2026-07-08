import { getDashboardStats, getDashboardActivity } from '@/features/analytics/api/dashboard.api'
import { getTasks } from '@/features/tasks/api/task.api'

export const workspaceAPI = {
  getDashboardStats: async () => {
    const data = await getDashboardStats()
    return [
      {
        label: 'Total Tasks',
        value: String(data.totalTasks || 0),
        trend: 'All time',
        color: 'text-[var(--accent-violet)]',
      },
      {
        label: 'To Do',
        value: String(data.todoCount || 0),
        trend: 'Pending',
        color: 'text-[var(--accent-cyan)]',
      },
      {
        label: 'In Review',
        value: String(data.inReviewCount || 0),
        trend: 'Needs review',
        color: 'text-orange-500',
      },
      {
        label: 'Assigned to Me',
        value: String(data.assignedToMeCount || 0),
        trend: 'Your tasks',
        color: 'text-[var(--text-secondary)]',
      },
    ]
  },


}
