import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { Input } from '@/shared/ui/Input'
import { useOrganizations, useCreateOrganization } from '@/features/organizations/hooks/useOrganizations'
import { OrganizationCard } from '@/widgets/organizations/OrganizationCard'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { OrganizationForm } from '@/widgets/organizations/OrganizationForm'

export function OrganizationsPage() {
  const [globalFilter, setGlobalFilter] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  
  const { data: organizations = [], isLoading, isError, error } = useOrganizations()
  const createOrgMutation = useCreateOrganization()

  const handleCreateOrg = (data) => {
    createOrgMutation.mutate(data, {
      onSuccess: () => setIsCreateOpen(false)
    })
  }

  // Client side filter if the backend doesn't support search param
  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(globalFilter.toLowerCase())
  )

  if (!isLoading && !isError && organizations.length > 0) {
    return <Navigate to={`/app/organizations/${organizations[0].id}`} replace />
  }

  return (
    <div className="flex flex-col min-h-full">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <Heading level={2} className="tracking-tight mb-1">Organizations</Heading>
          <Text variant="muted">Manage your organizations and teams.</Text>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <Input 
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search organizations..." 
              className="pl-9 bg-[var(--bg-elevated)] border-transparent focus:border-[var(--color-border-default)]" 
            />
          </div>
          <Button className="shrink-0 gap-2" onClick={() => setIsCreateOpen(true)}>
            <Icons.workspace className="w-4 h-4" />
            New Organization
          </Button>
        </div>
      </div>

      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ModalContent className="sm:max-w-xl">
          <Heading level={3} className="mb-4">Create Organization</Heading>
          <OrganizationForm 
            onSubmit={handleCreateOrg}
            isLoading={createOrgMutation.isPending}
          />
        </ModalContent>
      </Modal>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-[var(--bg-subtle)] animate-pulse" />
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div className="text-center py-20 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl border-dashed">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-red-500">
            <Icons.x className="w-6 h-6" />
          </div>
          <Heading level={3}>Failed to load organizations</Heading>
          <Text variant="muted" className="mt-2 mb-6 max-w-md mx-auto">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </Text>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && filteredOrgs.length > 0 && (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredOrgs.map(org => (
            <motion.div 
              key={org.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }}
            >
              <OrganizationCard organization={org} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredOrgs.length === 0 && (
        <div className="text-center py-20 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl border-dashed">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mx-auto mb-4 text-[var(--text-muted)]">
            <Icons.workspace className="w-6 h-6" />
          </div>
          <Heading level={3}>No organizations found</Heading>
          <Text variant="muted" className="mt-2 mb-6 max-w-md mx-auto">Get started by creating a new organization.</Text>
          <Button onClick={() => setIsCreateOpen(true)}>Create Organization</Button>
        </div>
      )}

    </div>
  )
}
