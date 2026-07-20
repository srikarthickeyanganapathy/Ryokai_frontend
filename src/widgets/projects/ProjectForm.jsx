import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/shared/forms'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { Checkbox } from '@/shared/ui/Checkbox/Checkbox'
import { useOrgTeams } from '@/features/organizations/hooks/useOrganizations'
import { useCrews, useCrewMembers } from '@/features/crews/hooks/useCrews'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function ProjectForm({ onSubmit, defaultValues, isLoading, workspaceMode }) {
  const isPersonal = workspaceMode === 'PERSONAL'
  const isCrewMode = workspaceMode === 'CREWS'
  const isOrgMode = workspaceMode === 'ORG'

  const { user } = useAuth()

  const form = useForm({
    defaultValues: defaultValues || {
      name: '',
      description: '',
      organizationId: '',
      teamId: 'none',
      crewId: '',
      collaboratorIds: [],
      dueDate: '',
    },
  })

  // Watch organizationId to dynamically fetch its teams
  const orgId = form.watch('organizationId')
  const { data: teams = [] } = useOrgTeams(orgId ? parseInt(orgId, 10) : null)

  // Watch crewId to dynamically fetch its members for collaboration
  const watchCrewId = form.watch('crewId')
  const { data: crews = [] } = useCrews()
  const { data: crewMembers = [] } = useCrewMembers(watchCrewId ? parseInt(watchCrewId, 10) : null)

  const assignableCollaborators = useMemo(() => {
    if (!user || !crewMembers.length) return []
    // crewMembers returns [{ userId, username, ... }]
    return crewMembers.filter(m => m.userId !== user.id)
  }, [user, crewMembers])

  const handleSubmit = (data) => {
    // Format the payload before submission
    const payload = {
      ...data,
      organizationId: isOrgMode && data.organizationId ? parseInt(data.organizationId, 10) : null,
      teamId: isOrgMode && data.teamId && data.teamId !== 'none' ? parseInt(data.teamId, 10) : null,
      crewId: isCrewMode && data.crewId ? parseInt(data.crewId, 10) : null,
      // Pass the selected collaborator ids to the backend
      collaboratorIds: isCrewMode && data.collaboratorIds ? data.collaboratorIds : [],
      dueDate: data.dueDate || null,
      isPersonal,
    }
    onSubmit(payload)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          rules={{ 
            required: 'Project name is required',
            maxLength: {
              value: 200,
              message: 'Project name must not exceed 200 characters'
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Project Alpha" {...field} />
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
                <Input placeholder="A new initiative..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* ORG MODE FIELDS */}
          {isOrgMode && (
            <>
              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization ID</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="ID" {...field} disabled />
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
                    <FormLabel>Team</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (Organization-wide)</SelectItem>
                        {teams.map(t => (
                          <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* CREW MODE FIELDS */}
          {isCrewMode && (
            <FormField
              control={form.control}
              name="crewId"
              rules={{ required: 'Please select a Crew' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crew</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Crew" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {crews.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* CREW COLLABORATORS */}
        {isCrewMode && watchCrewId && (
          <FormField
            control={form.control}
            name="collaboratorIds"
            render={() => (
              <FormItem>
                <FormLabel>Collaborators</FormLabel>
                <FormDescription>
                  Select crew members who can see and work on this project with you.
                </FormDescription>
                {assignableCollaborators.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/20">
                    No other members in this crew.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                    {assignableCollaborators.map((member) => (
                      <FormField
                        key={member.userId}
                        control={form.control}
                        name="collaboratorIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={member.userId}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(member.userId)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, member.userId])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== member.userId
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {member.username}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
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
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          {isLoading ? 'Saving...' : 'Save Project'}
        </Button>
      </form>
    </Form>
  )
}
