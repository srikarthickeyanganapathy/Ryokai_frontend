import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Icons } from '@/shared/ui/Icons'
import { useOrganization, useOrgMembers, useOrgTeams, useUpdateOrganization } from '@/organization'
import { AdminLeaveModal } from '@/organization'
import { usePermissions } from '@/identity'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/forms'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { Edit2 } from 'lucide-react'

function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function OrganizationSettingsPage() {
  const { orgId } = useParams()
  const { data: org, isLoading, isError, error } = useOrganization(orgId)
  const { data: members = [], isLoading: membersLoading } = useOrgMembers(orgId)
  const { data: teams = [], isLoading: teamsLoading } = useOrgTeams(orgId)
  const [adminLeaveModalOpen, setAdminLeaveModalOpen] = useState(false)
  const { isOrgAdmin } = usePermissions()

  const [isEditing, setIsEditing] = useState(false)
  const updateOrgMutation = useUpdateOrganization(orgId)

  const form = useForm({
    defaultValues: {
      name: org?.name || '',
      description: org?.description || ''
    }
  })

  React.useEffect(() => {
    if (org) {
      form.reset({
        name: org.name || '',
        description: org.description || ''
      })
    }
  }, [org, form])

  const onSubmit = (data) => {
    updateOrgMutation.mutate(data, {
      onSuccess: () => setIsEditing(false)
    })
  }

  if (isLoading) {
    return (
      <div className="px-4 sm:px-0 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8">
          <Skeleton className="h-32 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-32 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-32 rounded-[var(--radius-lg)]" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-16 sm:py-20 mx-4 sm:mx-0 bg-[var(--bg-elevated)] border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-lg)]">
        <div className="w-12 h-12 rounded-full bg-[var(--danger-soft)] flex items-center justify-center mx-auto mb-4 text-[var(--danger)]">
          <Icons.x className="w-6 h-6" />
        </div>
        <Heading level={3}>Failed to load organization</Heading>
        <Text variant="muted" className="mt-2 mb-6 max-w-md mx-auto px-4">
          {error?.message || 'An unexpected error occurred.'}
        </Text>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="text-center py-16 sm:py-20 mx-4 sm:mx-0 bg-[var(--bg-elevated)] border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-lg)]">
        <Heading level={3}>Organization not found</Heading>
        <Text variant="muted" className="mt-2">The organization you're looking for doesn't exist.</Text>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full px-4 py-6 sm:px-0 sm:py-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8 pb-4 border-b border-[var(--border-subtle)] flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
              Manage
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">Organization Administration</span>
          </div>

          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4 max-w-xl">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: 'Name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter organization name" {...field} />
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
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What is this organization about?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit" isLoading={updateOrgMutation.isPending}>Save Changes</Button>
                </div>
              </form>
            </Form>
          ) : (
            <>
              <Heading level={2} className="tracking-tight text-xl sm:text-[22px] font-semibold mb-1 truncate">{org.name}</Heading>
              {org.description && (
                <Text variant="muted" className="max-w-2xl text-[13px] leading-relaxed">{org.description}</Text>
              )}
            </>
          )}
        </div>

        {!isEditing && isOrgAdmin && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="self-start shrink-0">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </motion.div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 sm:p-6 hover:border-[var(--accent-border)] transition-colors duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                <Icons.user className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <Text variant="muted" size="sm">Members</Text>
            </div>
            {membersLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <span className="text-3xl font-bold text-[var(--text-primary)]">{members.length}</span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 sm:p-6 hover:border-[var(--accent-border)] transition-colors duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                <Icons.workspace className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <Text variant="muted" size="sm">Teams</Text>
            </div>
            {teamsLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <span className="text-3xl font-bold text-[var(--text-primary)]">{teams.length}</span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 sm:p-6 hover:border-[var(--accent-border)] transition-colors duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--success-soft)] flex items-center justify-center shrink-0">
                <Icons.tasks className="w-5 h-5 text-[var(--success)]" />
              </div>
              <Text variant="muted" size="sm">Created</Text>
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{formatDate(org.createdAt)}</span>
            {org.createdBy && (
              <Text variant="muted" size="xs" className="mt-1">by {org.createdBy}</Text>
            )}
          </motion.div>
        </div>

        {isOrgAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--danger-soft)] border border-[var(--danger-border)] rounded-[var(--radius-lg)] p-5 sm:p-6 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <Heading level={4} className="text-[var(--danger)] text-base font-semibold mb-1">Danger Zone</Heading>
              <Text size="sm" variant="muted" className="leading-relaxed">
                Leave this organization. Since you are the Admin, you will be prompted to transfer ownership or dissolve the organization completely.
              </Text>
            </div>
            <Button variant="danger" size="sm" onClick={() => setAdminLeaveModalOpen(true)} className="shrink-0 self-start sm:self-auto">
              <Icons.trash2 className="w-4 h-4 mr-2" />
              Exit Organization
            </Button>
          </motion.div>
        )}
      </div>

      <AdminLeaveModal
        isOpen={adminLeaveModalOpen}
        onClose={() => setAdminLeaveModalOpen(false)}
        orgId={orgId}
        members={members}
      />
    </div>
  )
}
