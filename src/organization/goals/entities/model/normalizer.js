/**
 * Normalize goal DTO
 * @param {Object} goal - Raw backend goal
 * @returns {import('./types').Goal} Normalized goal object
 */
export const normalizeGoal = (goal) => {
  if (!goal || typeof goal !== 'object') return goal;
  return {
    ...goal,
    progress: Number(goal.progress) || 0,
  };
};
