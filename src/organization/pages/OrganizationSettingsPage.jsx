import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Icons } from '@/shared/ui/Icons'
import { useOrganization, useOrgMembers, useOrgTeams, useUpdateOrganization } from '../features/hooks/useOrganizations'
import { AdminLeaveModal } from '../sections/Members/AdminLeaveModal'
import { usePermissions } from '@/identity'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/forms'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { Edit2, Settings, Users, Building2, AlertTriangle } from 'lucide-react'
import { SettingsRow } from '@/shared/ui/SettingsRow'
import { PageHeader } from '@/shared/ui/PageHeader'
import {
  WorkspaceShell,
  ConfigurationLayout,
  PageStateContainer,
} from '@/shared/workspace-framework'

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
  const [activeTab, setActiveTab] = useState('general')
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

  // Determine page state
  const pageState = isLoading ? 'loading' : isError ? 'error' : !org ? 'empty' : 'ready'

  // Tab definitions
  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ]

  return (
    <WorkspaceShell maxWidth="narrow">
      <PageStateContainer
        state={pageState}
        loadingConfig={{ variant: 'default' }}
        errorConfig={{
          title: 'Failed to load organization',
          description: error?.message || 'An unexpected error occurred.',
        }}
        emptyConfig={{
          icon: Building2,
          title: 'Organization not found',
          description: "The organization you're looking for doesn't exist.",
        }}
      >
        <ConfigurationLayout
          header={
            <PageHeader
              eyebrow="Settings"
              meta="Organization administration"
              title={`${org?.name || 'Organization'} Settings`}
              subtitle={org?.description || "Manage organization details, profile settings, and administrative operations."}
              actions={
                !isEditing && isOrgAdmin ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-1.5" />
                    Edit Details
                  </Button>
                ) : null
              }
            />
          }
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {/* Members Card */}
                <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 sm:p-6 hover:border-[var(--accent-border)] transition-colors duration-200">
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
                </div>

                {/* Teams Card */}
                <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 sm:p-6 hover:border-[var(--accent-border)] transition-colors duration-200">
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
                </div>

                {/* Created Card */}
                <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 sm:p-6 hover:border-[var(--accent-border)] transition-colors duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--success-soft)] flex items-center justify-center shrink-0">
                      <Icons.tasks className="w-5 h-5 text-[var(--success)]" />
                    </div>
                    <Text variant="muted" size="sm">Created</Text>
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{formatDate(org?.createdAt)}</span>
                  {org?.createdBy && (
                    <Text variant="muted" size="xs" className="mt-1">by {org.createdBy}</Text>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && isOrgAdmin && (
            <div className="bg-[var(--danger-soft)] border border-[var(--danger-border)] rounded-[var(--radius-lg)] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            </div>
          )}
        </ConfigurationLayout>
      </PageStateContainer>

      <AdminLeaveModal
        isOpen={adminLeaveModalOpen}
        onClose={() => setAdminLeaveModalOpen(false)}
        orgId={orgId}
        members={members}
      />
    </WorkspaceShell>
  )
}