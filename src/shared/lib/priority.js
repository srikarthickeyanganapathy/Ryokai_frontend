/**
 * Priority normalization between frontend display and backend TaskPriority enum.
 * Backend: URGENT, HIGH, NORMAL, LOW, NONE
 */
export const PRIORITY_OPTIONS = [
  { value: 'URGENT', label: 'Urgent', color: 'red' },
  { value: 'HIGH',   label: 'High',   color: 'orange' },
  { value: 'NORMAL', label: 'Normal', color: 'blue' },
  { value: 'LOW',    label: 'Low',    color: 'gray' },
  { value: 'NONE',   label: 'None',   color: 'muted' },
]

/** Normalize any priority value to a display label */
export const normalizePriority = (p) => {
  if (!p) return 'Normal'
  const upper = String(p).toUpperCase()
  return PRIORITY_OPTIONS.find(o => o.value === upper)?.label || 'Normal'
}

/** Normalize to backend enum value */
export const toBackendPriority = (p) => {
  if (!p) return 'NORMAL'
  const upper = String(p).toUpperCase()
  if (PRIORITY_OPTIONS.find(o => o.value === upper)) return upper
  // Try matching by label
  const match = PRIORITY_OPTIONS.find(o => o.label.toLowerCase() === String(p).toLowerCase())
  return match?.value || 'NORMAL'
}
