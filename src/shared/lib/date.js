import { format, isToday, isTomorrow, isYesterday, differenceInDays, parseISO, isPast } from 'date-fns'

export function getSmartDate(dateString) {
  if (!dateString) return 'No Date'
  
  const date = parseISO(dateString)
  
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isYesterday(date)) return 'Yesterday'
  
  const diff = differenceInDays(date, new Date())
  
  if (diff > 1 && diff <= 7) return `In ${diff} days`
  if (diff < -1 && isPast(date)) return `${Math.abs(diff)} days overdue`
  
  return format(date, 'MMM d, yyyy')
}

export function formatTimeAgo(dateString) {
  if (!dateString) return null
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Recently'
  const diff = Math.floor((Date.now() - date) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
