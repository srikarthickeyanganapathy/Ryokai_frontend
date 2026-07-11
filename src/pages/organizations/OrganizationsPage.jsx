import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { useOrganizations, useCreateOrganization } from '@/features/organizations/hooks/useOrganizations'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { OrganizationForm } from '@/widgets/organizations/OrganizationForm'

// Backend note: OrganizationMembership has a unique constraint on user_id alone —
// each user can belong to at most one organization, ever (enforced in
// OrganizationService.createOrganization too). So `organizations` is always length
// 0 or 1; a search/filter grid over "organizations" can never have more than one
// card to show. This page now only handles the two states that can actually occur:
// redirecting into the user's org, or onboarding them into creating their first one.
export function OrganizationsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data: organizations = [], isLoading, isError, error } = useOrganizations()
  const createOrgMutation = useCreateOrganization()

  const handleCreateOrg = (data) => {
    createOrgMutation.mutate(data, {
      onSuccess: () => setIsCreateOpen(false),
    })
  }

  if (!isLoading && !isError && organizations.length > 0) {
    return <Navigate to={`/app/organizations/${organizations[0].id}`} replace />
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">

      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ModalContent className="sm:max-w-xl">
          <Heading level={3} className="mb-4">Create Organization</Heading>
          <OrganizationForm
            onSubmit={handleCreateOrg}
            isLoading={createOrgMutation.isPending}
          />
        </ModalContent>
      </Modal>

      {isLoading && (
        <div className="w-10 h-10 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" />
      )}

      {!isLoading && isError && (
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-red-500">
            <Icons.x className="w-6 h-6" />
          </div>
          <Heading level={3}>Failed to load your organization</Heading>
          <Text variant="muted" className="mt-2 mb-6">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </Text>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {!isLoading && !isError && organizations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-2xl p-10"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-cyan)]/15 to-[var(--accent-violet)]/15 border border-[var(--color-border-subtle)] flex items-center justify-center mx-auto mb-5">
            <Icons.workspace className="w-6 h-6 text-[var(--accent-cyan)]" />
          </div>
          <Heading level={3}>Create your organization</Heading>
          <Text variant="muted" className="mt-2 mb-6">
            Bring your team into one workspace to manage projects, teams, and roles together.
            You can belong to a single organization at a time.
          </Text>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Icons.workspace className="w-4 h-4" />
            New Organization
          </Button>
        </motion.div>
      )}

    </div>
  )
}