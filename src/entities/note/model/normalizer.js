/**
 * Normalize note DTO
 * @param {Object} note - Raw backend note
 * @returns {import('./types').Note} Normalized note object
 */
export const normalizeNote = (note) => {
  if (!note || typeof note !== 'object') return note;
  return {
    ...note,
    isPinned: note.isPinned ?? note.pinned ?? false,
  };
};
