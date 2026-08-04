/**
 * Derive executive-level statistics from workload rows.
 * Pure frontend computation - no extra API calls.
 */
export const deriveOrgStats = (rows, threshold) => {
  if (!rows || rows.length === 0) {
    return { memberCount: 0, totalActive: 0, avgUtilization: 0, overAllocated: 0, availableTasks: 0, nearCapacity: 0, balanced: 0 };
  }
  
  const memberCount = rows.length;
  const totalActive = rows.reduce((sum, r) => sum + (r.totalActiveCount ?? 0), 0);
  const overAllocated = rows.filter((r) => (r.totalActiveCount ?? 0) > threshold).length;
  const nearCapacity = rows.filter((r) => {
    const c = r.totalActiveCount ?? 0;
    return c >= threshold * 0.75 && c <= threshold;
  }).length;
  const balanced = rows.filter((r) => (r.totalActiveCount ?? 0) < threshold * 0.75).length;
  
  const totalCapacity = memberCount * threshold;
  const avgUtilization = totalCapacity > 0 ? Math.min(Math.round((totalActive / totalCapacity) * 100), 100) : 0;
  const availableTasks = rows.reduce((sum, r) => sum + Math.max(0, threshold - (r.totalActiveCount ?? 0)), 0);
  
  return { memberCount, totalActive, avgUtilization, overAllocated, availableTasks, nearCapacity, balanced };
};

/**
 * Calculate a team health score (0-100) based on overload and utilization.
 */
export const getTeamHealthScore = (rows, threshold) => {
  if (!rows || rows.length === 0) return 100;
  const overAllocated = rows.filter((r) => (r.totalActiveCount ?? 0) > threshold).length;
  const penalty = (overAllocated / rows.length) * 100;
  
  const stats = deriveOrgStats(rows, threshold);
  const utilPenalty = stats.avgUtilization > 85 ? (stats.avgUtilization - 85) * 0.5 : 0;
  
  return Math.max(0, Math.round(100 - penalty - utilPenalty));
};

/**
 * Analyze sparkline trend data to determine direction.
 * @returns {'increasing'|'decreasing'|'stable'}
 */
export const getTrendDirection = (data) => {
  if (!data || data.length < 4) return 'stable';
  const half = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, half).reduce((a, b) => a + b, 0) / half;
  const secondHalf = data.slice(half).reduce((a, b) => a + b, 0) / (data.length - half);
  
  if (secondHalf > firstHalf * 1.1) return 'increasing';
  if (secondHalf < firstHalf * 0.9) return 'decreasing';
  return 'stable';
};

/**
 * Determine risk level for a team member.
 */
export const getRiskLevel = (count, threshold) => {
  if (count > threshold) return { label: 'High Risk', tone: 'danger' };
  if (count >= threshold * 0.75) return { label: 'Medium Risk', tone: 'warning' };
  return { label: 'Low Risk', tone: 'accent' };
};
