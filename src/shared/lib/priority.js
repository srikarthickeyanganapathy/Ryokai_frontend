/**
 * Priority normalization between frontend display and backend TaskPriority enum.
 *
 * FIX: backend TaskPriority enum is { LOW, MEDIUM, HIGH, URGENT }.
 * The old code listed 'NORMAL' and 'NONE' which don't exist in the backend.
 * 'NORMAL' has been replaced with 'MEDIUM' to match the backend enum exactly.
 * 'NONE' has been removed entirely — the backend requires a priority value.
 */
export const PRIORITY_OPTIONS = [
  { value: 'URGENT', label: 'Urgent', color: 'red' },
  { value: 'HIGH',   label: 'High',   color: 'orange' },
  { value: 'MEDIUM', label: 'Medium', color: 'blue' },
  { value: 'LOW',    label: 'Low',    color: 'gray' },
]

/** Normalize any priority value to a display label */
export const normalizePriority = (p) => {
  if (!p) return 'Medium'
  const upper = String(p).toUpperCase()
  // Backwards-compat: old data may have 'NORMAL' — map to 'MEDIUM'
  if (upper === 'NORMAL') return 'Medium'
  if (upper === 'NONE') return 'Low'
  return PRIORITY_OPTIONS.find(o => o.value === upper)?.label || 'Medium'
}

/** Normalize to backend enum value */
export const toBackendPriority = (p) => {
  if (!p) return 'MEDIUM'
  const upper = String(p).toUpperCase()
  // Backwards-compat: map old 'NORMAL' to 'MEDIUM' so legacy forms still work
  if (upper === 'NORMAL') return 'MEDIUM'
  if (upper === 'NONE') return 'LOW'
  if (PRIORITY_OPTIONS.find(o => o.value === upper)) return upper
  // Try matching by label
  const match = PRIORITY_OPTIONS.find(o => o.label.toLowerCase() === String(p).toLowerCase())
  return match?.value || 'MEDIUM'
}
