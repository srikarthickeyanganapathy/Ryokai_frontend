// --- Shared pure helpers for the crew members directory ---
// All presence/avatar/workload/highlight logic lives here so every
// members view (card, table, drawer, header) uses the same rules.

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

// Deterministic hue for a member's flat avatar color
export function hashHue(str) {
  return Math.abs((str || '').split('').reduce((acc, c) => c.charCodeAt(0) + ((acc << 5) - acc), 0)) % 360;
}

export function formatJoinDate(joinedAt, options) {
  return new Date(joinedAt || FALLBACK_NOW).toLocaleDateString(undefined, options);
}

export function getMemberInitial(member) {
  return (member?.username || 'U').charAt(0).toUpperCase();
}

// A single flat color per member, not a gradient -- quieter and easier to tell apart at a glance
export function getAvatarColor(member) {
  const hue = hashHue(member?.username || member?.email || '');
  return `hsl(${hue} 42% 45%)`;
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

// Workload metrics based on assigned tasks. Returns a text color for the
// level (used inline, not as a badge) and a bar color for the progress bar.
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
  let barColor = 'bg-[var(--accent)]';
  let levelColor = 'text-[var(--text-muted)]';

  if (count >= 5) {
    level = 'High';
    barColor = 'bg-[var(--danger)]';
    levelColor = 'text-[var(--danger)]';
  } else if (count >= 3) {
    level = 'Medium';
    barColor = 'bg-[var(--warning)]';
    levelColor = 'text-[var(--warning)]';
  }

  return {
    total: memberTasks.length,
    active: count,
    completed: completedTasks.length,
    level,
    barColor,
    levelColor,
    memberTasks,
  };
}

// Highlight search matches inline, no styling beyond a subtle underline color
export const highlightText = (text, query) => {
  if (!query || typeof text !== 'string') return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-transparent text-[var(--accent)] font-semibold">
        {part}
      </mark>
    ) : (
      part
    )
  );
};