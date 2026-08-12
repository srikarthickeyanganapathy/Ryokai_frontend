// --- localStorage Snapshot Utilities ---

export const getHistoryKey = (orgId) => `ryokai_workload_history_${orgId}`;
export const getThresholdKey = (orgId) => `ryokai_workload_threshold_${orgId}`;

export const loadHistory = (orgId) => {
  try {
    const raw = localStorage.getItem(getHistoryKey(orgId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveHistory = (orgId, history) => {
  try {
    localStorage.setItem(getHistoryKey(orgId), JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save workload history', e);
  }
};

export const ensureHistory = (orgId, rows) => {
  const history = loadHistory(orgId);
  let updated = false;

  rows.forEach((row) => {
    const userId = row.user?.id || row.user?.username;
    if (!userId) return;
    if (!history[userId]) {
      const base = row.totalActiveCount || 0;
      history[userId] = Array.from({ length: 14 }, (_, i) => {
        const variance = Math.floor(Math.random() * 5) - 2;
        return Math.max(0, base + variance);
      });
      updated = true;
    }
  });

  if (updated) saveHistory(orgId, history);
  return history;
};
