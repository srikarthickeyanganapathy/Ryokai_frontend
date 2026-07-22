export function filterTasksByWorkspace(tasks, workspaceMode, activeOrganization) {
  if (!tasks || !Array.isArray(tasks)) return [];

  if (workspaceMode === 'PERSONAL') {
    // Personal workspace: ONLY tasks explicitly marked as personal (isPersonal === true)
    // or tasks that are not non-personal (isPersonal !== false) and have no org/crew/team association.
    return tasks.filter(t => 
      t.isPersonal === true || 
      (t.isPersonal !== false && !t.organizationId && !t.crewId && !t.teamId)
    );
  }

  if (workspaceMode === 'ORG') {
    // Org workspace: ONLY tasks that are NOT personal (isPersonal === false) and NOT crew tasks,
    // and either match activeOrganization.id or have no specific orgId set (created in org mode).
    return tasks.filter(t => {
      if (t.isPersonal === true || t.crewId) return false;
      if (t.organizationId && activeOrganization?.id) {
        return String(t.organizationId) === String(activeOrganization.id);
      }
      return true;
    });
  }

  if (workspaceMode === 'CREWS') {
    return tasks.filter(t => !!t.crewId);
  }

  return tasks;
}
