import React from 'react';
import { Text, Label } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/Select';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/shared/ui/Modal';
import { ListTodo } from '@/shared/ui/Icons';

/* Convert message to task pre-filled modal. Form state owned by ChannelChatBox. */
export function ConvertToTaskModal({ 
  open, 
  onOpenChange, 
  taskTitle, 
  onTaskTitleChange, 
  taskPriority, 
  onTaskPriorityChange, 
  taskDueDate, 
  onTaskDueDateChange, 
  isPending, 
  onSubmit 
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-md !bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl rounded-2xl p-6">
        <ModalHeader className="text-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-2 mx-auto border border-[var(--accent-border)]">
            <ListTodo className="w-6 h-6" />
          </div>
          <ModalTitle className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Convert Message to Task</ModalTitle>
          <Text variant="muted" className="text-[12px] mt-1">Turn this chat message directly into an actionable task.</Text>
        </ModalHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Task Title</Label>
            <Input value={taskTitle} onChange={(e) => onTaskTitleChange(e.target.value)} required className="h-9 text-[13px] rounded-lg font-medium bg-[var(--bg-base)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Priority</Label>
              <Select value={taskPriority} onValueChange={onTaskPriorityChange}>
                <SelectTrigger className="h-9 text-[13px] rounded-lg font-medium bg-[var(--bg-base)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Due Date</Label>
              <Input type="date" value={taskDueDate} onChange={(e) => onTaskDueDateChange(e.target.value)} className="h-9 text-[13px] rounded-lg font-medium bg-[var(--bg-base)]" />
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-4 border-t border-[var(--border-subtle)] mt-5">
            <Button type="button" variant="outline" size="sm" className="h-8 px-4 text-[12px] rounded-lg" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="h-8 px-4 text-[12px] font-semibold rounded-lg" isLoading={isPending}>Convert Task</Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
