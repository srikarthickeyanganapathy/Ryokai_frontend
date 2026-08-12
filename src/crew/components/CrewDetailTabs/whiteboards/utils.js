// Time formatter helper
export function formatRelativeTime(dateString) {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Deterministic gradient for collaborator avatars
export function getAvatarGradient(name = '?') {
  const hash = (name || '').split('').reduce((acc, c) => c.charCodeAt(0) + ((acc << 5) - acc), 0)
  return `linear-gradient(135deg, hsl(${Math.abs(hash) % 360} 70% 60%), hsl(${(Math.abs(hash) + 35) % 360} 70% 45%))`
}
