import React, { useState, useMemo } from 'react'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/shared/forms'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { Checkbox } from '@/shared/ui/Checkbox/Checkbox'
import { useForm } from 'react-hook-form'
import { useCrews, useCrewMembers } from '@/crew'
import { useAuth } from '@/identity'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '../features/api'
import { toast } from 'sonner'
import { Users } from '@/shared/ui/Icons'
import { UserCheck } from 'lucide-react'

/* ============================================================
   CrewProjectShareModal — shares a PERSONAL project into a crew.
   Contract matches the backend exactly (ProjectController
   POST /projects/{id}/share/crew + CrewController project routes):
     payload = { crewId, collaboratorIds }
   Crew permissions are NOT configurable per member — the crew
   model is creator/member (creator manages the crew, members
   work). Explicit collaborators get view access to the project
   itself, which is what collaboratorIds means.
   ============================================================ */

export function CrewProjectShareModal({ isOpen, onClose, project }) {
  const { user } = useAuth()
  const { data: crews = [], isLoading: isLoadingCrews } = useCrews()
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      crewId: '',
      collaboratorIds: [],
    },
  })

  const watchCrewId = form.watch('crewId')
  const { data: crewMembers = [], isLoading: isLoadingMembers } = useCrewMembers(
    watchCrewId ? parseInt(watchCrewId, 10) : null
  )

  const assignableCollaborators = useMemo(() => {
    if (!user || !crewMembers.length) return []
    return crewMembers.filter((m) => m.userId !== user.id)
  }, [user, crewMembers])

  const shareMutation = useMutation({
    mutationFn: (data) =>
      projectsApi.shareToCrew(project.id, {
        crewId: parseInt(data.crewId, 10),
        collaboratorIds: Array.isArray(data.collaboratorIds) ? data.collaboratorIds : [],
      }),
    onSuccess: () => {
      toast.success('Project shared with crew')
      queryClient.invalidateQueries(['projects'])
      onClose()
      form.reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to share project')
    },
  })

  const unshareMutation = useMutation({
    mutationFn: () =>
      projectsApi.unshareFromCrew(
        project.id,
        project?.crewId ||
          project?.crew?.id ||
          (Array.isArray(project?.sharedCrewIds) ? project.sharedCrewIds[0] : null)
      ),
    onSuccess: () => {
      toast.success('Project unshared from crew successfully')
      queryClient.invalidateQueries(['projects'])
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to unshare project')
    },
  })

  const handleSubmit = (data) => shareMutation.mutate(data)

  const isShared =
    project?.crewId ||
    project?.crew ||
    (Array.isArray(project?.sharedCrewIds) && project.sharedCrewIds.length > 0)

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="sm:max-w-lg">
        <Heading level={3} className="mb-1 flex items-center gap-2">
          <Users className="w-5 h-5 text-[var(--accent)]" />
          Share Project to Crew
        </Heading>
        <Text variant="muted" className="mb-4 text-xs">
          Sharing <strong>{project?.name}</strong> with a crew makes it visible in that crew's
          workspace. Crew members can view and work on the project's tasks — the crew creator
          manages membership, and you keep full control of the project.
        </Text>

        {isShared && (
          <div className="mb-4 p-3 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] flex items-center justify-between">
            <div>
              <Text className="text-xs font-semibold">Currently Shared with Crew</Text>
              <Text variant="muted" className="text-[11px]">
                This project is active in the Crew workspace.
              </Text>
            </div>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => unshareMutation.mutate()}
              isLoading={unshareMutation.isPending}
            >
              Unshare
            </Button>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="crewId"
              rules={{ required: 'Please select a Crew' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Crew</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCrews}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a Crew to share with..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {crews.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
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
                    <FormLabel className="text-xs font-semibold">
                      Explicit Collaborators (optional)
                    </FormLabel>
                    <FormDescription className="text-[11px]">
                      Crew members already get access when the project is shared. Use this to grant
                      access to specific members explicitly.
                    </FormDescription>

                    {isLoadingMembers ? (
                      <div className="text-xs text-muted-foreground p-3">Loading members...</div>
                    ) : assignableCollaborators.length === 0 ? (
                      <div className="text-xs text-muted-foreground p-3 border rounded-md bg-muted/20">
                        No other members in this crew.
                      </div>
                    ) : (
                      <div className="space-y-2 border rounded-xl p-3 max-h-52 overflow-y-auto custom-scrollbar bg-[var(--bg-elevated)]">
                        {assignableCollaborators.map((member) => (
                          <FormField
                            key={member.userId}
                            control={form.control}
                            name="collaboratorIds"
                            render={({ field }) => {
                              const isChecked =
                                Array.isArray(field.value) && field.value.includes(member.userId)
                              return (
                                <div
                                  key={member.userId}
                                  className="flex items-center justify-between gap-2 p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)]"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={(checked) => {
                                          const currentValues = Array.isArray(field.value)
                                            ? field.value
                                            : []
                                          if (checked) {
                                            field.onChange([...currentValues, member.userId])
                                          } else {
                                            field.onChange(
                                              currentValues.filter((v) => v !== member.userId)
                                            )
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <div className="flex items-center gap-1 min-w-0">
                                      <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                                        {member.username}
                                      </span>
                                      {member.role && (
                                        <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                                          ({member.role})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {isChecked && (
                                    <UserCheck className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                                  )}
                                </div>
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

            <div className="flex justify-end gap-3 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={shareMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={shareMutation.isPending}>
                Share with Crew
              </Button>
            </div>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  )
}
