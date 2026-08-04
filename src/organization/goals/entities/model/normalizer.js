/**
 * Normalize a single Key Result
 * @param {Object} kr - Raw backend key result
 * @returns {Object} Normalized key result
 */
const normalizeKeyResult = (kr) => {
  if (!kr || typeof kr !== 'object') return kr;
  return {
    ...kr,
    currentValue: Number(kr.currentValue) || 0,
    targetValue: Number(kr.targetValue) || 100,
  };
};

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
    keyResults: Array.isArray(goal.keyResults)
      ? goal.keyResults.map(normalizeKeyResult)
      : [],
  };
};
