/**
 * Derive executive-level statistics from a list of goals.
 * Uses only data already present in the goal objects -- no extra API calls.
 *
 * @param {Array} goals - Array of normalized goal objects
 * @returns {Object} Derived statistics
 */
export const deriveGoalStats = (goals) => {
  const empty = {
    total: 0,
    onTrack: 0,
    atRisk: 0,
    offTrack: 0,
    achieved: 0,
    avgProgress: 0,
    needAttention: 0,
    endingThisWeek: 0,
    krsComplete: 0,
    krsTotal: 0,
  };

  if (!goals?.length) return empty;

  const stats = { ...empty, total: goals.length };
  let progressSum = 0;
  const now = new Date();

  goals.forEach((goal) => {
    progressSum += Number(goal.progress) || 0;

    switch (goal.status) {
      case 'ON_TRACK':
        stats.onTrack++;
        break;
      case 'AT_RISK':
        stats.atRisk++;
        stats.needAttention++;
        break;
      case 'OFF_TRACK':
        stats.offTrack++;
        stats.needAttention++;
        break;
      case 'ACHIEVED':
        stats.achieved++;
        break;
      default:
        break;
    }

    if (goal.keyResults?.length) {
      stats.krsTotal += goal.keyResults.length;
      goal.keyResults.forEach((kr) => {
        const current = Number(kr.currentValue) || 0;
        const target = Number(kr.targetValue) || 100;
        if (current >= target) stats.krsComplete++;
      });
    }

    if (goal.endDate) {
      const end = new Date(goal.endDate);
      if (!isNaN(end.getTime())) {
        const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) stats.endingThisWeek++;
      }
    }
  });

  stats.avgProgress = Math.round(progressSum / goals.length);
  return stats;
};

/**
 * Calculate human-readable time remaining for a goal based on its end date.
 * @param {string} endDate - ISO date string
 * @returns {{label: string, tone: 'normal'|'warning'|'danger'|'success', days: number}|null}
 */
export const getTimeRemaining = (endDate) => {
  if (!endDate) return null;

  const end = new Date(endDate);
  if (isNaN(end.getTime())) return null;

  const now = new Date();
  const diffMs = end - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdue = Math.abs(diffDays);
    return {
      label: overdue === 1 ? 'Overdue by 1 day' : `Overdue by ${overdue} days`,
      tone: 'danger',
      days: -overdue,
    };
  }
  if (diffDays === 0) return { label: 'Ends today', tone: 'warning', days: 0 };
  if (diffDays === 1) return { label: 'Ends tomorrow', tone: 'warning', days: 1 };
  if (diffDays <= 7) return { label: `${diffDays} days left`, tone: 'warning', days: diffDays };
  return { label: `${diffDays} days left`, tone: 'normal', days: diffDays };
};

/**
 * Summarise key results by completion status.
 * @param {Array} keyResults
 * @returns {{complete: number, inProgress: number, notStarted: number, total: number}}
 */
export const getKRSummary = (keyResults) => {
  const empty = { complete: 0, inProgress: 0, notStarted: 0, total: 0 };
  if (!keyResults?.length) return empty;

  const summary = { ...empty, total: keyResults.length };

  keyResults.forEach((kr) => {
    const current = Number(kr.currentValue) || 0;
    const target = Number(kr.targetValue) || 100;
    if (current >= target) summary.complete++;
    else if (current > 0) summary.inProgress++;
    else summary.notStarted++;
  });

  return summary;
};

/**
 * Get the status of a single key result.
 * @param {Object} kr
 * @returns {'complete'|'in-progress'|'not-started'}
 */
export const getKRStatus = (kr) => {
  const current = Number(kr.currentValue) || 0;
  const target = Number(kr.targetValue) || 100;
  if (current >= target) return 'complete';
  if (current > 0) return 'in-progress';
  return 'not-started';
};

/**
 * Calculate the percentage progress of a key result.
 * @param {Object} kr
 * @returns {number} 0-100
 */
export const getKRProgress = (kr) => {
  const current = Number(kr.currentValue) || 0;
  const target = Number(kr.targetValue) || 100;
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
};

/**
 * Filter goals by status (frontend-only).
 * @param {Array} goals
 * @param {string} filter - 'ALL' or a status value
 * @returns {Array}
 */
export const filterGoalsByStatus = (goals, filter) => {
  if (!filter || filter === 'ALL') return goals;
  return goals.filter((g) => g.status === filter);
};

/**
 * Sort goals by various criteria (frontend-only).
 * @param {Array} goals
 * @param {string} sortBy
 * @returns {Array} New sorted array (does not mutate input)
 */
export const sortGoals = (goals, sortBy) => {
  const sorted = [...goals];
  switch (sortBy) {
    case 'progress_desc':
      return sorted.sort((a, b) => (Number(b.progress) || 0) - (Number(a.progress) || 0));
    case 'progress_asc':
      return sorted.sort((a, b) => (Number(a.progress) || 0) - (Number(b.progress) || 0));
    case 'ending_soon':
      return sorted.sort((a, b) => {
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;
        return new Date(a.endDate) - new Date(b.endDate);
      });
    case 'recently_updated':
      return sorted.sort((a, b) => {
        const aDate = a.updatedAt || a.createdAt || a.startDate;
        const bDate = b.updatedAt || b.createdAt || b.startDate;
        if (!aDate && !bDate) return (Number(b.id) || 0) - (Number(a.id) || 0);
        if (!aDate) return 1;
        if (!bDate) return -1;
        return new Date(bDate) - new Date(aDate);
      });
    case 'alphabetical':
      return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    default:
      return sorted;
  }
};
