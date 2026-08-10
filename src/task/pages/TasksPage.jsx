import React, { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTasksPageLogic } from "../hooks/useTasksPageLogic";
import { TasksWorkbench } from "../workbench";
import { TasksModals } from "../features/TasksModals";
import { PageShell, PageHero, PageToolbar } from "@/shared/ui/PageShell";
import { PageState } from "@/shared/ui/PageState";
import { Button } from "@/shared/ui/Button";
import { Text } from "@/shared/ui/Typography";
import { Icons } from "@/shared/ui/Icons";
import { useConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { useRejectTask } from "../entities/hooks/useTasks";
import { toast } from "sonner";
import { ListTodo } from "lucide-react";

export function TasksPage() {
  const logic = useTasksPageLogic();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();
  const rejectTaskMutation = useRejectTask();

  const handleBulkReject = useCallback(async () => {
    const reason = await confirm({ title: "Send back for rework", description: "What needs to change?", requireInput: true, inputPlaceholder: "e.g. Missing criteria...", confirmLabel: "Send back", danger: true });
    if (reason === false) return;
    let skipped = 0;
    logic.selectedTasks.forEach(task => { if (task.currentStatus?.toUpperCase() === "SUBMITTED") rejectTaskMutation.mutate({ id: task.id, reason: reason || "Rework" }); else skipped++; });
    if (skipped > 0) toast.error(skipped + " task(s) skipped");
    logic.setRowSelection({});
  }, [confirm, logic.selectedTasks, rejectTaskMutation, logic.setRowSelection]);

  const hasSelection = logic.selectedIds.length > 0;

  return (
    <>
      {confirmDialog}
      <TasksModals createOpen={logic.createOpen} setCreateOpen={logic.setCreateOpen} reassignData={logic.reassignData} setReassignData={logic.setReassignData} isBulkAssignOpen={logic.isBulkAssignOpen} setIsBulkAssignOpen={logic.setIsBulkAssignOpen} allUsers={logic.allUsers} createTaskMutation={logic.createTaskMutation} updateTaskMutation={logic.updateTaskMutation} onReassignSubmit={logic.handleReassignSubmit} onCreateTask={logic.handleCreateTask} onBulkAssign={logic.handleBulkAssign} />

      <PageShell maxWidth="full">
        {/* PageHero: context the user lands on */}
        <PageHero
          eyebrow={logic.workspaceMode === "PERSONAL" ? "Personal" : logic.workspaceMode === "CREWS" ? "Crew" : "Organization"}
          title="Tasks"
          subtitle="Manage, filter, and track your work across all views."
          icon={ListTodo}
        />

        <PageState state={logic.isLoading ? "loading" : logic.isError ? "error" : "ready"} stateProps={{ loadingVariant: logic.viewMode === "kanban" ? "cards" : "table", onRetry: logic.refetch }} moduleId="tasks">
          <TasksWorkbench
            tasks={logic.tasks} isLoading={logic.isLoading} isError={logic.isError} error={logic.error} onRetry={logic.refetch}
            selectedTask={logic.selectedTask} onTaskSelect={logic.handleTaskSelect} onTaskClose={logic.handleTaskClose}
            activeView={logic.viewMode} onViewChange={logic.setViewMode}
            onTaskStatusChange={logic.onTaskStatusChange} onQuickComplete={logic.handleQuickComplete} onQuickDelete={logic.handleQuickDelete}
            rowSelection={logic.rowSelection} setRowSelection={logic.setRowSelection} user={logic.user}
            searchActive={logic.searchActive} filtersActive={logic.filtersActive} onClearFilters={logic.handleClearFilters}
            onCreateTask={() => logic.setCreateOpen(true)}
            taskScope={logic.taskScope} onScopeChange={logic.setTaskScope}
            globalFilter={logic.globalFilter} setGlobalFilter={logic.setGlobalFilter}
            priorityFilter={logic.priorityFilter} onPriorityFilterChange={logic.setPriorityFilter}
            sortBy={logic.sortBy} onSortChange={logic.setSortBy}
            projectFilter={logic.projectFilter} onProjectFilterChange={logic.setProjectFilter}
            teamFilter={logic.teamFilter} onTeamFilterChange={logic.setTeamFilter}
            projectsList={logic.projectsList} teamsList={logic.teamsList}
            workspaceFooter={
              <AnimatePresence>
                {hasSelection && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] shadow-lg backdrop-blur-xl">
                    <Text size="sm" className="text-[13px] font-medium">{logic.selectedIds.length} selected</Text>
                    <div className="h-4 w-px bg-[var(--color-border-subtle)]" />
                    {(logic.workspaceMode === "PERSONAL" || logic.canReviewTask) && <Button variant="ghost" onClick={logic.handleBulkComplete} disabled={logic.isBulkPending} className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--accent)]">{logic.workspaceMode === "PERSONAL" ? "Complete" : "Approve"}</Button>}
                    {logic.workspaceMode !== "PERSONAL" && (<><Button variant="ghost" onClick={logic.handleBulkSubmit} disabled={logic.isBulkPending} className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--accent)]">Submit</Button><Button variant="ghost" onClick={() => logic.setIsBulkAssignOpen(true)} disabled={logic.isBulkPending} className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--accent)]">Reassign</Button><Button variant="ghost" onClick={handleBulkReject} disabled={logic.isBulkPending} className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--danger)]">Reject</Button></>)}
                    <Button variant="ghost" onClick={logic.handleBulkDelete} disabled={logic.isBulkPending} className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--danger)]">Delete</Button>
                    <Button variant="ghost" onClick={() => logic.setRowSelection({})} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"><Icons.x className="w-4 h-4" /></Button>
                  </motion.div>
                )}
              </AnimatePresence>
            }
          />
          {logic.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl mt-4">
              <span className="text-[12px] text-[var(--text-tertiary)]">{logic.totalCount} tasks · Page {logic.currentPage + 1} of {logic.totalPages}</span>
              <div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={logic.currentPage <= 0} onClick={() => logic.setCurrentPage(p => Math.max(0, p - 1))}>←</Button><Button variant="outline" size="sm" disabled={logic.currentPage >= logic.totalPages - 1} onClick={() => logic.setCurrentPage(p => Math.min(logic.totalPages - 1, p + 1))}>→</Button></div>
            </div>
          )}
        </PageState>
      </PageShell>
    </>
  );
}
