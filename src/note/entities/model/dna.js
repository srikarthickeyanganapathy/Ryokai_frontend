/**
 * Note DNA -- auto-derived fingerprint computed from real note content.
 * Never stored, never mocked. Powers the Notes Garden cards and the
 * Focus Editor footer (checklist progress, reading time, freshness).
 */

const FRESH_MS = 24 * 60 * 60 * 1000;   // < 1 day old
const WEEK_MS = 7 * 24 * 60 * 60 * 1000; // < 7 days old

/**
 * @param {import('./types').Note} note
 * @returns {{ words:number, checklistTotal:number, checklistDone:number,
 *             progress:number, hasCode:boolean, hasQuote:boolean,
 *             hasChecklist:boolean, freshness:'fresh'|'recent'|'old',
 *             readingMinutes:number }}
 */
export function noteDna(note) {
  const content = note?.content || '';

  const words = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const checklistMatches = content.match(/^[-*]\s+\[[ xX]\]\s+/gm) || [];
  const checklistDone = (content.match(/^[-*]\s+\[[xX]\]\s+/gm) || []).length;
  const hasChecklist = checklistMatches.length > 0;
  const hasCode = content.includes('```');
  const hasQuote = /^>\s/m.test(content);
  const progress = hasChecklist ? Math.min(100, Math.round((checklistDone / checklistMatches.length) * 100)) : 0;

  let freshness = 'old';
  if (note?.updatedAt) {
    const age = Date.now() - new Date(note.updatedAt).getTime();
    if (age >= 0 && age < FRESH_MS) freshness = 'fresh';
    else if (age >= 0 && age < WEEK_MS) freshness = 'recent';
  }

  return {
    words,
    checklistTotal: checklistMatches.length,
    checklistDone,
    progress,
    hasCode,
    hasQuote,
    hasChecklist,
    freshness,
    readingMinutes: Math.max(1, Math.ceil(words / 200)),
  };
}
