import React, { useState, useMemo } from 'react'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/shared/forms'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { Checkbox } from '@/shared/ui/Checkbox/Checkbox'
import { useForm } from 'react-hook-form'
import { useCrews, useCrewMembers } from '@/features/crews/hooks/useCrews'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/features/projects/api'
import { toast } from 'sonner'

export function CrewProjectShareModal({ isOpen, onClose, project }) {
  const { user } = useAuth()
  const { data: crews = [], isLoading: isLoadingCrews } = useCrews()
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      crewId: '',
      collaboratorIds: []
    }
  })

  const watchCrewId = form.watch('crewId')
  const { data: crewMembers = [], isLoading: isLoadingMembers } = useCrewMembers(
    watchCrewId ? parseInt(watchCrewId, 10) : null
  )

  const assignableCollaborators = useMemo(() => {
    if (!user || !crewMembers.length) return []
    return crewMembers.filter(m => m.userId !== user.id)
  }, [user, crewMembers])

  const shareMutation = useMutation({
    mutationFn: (data) => projectsApi.shareToCrew(project.id, {
      crewId: parseInt(data.crewId, 10),
      collaboratorIds: data.collaboratorIds
    }),
    onSuccess: () => {
      toast.success('Project shared with crew successfully')
      queryClient.invalidateQueries(['projects'])
      onClose()
      form.reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to share project')
    }
  })

  const handleSubmit = (data) => {
    shareMutation.mutate(data)
  }

  // Find crews this project is not already natively a part of
  // Wait, if it's already a crew project, they might want to share it to ANOTHER crew? 
  // The requirement says: "when i am sharing a personel project to crew project then it should ask for the same thing as when creating a crew project fill the details and then share it."
  
  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="sm:max-w-md">
        <Heading level={3} className="mb-2">Share Project to Crew</Heading>
        <Text variant="muted" className="mb-6">
          Sharing <strong>{project?.name}</strong> to a crew will make it visible in the Crew workspace for the selected collaborators.
        </Text>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="crewId"
              rules={{ required: 'Please select a Crew' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crew</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCrews}>
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

            {watchCrewId && (
              <FormField
                control={form.control}
                name="collaboratorIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Collaborators</FormLabel>
                    <FormDescription>
                      Select crew members who can see and work on this project with you.
                    </FormDescription>
                    
                    {isLoadingMembers ? (
                      <div className="text-sm text-muted-foreground p-3">Loading members...</div>
                    ) : assignableCollaborators.length === 0 ? (
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

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={shareMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" isLoading={shareMutation.isPending}>
                Share
              </Button>
            </div>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  )
}
