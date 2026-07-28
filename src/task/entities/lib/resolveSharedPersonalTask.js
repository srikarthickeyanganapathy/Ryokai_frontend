/**
 * AC-6 & PersonalTaskStrategy:
 * Resolves whether a task should be visible in the current workspace mode.
 * Cross-mode dependencies and visibility leaks are strictly forbidden.
 *
 * @param {import('../model/types').Task} task - The task to evaluate
 * @param {('PERSONAL'|'CREWS'|'ORG')} workspaceMode - The active workspace mode
 * @param {Object} [activeOrganization] - The active organization context if in ORG mode
 * @returns {boolean} Whether the task is visible in the given workspace
 */
export function resolveSharedPersonalTask(task, workspaceMode, activeOrganization) {
  if (!task || typeof task !== 'object') return false;

  if (workspaceMode === 'PERSONAL') {
    // Personal workspace: ONLY tasks explicitly marked as personal (isPersonal === true)
    // or tasks that are not non-personal (isPersonal !== false) and have no org/crew/team association.
    return (
      task.isPersonal === true ||
      (task.isPersonal !== false && !task.organizationId && !task.crewId && !task.crew && !task.teamId)
    );
  }

  if (workspaceMode === 'ORG') {
    // Org workspace: ONLY tasks that are NOT personal (isPersonal === false) and NOT crew tasks,
    // and either match activeOrganization.id or have no specific orgId set (created in org mode).
    if (task.isPersonal === true || task.crewId || task.crew) return false;
    if (task.organizationId && activeOrganization?.id) {
      return String(task.organizationId) === String(activeOrganization.id);
    }
    return true;
  }

  if (workspaceMode === 'CREWS') {
    return !!(task.crewId || task.crew);
  }

  return true;
}

/**
 * Filter an array of tasks by workspace mode according to AC-6.
 * @param {import('../model/types').Task[]} tasks - Array of tasks to filter
 * @param {('PERSONAL'|'CREWS'|'ORG')} workspaceMode - Active workspace mode
 * @param {Object} [activeOrganization] - Active organization context
 * @returns {import('../model/types').Task[]} Filtered tasks array
 */
export function filterTasksByWorkspace(tasks, workspaceMode, activeOrganization) {
  if (!tasks || !Array.isArray(tasks)) return [];
  return tasks.filter(t => resolveSharedPersonalTask(t, workspaceMode, activeOrganization));
}
