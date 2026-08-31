/* ===
 * UTILITY HELPERS (extracted from TeamsPage)
 * === */

export function hashHue(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

export function hashIndex(str = '', max = 0) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % max
}

const MOOD_EMOJIS = ['  ', '  ', ' ', '  ', '  ', '  ', '   ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ']

export function teamMood(name) {
  return MOOD_EMOJIS[hashIndex(name, MOOD_EMOJIS.length)]
}

export function pseudoActivityTimestamp(teamId) {
  const base = 1700000000000
  const offset = hashIndex(String(teamId), 7 * 24 * 60) * 60000
  return new Date(base + offset).toISOString()
}

export const CATEGORIES = ['all', 'mine', 'engineering', 'design', 'marketing', 'product', 'favorites']

export function detectTeamCategory(team, userId) {
  const text = `${team.name || ''} ${team.description || ''}`.toLowerCase()
  const isMember = team.members?.some(
    m => m.userId === userId || m.username?.toLowerCase() === userId?.toLowerCase?.()
  )
  if (isMember) return 'mine'
  if (/eng|dev|tech|engineer|coding|backend|frontend|infra|platform/i.test(text)) return 'engineering'
  if (/design|ux|ui|creative|visual|brand|illust|art/i.test(text)) return 'design'
  if (/market|growth|campaign|content|social|seo|brand|pr|ads/i.test(text)) return 'marketing'
  if (/product|pm|strategy|roadmap|feature/i.test(text)) return 'product'
  return 'all'
}
