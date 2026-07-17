import React from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/forms'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { useOrgTeams } from '@/features/organizations/hooks/useOrganizations'

export function ProjectForm({ onSubmit, defaultValues, isLoading, workspaceMode }) {
  const isPersonal = workspaceMode === 'PERSONAL'

  const form = useForm({
    defaultValues: defaultValues || {
      name: '',
      description: '',
      organizationId: '',
      teamId: 'none',
      dueDate: '',
    },
  })

  // Watch organizationId to dynamically fetch its teams
  const orgId = form.watch('organizationId')
  const { data: teams = [] } = useOrgTeams(orgId ? parseInt(orgId, 10) : null)

  const handleSubmit = (data) => {
    // Format the payload before submission
    const payload = {
      ...data,
      organizationId: data.organizationId ? parseInt(data.organizationId, 10) : null,
      teamId: data.teamId && data.teamId !== 'none' ? parseInt(data.teamId, 10) : null,
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
          {workspaceMode !== 'PERSONAL' && workspaceMode !== 'ORG' && (
            <FormField
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization ID</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {!isPersonal && (
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
          )}
        </div>

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
