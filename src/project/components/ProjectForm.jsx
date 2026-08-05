// File: src/project/components/ProjectForm.jsx
import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/shared/forms'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { Checkbox } from '@/shared/ui/Checkbox/Checkbox'
import { useCrews, useCrewMembers } from '@/crew'
import { useAuth } from '@/identity'

const defaultUseOrgTeams = () => ({ data: [], isLoading: false })

export function ProjectForm({ onSubmit, defaultValues, isLoading, workspaceMode, useOrgTeamsHook = defaultUseOrgTeams, hideContextFields = false }) {
  const isPersonal = workspaceMode === 'PERSONAL'
  const isCrewMode = workspaceMode === 'CREWS'
  const isOrgMode = workspaceMode === 'ORG'

  const { user } = useAuth()

  // Safely parse collaboratorIds whether they are an array of IDs or array of objects
  const parsedCollaboratorIds = useMemo(() => {
    if (Array.isArray(defaultValues?.collaboratorIds)) {
      return defaultValues.collaboratorIds.map(c => (typeof c === 'object' ? c.userId || c.id : c))
    }
    if (Array.isArray(defaultValues?.collaborators)) {
      return defaultValues.collaborators.map(c => c.userId || c.id)
    }
    return []
  }, [defaultValues])

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      organizationId: '',
      teamId: 'none',
      crewId: '',
      dueDate: '',
      ...defaultValues,
      collaboratorIds: parsedCollaboratorIds,
    },
  })

  const orgId = form.watch('organizationId')
  const { data: teams = [] } = useOrgTeamsHook(orgId ? parseInt(orgId, 10) : null)

  const watchCrewId = form.watch('crewId')
  const { data: crews = [] } = useCrews()
  const { data: crewMembers = [] } = useCrewMembers(watchCrewId ? parseInt(watchCrewId, 10) : null)

  const assignableCollaborators = useMemo(() => {
    if (!user || !crewMembers.length) return []
    return crewMembers.filter(m => m.userId !== user.id)
  }, [user, crewMembers])

  const handleSubmit = (data) => {
    const payload = {
      ...data,
      organizationId: isOrgMode && data.organizationId ? parseInt(data.organizationId, 10) : null,
      teamId: isOrgMode && data.teamId && data.teamId !== 'none' ? parseInt(data.teamId, 10) : null,
      crewId: isCrewMode && data.crewId ? parseInt(data.crewId, 10) : null,
      collaboratorIds: isCrewMode && data.collaboratorIds ? data.collaboratorIds : [],
      dueDate: data.dueDate || null,
      isPersonal,
    }
    onSubmit(payload)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: 'Project name is required', maxLength: { value: 200, message: 'Max 200 characters' } }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Name</FormLabel>
              <FormControl>
                <Input placeholder="Project Alpha" {...field} className="h-9 text-[13px]" />
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
              <FormLabel className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Description</FormLabel>
              <FormControl>
                <Input placeholder="A new initiative..." {...field} className="h-9 text-[13px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!hideContextFields && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {isOrgMode && (
              <>
                <FormField
                  control={form.control}
                  name="organizationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Organization ID</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="ID" {...field} disabled className="h-9 text-[13px] bg-[var(--bg-subtle)]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Team</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || 'none'}>
                        <FormControl>
                          <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Select Team" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None (Organization-wide)</SelectItem>
                          {teams.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {isCrewMode && (
              <FormField
                control={form.control}
                name="crewId"
                rules={{ required: 'Please select a Crew' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Crew</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Select Crew" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {crews.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        {isCrewMode && watchCrewId && (
          <FormField
            control={form.control}
            name="collaboratorIds"
            render={() => (
              <FormItem>
                <FormLabel className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Collaborators</FormLabel>
                <FormDescription className="text-[11px] text-[var(--text-muted)]">
                  Select crew members who can see and work on this project.
                </FormDescription>
                {assignableCollaborators.length === 0 ? (
                  <div className="text-[12px] text-[var(--text-muted)] p-3 border border-dashed border-[var(--border-subtle)] rounded-md text-center">
                    No other members in this crew.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-2 border border-[var(--border-subtle)] rounded-md p-3 max-h-40 overflow-y-auto bg-[var(--bg-subtle)]/30">
                    {assignableCollaborators.map((member) => (
                      <FormField
                        key={member.userId}
                        control={form.control}
                        name="collaboratorIds"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={Array.isArray(field.value) && field.value.includes(member.userId)}
                                onCheckedChange={(checked) => {
                                  const currentValues = Array.isArray(field.value) ? field.value : []
                                  return checked
                                    ? field.onChange([...currentValues, member.userId])
                                    : field.onChange(currentValues.filter((v) => v !== member.userId))
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer text-[13px] text-[var(--text-primary)]">
                              {member.username}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} className="h-9 text-[13px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2 flex justify-end gap-2">
          <Button type="submit" isLoading={isLoading} className="min-w-[120px] h-9 text-[13px] shadow-sm">
            {isLoading ? 'Saving...' : 'Save Project'}
          </Button>
        </div>
      </form>
    </Form>
  )
}