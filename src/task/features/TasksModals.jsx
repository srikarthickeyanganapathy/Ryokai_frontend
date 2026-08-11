import React from "react";
import { Modal, ModalContent } from "@/shared/ui/Modal";
import { TaskForm } from "./manage-task/TaskForm";
import { Heading } from "@/shared/ui/Typography";

export function TasksModals({
  reassignData, setReassignData,
  isBulkAssignOpen, setIsBulkAssignOpen,
  allUsers,
  updateTaskMutation,
  onReassignSubmit,
  onBulkAssign,
}) {
  return (
    <>
      {/* Reassign Modal */}
      <Modal open={!!reassignData} onOpenChange={(o) => !o && setReassignData(null)}>
        <ModalContent className="sm:max-w-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-lg">
          <Heading level={3} className="mb-4 text-[var(--text-primary)]">Reassign Task</Heading>
          {reassignData && (
            <TaskForm
              defaultValues={{
                title: reassignData.title,
                description: reassignData.description,
                priority: reassignData.priority,
                dueDate: reassignData.dueDate ? new Date(reassignData.dueDate).toISOString().slice(0, 16) : "",
                assigneeUsername: reassignData.assignedTo || "",
                tags: reassignData.tags || "",
                teamId: reassignData.teamId ? reassignData.teamId.toString() : "",
              }}
              onSubmit={onReassignSubmit}
              isLoading={updateTaskMutation.isPending}
            />
          )}
        </ModalContent>
      </Modal>

      {/* Bulk Assign Modal */}
      <Modal open={isBulkAssignOpen} onOpenChange={setIsBulkAssignOpen}>
        <ModalContent className="sm:max-w-sm bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 rounded-lg">
          <Heading level={3} className="mb-3 text-[var(--text-primary)]">Assign to</Heading>
          <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
            {(allUsers || []).map(u => (
              <button
                key={u.id}
                onClick={() => onBulkAssign(u)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors text-[13px] text-[var(--text-primary)] text-left"
              >
                <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <span>{u.username}</span>
              </button>
            ))}
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
