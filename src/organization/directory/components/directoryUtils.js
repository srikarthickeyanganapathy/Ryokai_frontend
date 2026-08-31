// --- Directory Utility Helpers ---
// Shared formatting/activity helpers extracted from DirectoryPage.
// Used by DirectoryPage, MemberCardGrid, MemberCompareModal, RecentActivityFeed.

export function hashHue(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

export function timeAgo(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 0) return 'just now';
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function formatLastActive(memberTasksMap, userId) {
  const tasks = memberTasksMap[userId] || [];
  if (tasks.length === 0) return null;
  const sorted = [...tasks]
    .filter(t => t.updatedAt)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  if (sorted.length === 0) return null;
  return timeAgo(new Date(sorted[0].updatedAt));
}

export function hasRecentActivity(memberTasksMap, userId, hours = 24) {
  const tasks = memberTasksMap[userId] || [];
  const threshold = Date.now() - hours * 60 * 60 * 1000;
  return tasks.some(t => t.updatedAt && new Date(t.updatedAt).getTime() >= threshold);
}
