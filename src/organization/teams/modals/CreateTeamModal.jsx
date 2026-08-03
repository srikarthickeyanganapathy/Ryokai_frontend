import React from 'react'
import { useForm } from 'react-hook-form'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/shared/ui/Modal'
import { Heading, Text } from '@/shared/ui/Typography'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/forms'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { useCreateTeam } from '@/organization'

const NAME_MAX = 50
const DESC_MAX = 140

function hashHue(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

export function CreateTeamModal({ isOpen, onClose, orgId }) {
  const createTeam = useCreateTeam(orgId)
  const form = useForm({ defaultValues: { name: '', description: '' } })
  const nameValue = form.watch('name')
  const descValue = form.watch('description')
  const hue = hashHue(nameValue || 'team')

  const onSubmit = (data) => {
    createTeam.mutate(data, { onSuccess: () => { form.reset(); onClose() } })
  }

  const handleClose = () => { form.reset(); onClose() }

  return (
    <Modal open={isOpen} onOpenChange={handleClose}>
      <ModalContent className="sm:max-w-md p-0 overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-2xl rounded-xl">
        <div className="relative px-6 pt-5 pb-4 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)]">
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ background: `radial-gradient(circle at 20% 0%, hsl(${hue} 80% 55%), transparent 60%)` }} aria-hidden="true" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-base shadow-sm ring-1 ring-black/5 shrink-0 transition-colors duration-300" style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 52%), hsl(${(hue + 40) % 360} 70% 40%))` }}>
              {(nameValue || '?').trim().charAt(0).toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <Heading level={4} className="text-sm font-semibold truncate tracking-tight">{nameValue?.trim() || 'New team'}</Heading>
              <Text size="xs" className="text-[var(--text-muted)] truncate">{descValue?.trim() || 'Your team preview appears here'}</Text>
            </div>
          </div>
        </div>

        <div className="px-6 pt-5">
          <ModalHeader className="p-0 mb-4">
            <ModalTitle className="flex items-center gap-2 text-[14px] font-semibold tracking-tight">
              <Icons.plus className="w-4 h-4 text-[var(--accent)]" /> Create team
            </ModalTitle>
            <ModalDescription className="text-[12px] text-[var(--text-muted)]">Set up a new workspace to group members, projects, and discussions.</ModalDescription>
          </ModalHeader>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-6 space-y-4">
            <FormField control={form.control} name="name" rules={{ required: 'Team name is required', maxLength: { value: NAME_MAX, message: `Max ${NAME_MAX} characters` } }} render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-[11px] font-medium uppercase tracking-wider">Team Name</FormLabel>
                  <span className="text-[10px] text-[var(--text-muted)] tabular-nums">{(field.value || '').length}/{NAME_MAX}</span>
                </div>
                <FormControl><Input placeholder="e.g. Engineering, Marketing" maxLength={NAME_MAX} autoFocus {...field} className="h-8 text-[13px]" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" rules={{ maxLength: { value: DESC_MAX, message: `Max ${DESC_MAX} characters` } }} render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-[11px] font-medium uppercase tracking-wider">Description</FormLabel>
                  <span className="text-[10px] text-[var(--text-muted)] tabular-nums">{(field.value || '').length}/{DESC_MAX}</span>
                </div>
                <FormControl><Input placeholder="What does this team do?" maxLength={DESC_MAX} {...field} className="h-8 text-[13px]" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex items-start gap-2 rounded-md bg-[var(--accent-soft)]/60 border border-[var(--accent-border)]/60 px-3 py-2.5">
              <Icons.users className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 shrink-0" />
              <Text size="xs" className="text-[var(--text-secondary)] leading-relaxed">You can add members, assign observers, and connect projects right after creating the team.</Text>
            </div>
            <ModalFooter className="pt-2 flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1 text-[12px] h-8">Cancel</Button>
              <Button type="submit" disabled={createTeam.isPending} className="flex-1 text-[12px] h-8 shadow-sm">{createTeam.isPending ? 'Creating…' : 'Create Team'}</Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  )
}