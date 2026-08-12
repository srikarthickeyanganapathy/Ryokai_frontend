import React, { useState, useMemo } from 'react'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/shared/forms'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { Checkbox } from '@/shared/ui/Checkbox/Checkbox'
import { Badge } from '@/shared/ui/Badge'
import { useForm } from 'react-hook-form'
import { useCrews, useCrewMembers } from '@/crew'
import { useAuth } from '@/identity'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '../features/api'
import { toast } from 'sonner'
import { Shield, Users, UserCheck } from '@/shared/ui/Icons'

export function CrewProjectShareModal({ isOpen, onClose, project }) {
  const { user } = useAuth()
  const { data: crews = [], isLoading: isLoadingCrews } = useCrews()
  const queryClient = useQueryClient()
  const [collaboratorPermissions, setCollaboratorPermissions] = useState({})

  const form = useForm({
    defaultValues: {
      crewId: '',
      collaboratorIds: [],
      defaultAccessLevel: 'EDIT'
    }
  })

  const watchCrewId = form.watch('crewId')
  const defaultAccessLevel = form.watch('defaultAccessLevel')
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
      collaboratorIds: data.collaboratorIds,
      accessPermissions: collaboratorPermissions
    }),
    onSuccess: () => {
      toast.success('Project shared with crew and collaborator permissions granted!')
      queryClient.invalidateQueries(['projects'])
      onClose()
      form.reset()
      setCollaboratorPermissions({})
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to share project')
    }
  })

  const unshareMutation = useMutation({
    mutationFn: () => projectsApi.unshareFromCrew(project.id, project?.crewId || project?.crew?.id || (Array.isArray(project?.sharedCrewIds) ? project.sharedCrewIds[0] : null)),
    onSuccess: () => {
      toast.success('Project unshared from crew successfully')
      queryClient.invalidateQueries(['projects'])
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to unshare project')
    }
  })

  const handleSubmit = (data) => {
    shareMutation.mutate(data)
  }

  const handlePermissionChange = (memberId, permission) => {
    setCollaboratorPermissions(prev => ({
      ...prev,
      [memberId]: permission
    }))
  }

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="sm:max-w-lg">
        <Heading level={3} className="mb-1 flex items-center gap-2">
          <Users className="w-5 h-5 text-[var(--accent)]" />
          Share Project & Assign Crew Permissions
        </Heading>
        <Text variant="muted" className="mb-4 text-xs">
          Sharing <strong>{project?.name}</strong> to a crew will make it visible in the Crew workspace with specified collaborator access controls.
        </Text>

        {(project?.crewId || project?.crew || (Array.isArray(project?.sharedCrewIds) && project?.sharedCrewIds.length > 0)) && (
          <div className="mb-4 p-3 bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] flex items-center justify-between">
            <div>
              <Text className="text-xs font-semibold">Currently Shared with Crew</Text>
              <Text variant="muted" className="text-[11px]">This project is active in the Crew workspace.</Text>
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
              <>
                <FormField
                  control={form.control}
                  name="defaultAccessLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs">
                        <Shield className="w-3.5 h-3.5 text-[var(--accent)]" />
                        Default Crew Access Level
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EDIT">Contributor (View, Create & Edit Tasks)</SelectItem>
                          <SelectItem value="VIEW">Viewer (Read Only Access)</SelectItem>
                          <SelectItem value="ADMIN">Admin (Full Project Management)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-[11px]">
                        Default permission applied to selected collaborators in this crew.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collaboratorIds"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Select Collaborators & Customize Access</FormLabel>
                      
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
                                const isChecked = Array.isArray(field.value) && field.value.includes(member.userId)
                                const currentPerm = collaboratorPermissions[member.userId] || defaultAccessLevel

                                return (
                                  <div key={member.userId} className="flex items-center justify-between gap-2 p-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--bg-subtle)]">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={isChecked}
                                          onCheckedChange={(checked) => {
                                            const currentValues = Array.isArray(field.value) ? field.value : []
                                            if (checked) {
                                              field.onChange([...currentValues, member.userId])
                                              handlePermissionChange(member.userId, defaultAccessLevel)
                                            } else {
                                              field.onChange(currentValues.filter(v => v !== member.userId))
                                            }
                                          }}
                                        />
                                      </FormControl>
                                      <div className="flex items-center gap-1 min-w-0">
                                        <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{member.username}</span>
                                        {member.role && <span className="text-[10px] text-[var(--text-muted)] shrink-0">({member.role})</span>}
                                      </div>
                                    </div>

                                    {isChecked && (
                                      <div className="flex items-center gap-2 shrink-0">
                                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-[var(--accent)] border-[var(--accent-border)]">
                                          {currentPerm}
                                        </Badge>
                                        <Select
                                          value={currentPerm}
                                          onValueChange={(val) => handlePermissionChange(member.userId, val)}
                                        >
                                          <SelectTrigger className="h-7 text-[11px] w-24">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="EDIT">Edit</SelectItem>
                                            <SelectItem value="VIEW">View</SelectItem>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
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
              </>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={shareMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={shareMutation.isPending}>
                Share & Set Permissions
              </Button>
            </div>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  )
}
