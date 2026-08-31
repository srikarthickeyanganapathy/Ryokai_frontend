// --- Shared pure helpers for the crew members directory ---
// All presence/avatar/workload/highlight logic lives here so every
// members view (card, table, drawer, header) uses the same rules.

// --- Presence Configurations (standard app tokens) ---
export const PRESENCE_CONFIG = {
  active: {
    label: 'Active',
    dotBg: 'bg-[var(--success)]',
    textColor: 'text-[var(--success)]',
  },
  offline: {
    label: 'Offline',
    dotBg: 'bg-[var(--text-tertiary)]',
    textColor: 'text-[var(--text-muted)]',
  },
};

// Stable fallback timestamp -- module scope keeps render pure (React Compiler)
const FALLBACK_NOW = Date.now();

// Deterministic hue for avatar gradients (teams design language)
export function hashHue(str) {
  return Math.abs((str || '').split('').reduce((acc, c) => c.charCodeAt(0) + ((acc << 5) - acc), 0)) % 360;
}

export function formatJoinDate(joinedAt, options) {
  return new Date(joinedAt || FALLBACK_NOW).toLocaleDateString(undefined, options);
}

export function getMemberInitial(member) {
  return (member?.username || 'U').charAt(0).toUpperCase();
}

export function getAvatarGradient(member) {
  const hue = hashHue(member?.username || member?.email || '');
  return `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 35) % 360} 65% 40%))`;
}

export function getMemberPresence(member) {
  if (!member) return 'offline';
  if (member.isOnline !== undefined) return member.isOnline ? 'active' : 'offline';
  if (member.presenceStatus) {
    const status = String(member.presenceStatus).toLowerCase();
    return status === 'active' || status === 'online' ? 'active' : 'offline';
  }
  return 'offline';
}

// Workload metrics calculation based on assigned tasks
export function getMemberWorkload(username, tasks = []) {
  const memberTasks = tasks.filter(
    (t) =>
      t.assignedTo === username ||
      t.assigneeUsername === username ||
      t.assignee?.username === username ||
      t.userId === username
  );
  const activeTasks = memberTasks.filter(
    (t) => t.status !== 'Done' && t.status !== 'COMPLETED' && t.status !== 'CLOSED'
  );
  const completedTasks = memberTasks.filter(
    (t) => t.status === 'Done' || t.status === 'COMPLETED'
  );

  const count = activeTasks.length;
  let level = 'Low';
  let colorClass = 'bg-[var(--accent)]';
  let badgeClass = 'bg-[var(--accent-soft)] text-[var(--accent)] border-transparent';

  if (count >= 5) {
    level = 'High';
    colorClass = 'bg-rose-500';
    badgeClass = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
  } else if (count >= 3) {
    level = 'Medium';
    colorClass = 'bg-[var(--warning)]';
    badgeClass = 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning-border)]';
  }

  return {
    total: memberTasks.length,
    active: count,
    completed: completedTasks.length,
    level,
    colorClass,
    badgeClass,
    memberTasks,
  };
}

// Helper to highlight search results safely
export const highlightText = (text, query) => {
  if (!query || typeof text !== 'string') return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-[var(--accent-soft)] text-[var(--accent)] px-0.5 rounded font-medium">
        {part}
      </mark>
    ) : (
      part
    )
  );
};
