import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text, Label } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Input } from '@/shared/ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar';
import { cn } from '@/shared/lib/cn';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Modal, ModalContent } from '@/shared/ui/Modal';

import { useCreateCrewTask } from '@/crew/features/hooks/useCrews'; import { useCompleteCrewTask } from '@/task';
import { useClaimTask } from '@/task/entities/hooks/useTasks';

/* ==================== TASKS TAB ==================== */
export function TasksTab({ crewId, tasks }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  const createTaskMutation = useCreateCrewTask(crewId);
  const claimTaskMutation = useClaimTask();
  const completeTaskMutation = useCompleteCrewTask();

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTaskMutation.mutate({
      title,
      description,
      priority,
      dueDate: dueDate || null
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setDueDate('');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Heading level={3} className="text-[16px] font-semibold mb-0">Crew Tasks</Heading>
        <Button size="sm" className="gap-1.5" onClick={() => setIsCreateOpen(true)}>
          <Icons.plus className="w-3.5 h-3.5" />
          Add Task
        </Button>
      </div>

      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ModalContent className="sm:max-w-md">
          <Heading level={3} className="mb-4">Create Crew Task</Heading>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-[12px] font-medium text-[var(--text-secondary)]">Task Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Submit assets, run deploy script..."
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[12px] font-medium text-[var(--text-secondary)]">Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about the task..."
                className="w-full min-h-[80px] rounded-md border border-[var(--border-default)] bg-transparent p-2 text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[12px] font-medium text-[var(--text-secondary)]">Priority</Label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-9 rounded-md border border-[var(--border-default)] bg-[var(--bg-sidebar)] p-2 text-sm text-[var(--text-primary)]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-[12px] font-medium text-[var(--text-secondary)]">Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={createTaskMutation.isPending}>Add Task</Button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] border-dashed">
          <Icons.listTodo className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-2" />
          <Heading level={4} className="text-[14px] font-medium text-[var(--text-secondary)]">No tasks created yet</Heading>
          <Text variant="muted" className="text-[12px] mt-1">Get started by creating a flat crew task.</Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tasks.map((task) => {
            const isUnclaimed = !task.assignee;
            return (
              <div key={task.id} className="flex flex-col p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)]">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider mb-2 font-mono ${
                      task.priority === 'URGENT' ? 'bg-red-500/10 text-red-500' :
                      task.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                      task.priority === 'MEDIUM' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'
                    }`}>
                      {task.priority}
                    </span>
                    <Heading level={4} className="text-[14px] font-semibold leading-tight line-clamp-1">{task.title}</Heading>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                    task.status === 'Done' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                    task.status === 'Needs Work' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    task.status === 'In Review' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-gray-500/10 border-gray-500/20 text-[var(--text-secondary)]'
                  }`}>
                    {task.status}
                  </span>
                </div>

                <Text className="text-[12.5px] text-[var(--text-secondary)] line-clamp-2 h-9 mb-4">
                  {task.description || 'No description provided.'}
                </Text>

                <div className="mt-auto flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 text-[12px]">
                  <span className="text-[var(--text-tertiary)] flex items-center gap-1">
                    <Icons.user className="w-3.5 h-3.5" />
                    {isUnclaimed ? <span className="italic text-orange-500">Unclaimed</span> : <span>@{task.assignee}</span>}
                  </span>
                  
                  <div className="flex gap-1.5">
                    {isUnclaimed && task.status !== 'Done' && (
                      <Button
                        size="xs"
                        variant="outline"
                        className="h-7 text-[11px]"
                        onClick={() => claimTaskMutation.mutate(task.id)}
                        isLoading={claimTaskMutation.isPending}
                      >
                        Claim Task
                      </Button>
                    )}
                    {task.status !== 'Done' && (
                      <Button
                        size="xs"
                        className="h-7 text-[11px] bg-green-600 hover:bg-green-700 text-white border-none"
                        onClick={() => completeTaskMutation.mutate(task.id)}
                        isLoading={completeTaskMutation.isPending}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
