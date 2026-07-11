import React, { useState } from 'react';
import { useTaskTemplates, useCreateTaskTemplate, useUpdateTaskTemplate, useDeleteTaskTemplate } from '../../features/tasks/hooks/useTaskTemplates';
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/shared/ui/Modal";
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/forms';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { useForm } from 'react-hook-form';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { Text } from '@/shared/ui/Typography';

export function TaskTemplateManagerModal({ open, onOpenChange }) {
  const { data: templates = [], isLoading } = useTaskTemplates();
  const deleteMutation = useDeleteTaskTemplate();
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <ModalHeader>
          <ModalTitle>Manage Task Templates</ModalTitle>
        </ModalHeader>

        {isFormOpen ? (
          <TemplateForm 
            template={editingTemplate} 
            onClose={() => setIsFormOpen(false)} 
          />
        ) : (
          <div className="space-y-4 mt-4 overflow-y-auto custom-scrollbar">
            <div className="flex justify-end">
              <Button onClick={handleCreate} size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Template
              </Button>
            </div>
            {isLoading ? (
              <Text variant="muted" className="text-sm text-center py-4">Loading templates...</Text>
            ) : templates.length === 0 ? (
              <Text variant="muted" className="text-sm text-center py-4">No templates found.</Text>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] bg-[var(--bg-base)] hover:border-[var(--accent-border)] hover:shadow-[var(--accent-glow)] transition-[border-color,box-shadow] duration-[var(--duration-base)]">
                    <div>
                      <Text className="font-medium text-sm">{template.name}</Text>
                      <Text variant="muted" size="xs">{template.defaultTitle}</Text>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)} className="text-[var(--danger)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}

function TemplateForm({ template, onClose }) {
  const createMutation = useCreateTaskTemplate();
  const updateMutation = useUpdateTaskTemplate();
  
  const form = useForm({
    defaultValues: template || {
      name: '',
      defaultTitle: '',
      defaultDescription: '',
      defaultPriority: 'NORMAL',
    }
  });

  const onSubmit = (data) => {
    if (template) {
      updateMutation.mutate({ id: template.id, payload: data }, {
        onSuccess: onClose
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: onClose
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: 'Template name is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Bug Report" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="defaultTitle"
          rules={{ required: 'Default title is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="defaultDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Description</FormLabel>
              <FormControl>
                <Input placeholder="Task description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="defaultPriority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
