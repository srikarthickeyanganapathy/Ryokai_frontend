import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TasksSidebar } from "./TasksSidebar";
import { TasksWorkspace } from "./TasksWorkspace";
import { TaskContextPanel } from "./TaskContextPanel";

const LARGE_BP = 1280;
const TABLET_BP = 768;

function getBreakpoints(width) {
  return {
    large:  width >= LARGE_BP,
    tablet: width >= TABLET_BP && width < LARGE_BP,
    mobile: width < TABLET_BP,
  };
}

export function TasksWorkbench({
  tasks, isLoading, isError, error, onRetry,
  selectedTask, onTaskSelect, onTaskClose,
  activeView, onViewChange,
  onTaskStatusChange, onQuickComplete, onQuickDelete,
  rowSelection, setRowSelection, user,
  workspaceFooter,
  searchActive, filtersActive, onClearFilters, onCreateTask,
  taskScope, onScopeChange,
  globalFilter, setGlobalFilter,
  priorityFilter, onPriorityFilterChange,
  sortBy, onSortChange,
  projectFilter, onProjectFilterChange,
  teamFilter, onTeamFilterChange,
  projectsList, teamsList,
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // collapsed by default
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [width, setWidth] = useState(() => typeof window !== "undefined" ? window.innerWidth : 1440);
  const [panelWidth, setPanelWidth] = useState(420);

  useEffect(() => {
    const check = () => setWidth(window.innerWidth);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const bp = getBreakpoints(width);

  // Sidebar: only inline on large, drawer on tablet/mobile
  const sidebarInline = bp.large;
  // Panel: inline on large+tablet, overlay on mobile
  const panelInline = bp.large || bp.tablet;

  useEffect(() => {
    if (sidebarInline && drawerOpen) setDrawerOpen(false);
  }, [sidebarInline, drawerOpen]);

  const toggleSidebar = useCallback(() => setSidebarCollapsed(p => !p), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex flex-1 min-h-0 w-full overflow-hidden relative">
      {/* Inline Sidebar — large only, reduced width, task list only */}
      {sidebarInline && (
        <div className="shrink-0 relative z-20" style={{ width: sidebarCollapsed ? 0 : 220 }}>
          {!sidebarCollapsed && (
            <TasksSidebar
              tasks={tasks}
              viewMode={activeView}
              onViewChange={onViewChange}
              taskScope={taskScope}
              onScopeChange={onScopeChange}
              selectedTaskId={selectedTask?.id}
              onTaskSelect={onTaskSelect}
              collapsed={false}
              onToggleCollapse={toggleSidebar}
              hideScopeTabs
              hideViewToggle
            />
          )}
        </div>
      )}

      {/* Drawer for mobile/tablet */}
      {!sidebarInline && (
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={closeDrawer} className="absolute inset-0 z-30 bg-black/40" />
              <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", stiffness: 380, damping: 34 }} className="absolute top-0 left-0 bottom-0 z-40 w-[260px] max-w-[85vw] shadow-2xl">
                <TasksSidebar tasks={tasks} activeView={activeView} onViewChange={onViewChange} taskScope={taskScope} onScopeChange={onScopeChange} selectedTaskId={selectedTask?.id} onTaskSelect={onTaskSelect} collapsed={false} onToggleCollapse={closeDrawer} onNavigate={closeDrawer} hideScopeTabs hideViewToggle />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Main workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--bg-base)]/60">
        <div className="flex-1 overflow-hidden">
          <TasksWorkspace
            tasks={tasks} isLoading={isLoading} isError={isError} error={error} onRetry={onRetry}
            viewMode={activeView} onTaskClick={onTaskSelect}
            onTaskStatusChange={onTaskStatusChange} onQuickComplete={onQuickComplete} onQuickDelete={onQuickDelete}
            rowSelection={rowSelection} setRowSelection={setRowSelection}
            searchActive={searchActive} filtersActive={filtersActive} onClearFilters={onClearFilters} onCreateTask={onCreateTask}
            taskScope={taskScope} onScopeChange={onScopeChange}
            globalFilter={globalFilter} setGlobalFilter={setGlobalFilter}
            priorityFilter={priorityFilter} onPriorityFilterChange={onPriorityFilterChange}
            sortBy={sortBy} onSortChange={onSortChange}
            projectFilter={projectFilter} onProjectFilterChange={onProjectFilterChange}
            teamFilter={teamFilter} onTeamFilterChange={onTeamFilterChange}
            projectsList={projectsList} teamsList={teamsList}
            showSidebarToggle={!sidebarInline}
            onSidebarToggle={openDrawer}
            onViewChange={onViewChange}
          />
        </div>
        {workspaceFooter && <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-30"><div className="pointer-events-auto">{workspaceFooter}</div></div>}
      </div>

      {/* Task Panel — inline or overlay */}
      {panelInline && <TaskContextPanel task={selectedTask} isOpen={!!selectedTask} onClose={onTaskClose} width={panelWidth} onWidthChange={setPanelWidth} isLoading={false} />}
      {!panelInline && (
        <AnimatePresence>
          {selectedTask && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onTaskClose} className="absolute inset-0 z-30 bg-black/30" />
              <motion.div key="panel-overlay" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 380, damping: 34 }} className="absolute top-0 right-0 bottom-0 z-40 shadow-2xl" style={{ width: Math.min(panelWidth, width - 48) }}>
                <TaskContextPanel task={selectedTask} isOpen={true} onClose={onTaskClose} width={Math.min(panelWidth, width - 48)} onWidthChange={setPanelWidth} isLoading={false} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

export { TasksSidebar } from "./TasksSidebar";
export { TasksWorkspace } from "./TasksWorkspace";
export { TaskContextPanel } from "./TaskContextPanel";
