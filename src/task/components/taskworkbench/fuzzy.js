/**
 * Fuzzy search — lightweight scoring algorithm.
 * Returns scored matches sorted by relevance.
 * Inspired by VS Code's fuzzy matching logic.
 */

/**
 * Score a single string against a query.
 * @returns {number} score (higher = better), or -1 if no match
 */
export function fuzzyScore(query, target) {
  if (!query) return 0
  if (!target) return -1

  const q = query.toLowerCase()
  const t = target.toLowerCase()

  // Exact match
  if (t === q) return 1000

  // Starts with query
  if (t.startsWith(q)) return 900 + (q.length / t.length) * 100

  // Word-boundary match (e.g. "auth" matches "user authentication")
  const words = t.split(/[\s\-_.,/]+/)
  let wordScore = -1
  for (const w of words) {
    if (w.startsWith(q)) {
      wordScore = Math.max(wordScore, 700 + (q.length / w.length) * 100)
    }
  }
  if (wordScore > 0) return wordScore

  // Substring match
  const idx = t.indexOf(q)
  if (idx >= 0) return 500 - idx + (q.length / t.length) * 50

  // Character-by-character fuzzy match
  let qi = 0
  let score = 0
  let lastMatchIdx = -1
  let consecutive = 0

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += 10
      if (lastMatchIdx === ti - 1) {
        consecutive++
        score += consecutive * 5
      } else {
        consecutive = 0
      }
      lastMatchIdx = ti
      qi++
    }
  }

  if (qi < q.length) return -1 // Not all chars matched

  // Penalize length difference
  score -= (t.length - q.length) * 0.5

  return Math.max(score, 1)
}

/**
 * Filter and sort items by fuzzy score against a query.
 * @param {Array} items - items to filter
 * @param {string} query - search query
 * @param {Function} getText - function to extract searchable text from item
 * @returns {Array} filtered and sorted items (highest score first)
 */
export function fuzzyFilter(items, query, getText) {
  if (!query) return items

  return items
    .map((item) => ({
      item,
      score: fuzzyScore(query, getText(item)),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.item)
}
