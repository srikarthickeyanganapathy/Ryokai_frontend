import { useState, useCallback, useMemo } from 'react'

/**
 * useGraphWorkspace — The core hook for Nebula's graph-native exploration.
 *
 * Returns three separated concerns:
 *   context   — shared graph state, selection, highlighting
 *   navigator — per-window history, back/forward, pins
 *   analysis  — graph computation engine (blockers, unlocks, critical path, etc.)
 */
export default function useGraphWorkspace({ graph, allTasks, initialTaskId }) {
  // --- Navigator State ---
  const [history, setHistory] = useState(initialTaskId ? [initialTaskId] : [])
  const [historyIndex, setHistoryIndex] = useState(initialTaskId ? 0 : -1)
  const [pinned, setPinned] = useState(new Set())

  const currentTaskId = historyIndex >= 0 && historyIndex < history.length ? history[historyIndex] : null

  // Build lookup maps
  const taskMap = useMemo(() => {
    const m = new Map()
    allTasks.forEach(t => m.set(t.id, t))
    return m
  }, [allTasks])

  const currentTask = currentTaskId ? taskMap.get(currentTaskId) || null : null

  // --- Navigator API ---
  const navigateTo = useCallback((taskId) => {
    if (!taskId || taskId === currentTaskId) return
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(taskId)
      return newHistory
    })
    setHistoryIndex(prev => prev + 1)
  }, [currentTaskId, historyIndex])

  const goBack = useCallback(() => {
    if (historyIndex > 0) setHistoryIndex(prev => prev - 1)
  }, [historyIndex])

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) setHistoryIndex(prev => prev + 1)
  }, [historyIndex, history.length])

  const canGoBack = historyIndex > 0
  const canGoForward = historyIndex < history.length - 1

  const pin = useCallback((taskId) => {
    setPinned(prev => new Set([...prev, taskId]))
  }, [])

  const unpin = useCallback((taskId) => {
    setPinned(prev => {
      const next = new Set(prev)
      next.delete(taskId)
      return next
    })
  }, [])

  const clearPins = useCallback(() => setPinned(new Set()), [])

  const breadcrumbs = useMemo(() => {
    return history.slice(0, historyIndex + 1).map(id => {
      const t = taskMap.get(id)
      return { id, title: t?.title || `Task #${id}` }
    })
  }, [history, historyIndex, taskMap])

  // --- Analysis Engine ---

  // Build adjacency indexes
  const { blockersOf, unblocksOf, childrenOf } = useMemo(() => {
    const blockersOf = new Map() // taskId → [tasks that block it]
    const unblocksOf = new Map() // taskId → [tasks it unblocks]
    const childrenOf = new Map() // taskId → [child tasks]

    allTasks.forEach(task => {
      if (Array.isArray(task.blockedBy)) {
        task.blockedBy.forEach(dep => {
          if (!unblocksOf.has(dep.id)) unblocksOf.set(dep.id, [])
          unblocksOf.get(dep.id).push(task)

          if (!blockersOf.has(task.id)) blockersOf.set(task.id, [])
          blockersOf.get(task.id).push(taskMap.get(dep.id) || dep)
        })
      }

      if (task.parentTaskId) {
        if (!childrenOf.has(task.parentTaskId)) childrenOf.set(task.parentTaskId, [])
        childrenOf.get(task.parentTaskId).push(task)
      }
    })

    return { blockersOf, unblocksOf, childrenOf }
  }, [allTasks, taskMap])

  const getBlockers = useCallback((taskId) => {
    return blockersOf.get(taskId) || []
  }, [blockersOf])

  const getUnblocks = useCallback((taskId) => {
    return unblocksOf.get(taskId) || []
  }, [unblocksOf])

  const getDownstreamCascade = useCallback((taskId, visited = new Set()) => {
    if (visited.has(taskId)) return [] // cycle protection
    visited.add(taskId)

    const direct = unblocksOf.get(taskId) || []
    const result = [...direct]

    direct.forEach(t => {
      result.push(...getDownstreamCascade(t.id, visited))
    })

    return result
  }, [unblocksOf])

  const getCriticalPath = useCallback((taskId) => {
    // Find longest path through this task (upstream + downstream)
    const findLongestUpstream = (id, visited = new Set()) => {
      if (visited.has(id)) return []
      visited.add(id)
      const blockers = blockersOf.get(id) || []
      if (blockers.length === 0) return [id]

      let longest = []
      blockers.forEach(b => {
        const path = findLongestUpstream(b.id, visited)
        if (path.length > longest.length) longest = path
      })
      return [...longest, id]
    }

    const findLongestDownstream = (id, visited = new Set()) => {
      if (visited.has(id)) return []
      visited.add(id)
      const unblocked = unblocksOf.get(id) || []
      if (unblocked.length === 0) return [id]

      let longest = []
      unblocked.forEach(u => {
        const path = findLongestDownstream(u.id, visited)
        if (path.length > longest.length) longest = path
      })
      return [id, ...longest]
    }

    const upstream = findLongestUpstream(taskId)
    const downstream = findLongestDownstream(taskId)

    // Merge: upstream (excluding taskId at end) + downstream
    return [...upstream.slice(0, -1), ...downstream].map(id => taskMap.get(id) || { id, title: `Task #${id}` })
  }, [blockersOf, unblocksOf, taskMap])

  const getNeighbors = useCallback((taskId, hops = 1) => {
    const visited = new Set([taskId])
    let frontier = [taskId]

    for (let h = 0; h < hops; h++) {
      const nextFrontier = []
      frontier.forEach(id => {
        const blockers = blockersOf.get(id) || []
        const unblocked = unblocksOf.get(id) || []
        const children = childrenOf.get(id) || []

        ;[...blockers, ...unblocked, ...children].forEach(t => {
          const tid = t.id || t
          if (!visited.has(tid)) {
            visited.add(tid)
            nextFrontier.push(tid)
          }
        })
      })
      frontier = nextFrontier
    }

    visited.delete(taskId)
    return Array.from(visited).map(id => taskMap.get(id)).filter(Boolean)
  }, [blockersOf, unblocksOf, childrenOf, taskMap])

  const getProjectCluster = useCallback((taskId) => {
    const task = taskMap.get(taskId)
    if (!task?.projectId) return []
    return allTasks.filter(t => t.projectId === task.projectId && t.id !== taskId)
  }, [allTasks, taskMap])

  const getAssigneeWorkload = useCallback((taskId) => {
    const task = taskMap.get(taskId)
    const assignee = task?.assignedTo || task?.assignee
    if (!assignee) return []
    return allTasks.filter(t => (t.assignedTo === assignee || t.assignee === assignee) && t.id !== taskId)
  }, [allTasks, taskMap])

  const getStatusDistribution = useCallback((tasks) => {
    const dist = {}
    tasks.forEach(t => {
      const status = t.status || t.currentStatus || 'UNKNOWN'
      dist[status] = (dist[status] || 0) + 1
    })
    return dist
  }, [])

  const getBottlenecks = useCallback(() => {
    // Tasks with the most downstream dependents
    const scores = []
    allTasks.forEach(task => {
      const downstream = getDownstreamCascade(task.id)
      if (downstream.length > 0) {
        const status = task.status || task.currentStatus || 'OPEN'
        const isStuck = status !== 'COMPLETED' && status !== 'DONE'
        scores.push({
          task,
          downstreamCount: downstream.length,
          isStuck,
          riskScore: downstream.length * (isStuck ? 2 : 0.5)
        })
      }
    })
    return scores.sort((a, b) => b.riskScore - a.riskScore).slice(0, 10)
  }, [allTasks, getDownstreamCascade])

  const getInsights = useCallback(() => {
    const insights = []

    // Find biggest blockers
    const bottlenecks = getBottlenecks()
    bottlenecks.slice(0, 3).forEach(b => {
      if (b.isStuck && b.downstreamCount >= 2) {
        insights.push({
          type: 'blocker',
          severity: b.downstreamCount >= 5 ? 'critical' : 'warning',
          message: `"${b.task.title}" blocks ${b.downstreamCount} task${b.downstreamCount > 1 ? 's' : ''}`,
          taskId: b.task.id
        })
      }
    })

    // Find stalled queues
    const statusDist = getStatusDistribution(allTasks)
    Object.entries(statusDist).forEach(([status, count]) => {
      if (count >= 5 && status !== 'COMPLETED' && status !== 'DONE') {
        insights.push({
          type: 'queue',
          severity: count >= 8 ? 'critical' : 'info',
          message: `${count} tasks in ${status.replace(/_/g, ' ')}`,
          status
        })
      }
    })

    // Find overdue tasks
    const now = new Date()
    const overdue = allTasks.filter(t => {
      if (!t.dueDate) return false
      const due = new Date(t.dueDate)
      const status = t.status || t.currentStatus || 'OPEN'
      return due < now && status !== 'COMPLETED' && status !== 'DONE'
    })
    if (overdue.length > 0) {
      insights.push({
        type: 'overdue',
        severity: overdue.length >= 3 ? 'critical' : 'warning',
        message: `${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}`,
        taskIds: overdue.map(t => t.id)
      })
    }

    // Find unassigned high-priority work
    const unassignedUrgent = allTasks.filter(t => {
      const p = (t.priority || '').toUpperCase()
      return (p === 'URGENT' || p === 'HIGH') && !t.assignedTo && !t.assignee
    })
    if (unassignedUrgent.length > 0) {
      insights.push({
        type: 'unassigned',
        severity: 'warning',
        message: `${unassignedUrgent.length} high-priority task${unassignedUrgent.length > 1 ? 's' : ''} unassigned`,
        taskIds: unassignedUrgent.map(t => t.id)
      })
    }

    return insights.sort((a, b) => {
      const sev = { critical: 0, warning: 1, info: 2 }
      return (sev[a.severity] || 3) - (sev[b.severity] || 3)
    })
  }, [allTasks, getBottlenecks, getStatusDistribution])

  // --- Return separated concerns ---
  return {
    context: {
      graph,
      allTasks,
      taskMap,
      currentTaskId,
      currentTask
    },
    navigator: {
      currentTaskId,
      currentTask,
      history,
      historyIndex,
      breadcrumbs,
      pinned,
      navigateTo,
      goBack,
      goForward,
      canGoBack,
      canGoForward,
      pin,
      unpin,
      clearPins
    },
    analysis: {
      getBlockers,
      getUnblocks,
      getDownstreamCascade,
      getCriticalPath,
      getNeighbors,
      getProjectCluster,
      getAssigneeWorkload,
      getStatusDistribution,
      getBottlenecks,
      getInsights
    }
  }
}
