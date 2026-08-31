/* --- Shared presentational helpers for the Channels tab --- */

export const QUICK_EMOJIS = ['  ', '  ', '  ', '  ', '  ', ' '];

export function getAvatarGradient(name = '?') {
  const hash = (name || '').split('').reduce((acc, c) => c.charCodeAt(0) + ((acc << 5) - acc), 0)
  return `linear-gradient(135deg, hsl(${Math.abs(hash) % 360} 70% 60%), hsl(${(Math.abs(hash) + 35) % 360} 70% 45%))`
}

export function formatTimeCompact(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
