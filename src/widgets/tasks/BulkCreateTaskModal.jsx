import React, { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useBulkAssign } from '../../features/tasks/hooks/useTasks';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/shared/forms';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { useUsersList } from '@/features/auth/hooks/useUser';
import { useWorkspace } from '@/context/WorkspaceContext';

export function BulkCreateTaskModal({ open, onOpenChange }) {
  const { data: allUsers = [] } = useUsersList();
  const bulkAssignMutation = useBulkAssign();
  const { workspaceMode } = useWorkspace();
  
  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      assigneeUsernames: '', // Comma separated for now
      dueDate: '',
      tags: '',
    }
  });

  const onSubmit = (data) => {
    // Convert comma separated string to array of strings
    const usernames = data.assigneeUsernames
      .split(',')
      .map(u => u.trim())
      .filter(Boolean);

    if (usernames.length === 0) {
      form.setError('assigneeUsernames', { type: 'manual', message: 'At least one username is required' });
      return;
    }

    const payload = {
      title: data.title,
      description: data.description,
      assigneeUsernames: usernames,
      dueDate: data.dueDate || null,
      tags: data.tags ? data.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      // Note: no isPersonal — BulkAssignRequestDTO is always for org tasks
    };

    bulkAssignMutation.mutate(payload, {
      onSuccess: (data) => {
        form.reset();
        onOpenChange(false);
        const failed = Object.entries(data?.failedAssignees || {});
        if (failed.length > 0) {
          toast.warning(`${failed.length} assignment(s) failed: ${failed.map(([u,e]) => `${u} (${e})`).join(', ')}`);
        } else {
          toast.success('Tasks assigned successfully');
        }
      }
    });
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-[500px]">
        <ModalHeader>
          <ModalTitle>Bulk Create Tasks</ModalTitle>
        </ModalHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Task description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigneeUsernames"
              rules={{ required: 'Assignee usernames are required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignees (comma separated usernames)</FormLabel>
                  <FormControl>
                    <Input placeholder="user1, user2, user3" {...field} />
                  </FormControl>
                  <FormDescription>A separate task will be created for each user.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (Optional, comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="frontend, urgent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={bulkAssignMutation.isPending}>
                {bulkAssignMutation.isPending ? 'Creating...' : 'Create Tasks'}
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
}
