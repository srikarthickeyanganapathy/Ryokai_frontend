import {
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parseISO,
  isToday,
  isBefore,
  isEqual,
  startOfToday,
  addDays,
  format,
} from 'date-fns'
import { normalizePriority } from '@/shared/lib/priority'
import { isDoneStatus, isActiveStatus } from '@/shared/lib/status'

/** Check if a status represents cancelled/rejected */
const isCancelled = (s) => {
  const u = String(s || '').toUpperCase()
  return u === 'CANCELLED' || u === 'CANCELED' || u === 'REJECTED'
}

/** Check if a status represents done/completed */
const isDone = (s) => isDoneStatus(s)

/** Check if a status represents in-progress (ASSIGNED or SUBMITTED but not done/cancelled) */
const isInProgress = (s) => isActiveStatus(s)

/** Check if a status represents todo */
const isTodo = (s) => {
  const u = String(s || '').toUpperCase()
  return u === 'TODO' || u === 'ASSIGNED'
}

export const selectCompletionRate = (tasks = []) => {
  if (tasks.length === 0) return 0
  const completed = tasks.filter((t) => isDone(t.status)).length
  return Math.round((completed / tasks.length) * 100)
}

export const selectVelocity = (tasks = []) => {
  const today = new Date()
  const start = startOfWeek(today)
  const end = endOfWeek(today)

  return tasks.filter((t) => {
    if (!isDone(t.status)) return false
    if (!t.dueDate) return false
    return isWithinInterval(parseISO(t.dueDate), { start, end })
  }).length
}

export const selectTasksCreated = (tasks = []) => {
  return tasks.length
}

export const selectTasksFinished = (tasks = []) => {
  return tasks.filter((t) => isDone(t.status)).length
}

export const selectOverdue = (tasks = []) => {
  const today = startOfToday()
  return tasks.filter((t) => {
    if (isDone(t.status) || !t.dueDate) return false
    return isBefore(parseISO(t.dueDate), today)
  }).length
}

export const selectDueToday = (tasks = []) => {
  return tasks.filter((t) => {
    if (isDone(t.status) || !t.dueDate) return false
    return isToday(parseISO(t.dueDate))
  }).length
}

export const selectBlocked = (tasks = []) => {
  return tasks.filter(
    (t) => isCancelled(t.status) || (t.tags && t.tags.includes('Blocked'))
  ).length
}

export const selectAverageCompletionTime = (tasks = []) => {
  const completed = tasks.filter((t) => isDone(t.status))
  if (completed.length === 0) return 0

  const totalMinutes = completed.reduce(
    (acc, t) => acc + (t.timeEstimateMinutes || 120),
    0
  )
  return Math.round(totalMinutes / completed.length / 60)
}

export const selectPriorityDistribution = (tasks = []) => {
  const dist = { Urgent: 0, High: 0, Normal: 0, Low: 0 }
  tasks.forEach((t) => {
    const key = normalizePriority(t.priority)
    if (dist[key] !== undefined) {
      dist[key]++
    }
  })
  return Object.keys(dist).map((name) => ({ name, value: dist[name] }))
}

export const selectStatusDistribution = (tasks = []) => {
  const dist = { Todo: 0, 'In Progress': 0, Done: 0, Canceled: 0 }
  tasks.forEach((t) => {
    if (isTodo(t.status)) dist['Todo']++
    else if (isInProgress(t.status)) dist['In Progress']++
    else if (isDone(t.status)) dist['Done']++
    else if (isCancelled(t.status)) dist['Canceled']++
  })
  return Object.keys(dist).map((name) => ({ name, value: dist[name] }))
}

export const selectWeeklyProductivity = (tasks = []) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const buckets = days.reduce((acc, day) => {
    acc[day] = { Todo: 0, InProgress: 0, Done: 0 }
    return acc
  }, {})

  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

  tasks.forEach((t) => {
    if (!t.dueDate) return
    let due
    try {
      due = parseISO(t.dueDate)
    } catch {
      return
    }
    if (!isWithinInterval(due, { start: weekStart, end: weekEnd })) return

    const dayIdx = due.getDay()
    const dayKey = days[dayIdx === 0 ? 6 : dayIdx - 1]

    if (isDone(t.status)) {
      buckets[dayKey].Done++
    } else if (isInProgress(t.status)) {
      buckets[dayKey].InProgress++
    } else if (isTodo(t.status)) {
      buckets[dayKey].Todo++
    }
  })

  return days.map((day) => ({
    name: day,
    Todo: buckets[day].Todo,
    InProgress: buckets[day].InProgress || 0,
    Done: buckets[day].Done,
  }))
}

export const selectWorkloadMatrix = (tasks = []) => {
  const today = startOfToday()
  const labels = ['Today', 'Tomorrow']
  const buckets = [
    { name: 'Today', workload: 0 },
    { name: 'Tomorrow', workload: 0 },
  ]

  for (let i = 2; i < 7; i++) {
    const day = addDays(today, i)
    const label = format(day, 'EEE')
    labels.push(label)
    buckets.push({ name: label, workload: 0 })
  }

  tasks.forEach((t) => {
    if (!t.dueDate || isDone(t.status)) return
    let due
    try {
      due = parseISO(t.dueDate)
    } catch {
      return
    }
    due = new Date(due.getFullYear(), due.getMonth(), due.getDate())

    for (let i = 0; i < 7; i++) {
      const day = addDays(today, i)
      if (isEqual(due, day)) {
        buckets[i].workload++
        break
      }
    }
  })

  return buckets
}
