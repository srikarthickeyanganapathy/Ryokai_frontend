import React, { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/forms'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { useTaskTemplates } from '../../features/tasks/hooks/useTaskTemplates'
import { TaskTemplateManagerModal } from './TaskTemplateManagerModal'
import { Settings } from 'lucide-react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useQuery } from '@tanstack/react-query'
import { getOrgMembers } from '@/features/organizations/api/organization.api'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function TaskForm({ onSubmit, defaultValues, isLoading }) {
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false)
  const { data: templates = [] } = useTaskTemplates()
  const { workspaceMode, activeOrganization } = useWorkspace()
  const isPersonalMode = workspaceMode === 'PERSONAL'
  const { user } = useAuth()
  
  const { data: members = [] } = useQuery({
    queryKey: ['orgMembers', activeOrganization?.id],
    queryFn: () => getOrgMembers(activeOrganization?.id),
    enabled: !!activeOrganization?.id && !isPersonalMode
  })

  const assignableMembers = useMemo(() => {
    if (isPersonalMode || !user || !members.length) return []
    
    return members.filter(m => m.username !== user.username)
  }, [isPersonalMode, user, members])
  
  const form = useForm({
    defaultValues: defaultValues || {
      title: '',
      description: '',
      assigneeUsername: '',
      priority: 'NORMAL',
      dueDate: '',
      tags: '',
      teamId: '',
    },
  })

  const handleLoadTemplate = (templateId) => {
    const template = templates.find(t => t.id === parseInt(templateId, 10))
    if (template) {
      if (template.defaultTitle) form.setValue('title', template.defaultTitle)
      if (template.defaultDescription) form.setValue('description', template.defaultDescription)
      if (template.defaultPriority) form.setValue('priority', template.defaultPriority)
    }
  }

  const handleSubmit = (data) => {
    // Format the payload before submission
    const payload = {
      ...data,
      teamId: data.teamId ? parseInt(data.teamId, 10) : null,
      tags: data.tags || '',
      // Empty string dueDate causes Jackson 500 — convert to null
      dueDate: data.dueDate || null,
    }
    onSubmit(payload)
  }

  return (
    <>
      <TaskTemplateManagerModal 
        open={isTemplateManagerOpen} 
        onOpenChange={setIsTemplateManagerOpen} 
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          
          <div className="flex items-end gap-2 bg-[var(--bg-subtle)] p-3 rounded-[var(--radius-md)] mb-4 border border-[var(--color-border-subtle)]">
            <div className="flex-1">
              <label className="text-[11px] font-medium text-[var(--text-secondary)] mb-1.5 block uppercase tracking-wider">Start from Template</label>
              <Select onValueChange={handleLoadTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template to auto-fill..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="outline" size="icon" onClick={() => setIsTemplateManagerOpen(true)} title="Manage Templates">
              <Settings className="w-4 h-4" />
            </Button>
          </div>

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

        {!isPersonalMode && (
          <FormField
            control={form.control}
            name="assigneeUsername"
            rules={{ required: 'Assignee username is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignee Username</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {assignableMembers.map(m => (
                      <SelectItem key={m.username} value={m.username}>
                        {m.username} ({m.orgRole})
                      </SelectItem>
                    ))}
                    {assignableMembers.length === 0 && (
                      <SelectItem value="_empty" disabled>
                        No other members available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
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

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
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
              <FormLabel>Tags (comma separated)</FormLabel>
              <FormControl>
                <Input placeholder="frontend, bug, urgent" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : 'Save Task'}
        </Button>
      </form>
    </Form>
    </>
  )
}
