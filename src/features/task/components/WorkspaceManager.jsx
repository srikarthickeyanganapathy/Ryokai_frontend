import React, { useMemo } from 'react'
import WorkspaceWindow from './WorkspaceWindow'
import useGraphWorkspace from './hooks/useGraphWorkspace'

// Explorer imports (Analysis Modes)
import DependencyExplorer from './explorers/DependencyExplorer'
import ImpactExplorer from './explorers/ImpactExplorer'
import RelationshipExplorer from './explorers/RelationshipExplorer'
import HistoryExplorer from './explorers/HistoryExplorer'
import ExecutionExplorer from './explorers/ExecutionExplorer'
import FlowExplorer from './explorers/FlowExplorer'
import TaskWorkspace from './explorers/TaskWorkspace'

import { Network, Zap, Globe, Target, Clock, Waves, Eye } from 'lucide-react'

// Explorer Registry — Analysis Modes
const EXPLORER_REGISTRY = {
  dependency: { Component: DependencyExplorer, title: 'Dependencies', icon: Network, badge: 'Analysis' },
  impact: { Component: ImpactExplorer, title: 'Impact', icon: Zap, badge: 'Analysis' },
  relationship: { Component: RelationshipExplorer, title: 'Relationship Map', icon: Globe, badge: 'Analysis' },
  history: { Component: HistoryExplorer, title: 'Timeline', icon: Clock, badge: 'Analysis' },
  execution: { Component: ExecutionExplorer, title: 'Execution Readiness', icon: Target, badge: 'Analysis' },
  flow: { Component: FlowExplorer, title: 'Flow', icon: Waves, badge: 'Analysis' },
  taskContext: { Component: TaskWorkspace, title: 'Task Context', icon: Eye, badge: 'Context' }
}

/**
 * ExplorerWindowInstance — wraps an explorer with its own GraphNavigator.
 * Each window gets an independent history/navigation stack, but shares graph data.
 */
function ExplorerWindowInstance({
  win,
  graph,
  allTasks,
  onClose,
  onFocus,
  onDockChange,
  onCameraSync,
  onOpenWorkbench,
  onOpenAnalysis
}) {
  const explorerDef = EXPLORER_REGISTRY[win.type]
  if (!explorerDef) return null

  const { Component } = explorerDef
  const meta = explorerDef

  // Per-window GraphWorkspace (independent navigator, shared graph data)
  const { context, navigator, analysis } = useGraphWorkspace({
    graph,
    allTasks,
    initialTaskId: win.taskId
  })

  // Sync camera on navigation
  const handleCenterOnGraph = () => {
    if (navigator.currentTaskId) {
      onCameraSync?.(navigator.currentTaskId)
    }
  }

  return (
    <WorkspaceWindow
      key={win.id}
      windowId={win.id}
      title={meta.title}
      icon={meta.icon}
      badge={meta.badge}
      screenPos={win.screenPos}
      zIndex={win.zIndex || 50}
      dockPos={win.dockPos || 'center'}
      onClose={() => onClose?.(win.id)}
      onFocus={() => onFocus?.(win.id)}
      onDockChange={(newDockPos) => onDockChange?.(win.id, newDockPos)}
    >
      <Component
        context={context}
        navigator={navigator}
        analysis={analysis}
        onCenterOnGraph={handleCenterOnGraph}
        onOpenWorkbench={onOpenWorkbench}
        onOpenAnalysis={onOpenAnalysis}
      />
    </WorkspaceWindow>
  )
}

export default function WorkspaceManager({
  windows = [],
  graph,
  allTasks = [],
  onCloseWindow,
  onFocusWindow,
  onDockChangeWindow,
  onCameraSync,
  onOpenWorkbench,
  onOpenAnalysis
}) {
  if (!windows || windows.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {windows.map(win => (
        <ExplorerWindowInstance
          key={win.id}
          win={win}
          graph={graph}
          allTasks={allTasks}
          onClose={onCloseWindow}
          onFocus={onFocusWindow}
          onDockChange={onDockChangeWindow}
          onCameraSync={onCameraSync}
          onOpenWorkbench={onOpenWorkbench}
          onOpenAnalysis={onOpenAnalysis}
        />
      ))}
    </div>
  )
}
