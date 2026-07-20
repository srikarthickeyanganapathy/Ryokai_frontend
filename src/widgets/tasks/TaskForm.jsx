import React, { useState, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/forms'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { Settings } from 'lucide-react'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { useQuery } from '@tanstack/react-query'
import { getOrgMembers, getOrgTeams } from '@/features/organizations/api/organization.api'
import { projectsApi } from '@/features/projects/api'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function TaskForm({ onSubmit, defaultValues, isLoading, isPersonalTask, fixedProjectId, fixedTeamId }) {
  const { workspaceMode, activeOrganization } = useWorkspace()
  
  // FE Bug Fix: if the task is explicitly tied to a project or team, it is NOT a personal task.
  const hasOrgContext = !!defaultValues?.projectId || !!defaultValues?.teamId;
  const isPersonalMode = isPersonalTask !== undefined 
    ? isPersonalTask 
    : (workspaceMode === 'PERSONAL' && !hasOrgContext);
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

  const { data: teams = [] } = useQuery({
    queryKey: ['orgTeams', activeOrganization?.id],
    queryFn: () => getOrgTeams(activeOrganization?.id),
    enabled: !!activeOrganization?.id && !isPersonalMode
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getProjects(),
    enabled: !isPersonalMode
  })
  
  const form = useForm({
    defaultValues: defaultValues || {
      title: '',
      description: '',
      assigneeUsername: '',
      priority: 'MEDIUM',
      dueDate: '',
      tags: '',
      teamId: '',
      projectId: '',
    },
  })

  // FE Bug #1 Fix: Reset assignee when team changes to prevent cross-team picks
  const watchedTeamId = form.watch('teamId')
  useEffect(() => {
    form.setValue('assigneeUsername', '')
  }, [watchedTeamId])

  const handleSubmit = (data) => {
    // Format the payload before submission
    const payload = {
      ...data,
      teamId: data.teamId ? parseInt(data.teamId, 10) : null,
      projectId: data.projectId ? parseInt(data.projectId, 10) : null,
      tags: data.tags || '',
      // Empty string dueDate causes Jackson 500 — convert to null
      dueDate: data.dueDate || null,
    }
    onSubmit(payload)
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

        {workspaceMode === 'ORG' && (
          <FormField
            control={form.control}
            name="assigneeUsername"
            rules={{ required: 'Assignee username is required' }}
            render={({ field }) => {
              // FE Bug #1 Fix: Filter assignees by the currently selected team
              const currentTeamId = form.watch('teamId');
              const selectedTeam = currentTeamId
                ? teams.find(t => t.id.toString() === currentTeamId)
                : null;

              const filteredAssignees = selectedTeam
                ? members.filter(m =>
                    m.username !== user.username &&
                    selectedTeam.members?.some(tm => tm.username === m.username)
                  )
                : assignableMembers;

              return (
                <FormItem>
                  <FormLabel>Assignee Username</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredAssignees.map(m => (
                        <SelectItem key={m.username} value={m.username}>
                          {m.username} ({m.orgRole})
                        </SelectItem>
                      ))}
                      {filteredAssignees.length === 0 && (
                        <SelectItem value="_empty" disabled>
                          {selectedTeam ? 'No team members available' : 'No other members available'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )
            }}
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
                  <SelectItem value="MEDIUM">Medium</SelectItem>
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
              <FormLabel>Tags (comma separated)</FormLabel>
              <FormControl>
                <Input placeholder="frontend, bug, urgent" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isPersonalMode && !fixedProjectId && !fixedTeamId && (
          <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2">
            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Global (No Team)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Global (No Team)</SelectItem>
                      {teams.map(t => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => {
                // Only show projects that belong to the selected team (if a team is selected)
                // If no team is selected, we might want to hide project or show global projects.
                const currentTeamId = form.watch('teamId');
                const filteredProjects = currentTeamId 
                  ? projects.filter(p => p.team?.id?.toString() === currentTeamId)
                  : projects.filter(p => !p.team);
                  
                return (
                  <FormItem>
                    <FormLabel>Project (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No Project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No Project</SelectItem>
                        {filteredProjects.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full">
          {isLoading ? 'Saving...' : 'Save Task'}
        </Button>
      </form>
    </Form>
    </>
  )
}
