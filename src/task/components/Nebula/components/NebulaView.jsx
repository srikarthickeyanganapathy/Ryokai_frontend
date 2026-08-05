import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import TaskNebulaGraph from '../graph/TaskNebulaGraph';
import WorkspaceManager from './WorkspaceManager';
import NebulaFilterCenter from './NebulaFilterCenter';
import NebulaHud from './NebulaHud';
import AnalyzeMenu from './AnalyzeMenu';
import InsightEngine from '../engines/InsightEngine';
import useGraphWorkspace from '../hooks/useGraphWorkspace';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { useAuth } from '@/identity';
import { filterTasksByWorkspace } from '@/shared/lib/workspaceTaskFilter';

const PRIORITY_COLORS = {
  URGENT: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#3b82f6',
  LOW: '#10b981'
};

const transformTasksToWorkGraph = (tasks = []) => {
  const nodes = [];
  const links = [];
  const taskIdSet = new Set(tasks.map(t => t.id));

  tasks.forEach(task => {
    const priority = (task.priority || 'MEDIUM').toUpperCase();
    const color = PRIORITY_COLORS[priority] || '#3b82f6';

    nodes.push({
      id: task.id,
      title: task.title,
      name: task.title,
      priority,
      status: task.status || task.currentStatus,
      assignee: task.assignedTo || task.assignee,
      color,
      val: priority === 'URGENT' ? 10 : priority === 'HIGH' ? 8 : 6,
      description: task.description || '',
      rawTask: task
    });

    if (Array.isArray(task.blockedBy)) {
      task.blockedBy.forEach(dep => {
        if (taskIdSet.has(dep.id)) {
          links.push({
            source: dep.id,
            target: task.id,
            type: 'blocking',
            color: '#f43f5e'
          });
        }
      });
    }

    if (task.parentTaskId && taskIdSet.has(task.parentTaskId)) {
      links.push({
        source: task.parentTaskId,
        target: task.id,
        type: 'parent',
        color: '#a855f7'
      });
    }

    if (task.projectId) {
      const sameProjectTasks = tasks.filter(t => t.id !== task.id && t.projectId === task.projectId);
      if (sameProjectTasks.length > 0) {
        const target = sameProjectTasks[0];
        links.push({
          source: task.id,
          target: target.id,
          type: 'related',
          color: '#64748b'
        });
      }
    }
  });

  return { nodes, links };
};

export default function NebulaView({ tasks = [], onTaskSelect }) {
  const { workspaceMode, activeOrganization } = useWorkspace();
  const { user } = useAuth();

  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreset, setActivePreset] = useState('all');
  const [customFilters, setCustomFilters] = useState({});

  // Selection & Windows
  const [selectedTaskNode, setSelectedTaskNode] = useState(null);
  const [openWindows, setOpenWindows] = useState([]);
  const [isAutoRotating, setIsAutoRotating] = useState(false);

  // Analyze Menu
  const [analyzeMenuState, setAnalyzeMenuState] = useState(null); // { position, task }

  // Explorer-driven highlight
  const [highlightTaskId, setHighlightTaskId] = useState(null);

  const containerRef = useRef(null);
  const graphControlsRef = useRef(null);

  // 1. Workspace Task Filtering
  const workspaceTasks = useMemo(() => {
    return filterTasksByWorkspace(tasks, workspaceMode, activeOrganization);
  }, [tasks, workspaceMode, activeOrganization]);

  const assigneesList = useMemo(() => {
    const set = new Set();
    workspaceTasks.forEach(t => {
      if (t.assignedTo) set.add(t.assignedTo);
      if (t.assignee) set.add(t.assignee);
    });
    return Array.from(set);
  }, [workspaceTasks]);

  // 2. Query Filtering
  const filteredTasks = useMemo(() => {
    return workspaceTasks.filter(t => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title?.toLowerCase().includes(q);
        const matchId = String(t.id).includes(q);
        if (!matchTitle && !matchId) return false;
      }

      if (activePreset === 'mine') {
        const assignee = t.assignedTo || t.assignee;
        if (assignee !== user?.username) return false;
      } else if (activePreset === 'blocked') {
        if (!t.blockedBy || t.blockedBy.length === 0) return false;
      } else if (activePreset === 'risk') {
        if (t.priority !== 'URGENT' && t.priority !== 'HIGH') return false;
      } else if (activePreset === 'overdue') {
        if (!t.dueDate || new Date(t.dueDate) > new Date()) return false;
      } else if (activePreset === 'review') {
        if ((t.status || t.currentStatus) !== 'SUBMITTED' && (t.status || t.currentStatus) !== 'IN_REVIEW') return false;
      }

      if (customFilters.priority && t.priority !== customFilters.priority) return false;
      if (customFilters.assignee && (t.assignedTo || t.assignee) !== customFilters.assignee) return false;

      return true;
    });
  }, [workspaceTasks, searchQuery, activePreset, customFilters, user]);

  // 3. Build Graph
  useEffect(() => {
    setGraphData(transformTasksToWorkGraph(filteredTasks));
  }, [filteredTasks]);

  // 4. Resize listener
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 5. Causal Path Tracing & Terminal Node
  const { causalPathNodeIds, causalPathLinkIds, unblockedChain, terminalCausalNodeId } = useMemo(() => {
    if (!selectedTaskNode) return { causalPathNodeIds: new Set(), causalPathLinkIds: new Set(), unblockedChain: [], terminalCausalNodeId: null };

    const selectedId = selectedTaskNode.id;
    const pathNodes = new Set([selectedId]);
    const pathLinks = new Set();
    const downstream = [];
    let lastId = null;

    graphData.links.forEach(l => {
      const srcId = typeof l.source === 'object' ? l.source.id : l.source;
      const tgtId = typeof l.target === 'object' ? l.target.id : l.target;

      if (srcId === selectedId) {
        pathNodes.add(tgtId);
        pathLinks.add(`${srcId}->${tgtId}`);
        const tgtTask = filteredTasks.find(t => t.id === tgtId);
        if (tgtTask) {
          downstream.push(tgtTask);
          lastId = tgtId;
        }
      }
    });

    return { causalPathNodeIds: pathNodes, causalPathLinkIds: pathLinks, unblockedChain: downstream, terminalCausalNodeId: lastId };
  }, [selectedTaskNode, graphData, filteredTasks]);

  // 6. Insight Engine (uses analysis from a root-level graph workspace)
  const rootWorkspace = useGraphWorkspace({ graph: graphData, allTasks: filteredTasks, initialTaskId: null });
  const insights = useMemo(() => rootWorkspace.analysis.getInsights(), [rootWorkspace.analysis]);

  // --- Event Handlers ---

  // Open analysis mode from AnalyzeMenu or InsightEngine
  const handleOpenAnalysis = useCallback((type, taskId = null) => {
    const targetTaskId = taskId || selectedTaskNode?.id;
    if (!targetTaskId && type !== 'flow') return;

    const windowId = `win-${targetTaskId || 'global'}-${type}`;

    setOpenWindows(prev => {
      const existing = prev.find(w => w.id === windowId);
      const maxZ = Math.max(50, ...prev.map(w => w.zIndex || 50));

      if (existing) {
        return prev.map(w => w.id === windowId ? { ...w, zIndex: maxZ + 1 } : w);
      }

      return [
        ...prev,
        {
          id: windowId,
          type,
          taskId: targetTaskId,
          screenPos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
          zIndex: maxZ + 1,
          dockPos: 'center'
        }
      ];
    });

    setAnalyzeMenuState(null);
  }, [selectedTaskNode]);

  // Open Task Context (double-click)
  const handleOpenTaskContext = useCallback((task, screenPos) => {
    if (!task) return;
    const windowId = `win-${task.id}-taskContext`;

    setOpenWindows(prev => {
      const existing = prev.find(w => w.id === windowId);
      const maxZ = Math.max(50, ...prev.map(w => w.zIndex || 50));

      if (existing) {
        return prev.map(w => w.id === windowId ? { ...w, zIndex: maxZ + 1 } : w);
      }

      return [
        ...prev,
        {
          id: windowId,
          type: 'taskContext',
          taskId: task.id,
          screenPos,
          zIndex: maxZ + 1,
          dockPos: 'right'
        }
      ];
    });
  }, []);

  // Analyze orb click → show radial menu
  const handleAnalyze = useCallback((task, screenPos) => {
    setAnalyzeMenuState({ position: screenPos, task });
  }, []);

  // Camera sync from explorer navigation
  const handleCameraSync = useCallback((taskId) => {
    setHighlightTaskId(taskId);
    graphControlsRef.current?.flyToTask(taskId);
  }, []);

  // Insight click → fly + open analysis
  const handleInsightClick = useCallback((insight) => {
    if (insight.taskId) {
      handleCameraSync(insight.taskId);
      handleOpenAnalysis('dependency', insight.taskId);
    } else if (insight.taskIds?.length > 0) {
      handleCameraSync(insight.taskIds[0]);
    }
  }, [handleCameraSync, handleOpenAnalysis]);

  const handleCloseWindow = useCallback((windowId) => {
    setOpenWindows(prev => prev.filter(w => w.id !== windowId));
  }, []);

  const handleFocusWindow = useCallback((windowId) => {
    setOpenWindows(prev => {
      const maxZ = Math.max(50, ...prev.map(w => w.zIndex || 50));
      return prev.map(w => w.id === windowId ? { ...w, zIndex: maxZ + 1 } : w);
    });
  }, []);

  const handleDockChangeWindow = useCallback((windowId, dockPos) => {
    setOpenWindows(prev => prev.map(w => w.id === windowId ? { ...w, dockPos } : w));
  }, []);

  const handleTaskSelect = (taskNode) => {
    setAnalyzeMenuState(null); // close menu on new selection
    if (taskNode) {
      const raw = taskNode.rawTask || taskNode;
      setSelectedTaskNode(raw);
      if (onTaskSelect) onTaskSelect(raw);
    } else {
      setSelectedTaskNode(null);
      if (onTaskSelect) onTaskSelect(null);
    }
  };

  if (filteredTasks.length === 0 && !searchQuery && activePreset === 'all') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--bg-base)] select-none">
        <h3 className="text-xl font-semibold text-[var(--text-muted)] mb-2">Nebula Empty</h3>
        <p className="text-[var(--text-tertiary)] max-w-md text-center">
          There are no tasks in this workspace to visualize. Switch to Kanban or List view to create tasks.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #0a0e1a 0%, #05060d 60%, #000000 100%)'
      }}
    >
      {/* 1. 3D Graph Engine & Event Emitter */}
      <div className="absolute inset-0 z-0">
        {graphData.nodes.length > 0 && (
          <TaskNebulaGraph
            ref={graphControlsRef}
            data={graphData}
            selectedTaskId={selectedTaskNode?.id}
            highlightTaskId={highlightTaskId}
            causalPathNodeIds={causalPathNodeIds}
            causalPathLinkIds={causalPathLinkIds}
            unblockedChainCount={unblockedChain.length}
            terminalCausalNodeId={terminalCausalNodeId}
            width={dimensions.width}
            height={dimensions.height}
            onTaskSelect={handleTaskSelect}
            onAnalyze={handleAnalyze}
            onOpenTaskContext={handleOpenTaskContext}
          />
        )}
      </div>

      {/* 2. Analyze Radial Menu (progressive disclosure) */}
      {analyzeMenuState && (
        <AnalyzeMenu
          position={analyzeMenuState.position}
          onSelect={(mode) => handleOpenAnalysis(mode, analyzeMenuState.task?.id)}
          onClose={() => setAnalyzeMenuState(null)}
        />
      )}

      {/* 3. Workspace Manager — Explorer Windows with per-window GraphNavigator */}
      <WorkspaceManager
        windows={openWindows}
        graph={graphData}
        allTasks={filteredTasks}
        onCloseWindow={handleCloseWindow}
        onFocusWindow={handleFocusWindow}
        onDockChangeWindow={handleDockChangeWindow}
        onCameraSync={handleCameraSync}
        onOpenAnalysis={handleOpenAnalysis}
      />

      {/* 4. Insight Engine (bottom left, clickable insights that fly the camera) */}
      <InsightEngine
        insights={insights}
        onInsightClick={handleInsightClick}
      />

      {/* 5. Filter Command Center (Top Left) */}
      <NebulaFilterCenter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activePreset={activePreset}
        onSelectPreset={setActivePreset}
        customFilters={customFilters}
        onCustomFilterChange={(key, val) => setCustomFilters(prev => ({ ...prev, [key]: val }))}
        assignees={assigneesList}
      />

      {/* 6. Minimal HUD Controls & Breadcrumb */}
      <NebulaHud
        totalNodes={workspaceTasks.length}
        visibleNodes={filteredTasks.length}
        selectedTask={selectedTaskNode}
        onResetView={() => graphControlsRef.current?.resetView()}
        onZoomIn={() => graphControlsRef.current?.zoomIn()}
        onZoomOut={() => graphControlsRef.current?.zoomOut()}
        isAutoRotating={isAutoRotating}
        onToggleAutoRotate={() => setIsAutoRotating(!isAutoRotating)}
        onExitNebula={() => onTaskSelect?.(null)}
        onOpenInspector={(task) => handleOpenTaskContext(task || selectedTaskNode, { x: window.innerWidth - 300, y: window.innerHeight / 2 })}
        onOpenAnalyze={() => {
          if (selectedTaskNode) {
            handleAnalyze(selectedTaskNode, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
          }
        }}
      />
    </div>
  );
}