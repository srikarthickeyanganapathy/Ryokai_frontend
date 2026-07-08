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
