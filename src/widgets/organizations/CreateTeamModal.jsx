import React from 'react'
import { useForm } from 'react-hook-form'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/shared/ui/Modal'
import { Heading, Text } from '@/shared/ui/Typography'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/forms'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { useCreateTeam } from '@/features/organizations/hooks/useOrganizations'

export function CreateTeamModal({ isOpen, onClose, orgId }) {
  const createTeam = useCreateTeam(orgId)
  
  const form = useForm({
    defaultValues: {
      name: '',
      description: ''
    }
  })

  const onSubmit = (data) => {
    createTeam.mutate(data, {
      onSuccess: () => {
        form.reset()
        onClose()
      }
    })
  }

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <ModalTitle>Create Team</ModalTitle>
          <ModalDescription>Create a new team within this organization to group members.</ModalDescription>
        </ModalHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Team name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Engineering, Marketing" {...field} />
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
                    <Input placeholder="What does this team do?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ModalFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTeam.isPending}>
                {createTeam.isPending ? 'Creating...' : 'Create Team'}
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  )
}
