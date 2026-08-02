import React from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { WorkspaceShell, ManagementLayout } from '@/shared/workspace-framework';
import { useOrgRoles } from '../features/hooks/useOrganizations';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Skeleton } from '@/shared/ui/Skeleton';
import { usePermissions } from '@/identity';
import { Heading, Text } from '@/shared/ui/Typography';
import { Icons } from '@/shared/ui/Icons';

import { useRoleStudio } from '../sections/Roles/useRoleStudio';
import { RoleSidebar } from '../sections/Roles/RoleSidebar';
import { RoleHeader } from '../sections/Roles/RoleHeader';
import { ModuleTabs } from '../sections/Roles/ModuleTabs';
import { PermissionBrowser } from '../sections/Roles/PermissionBrowser';
import { PermissionInspectorContent } from '../sections/Roles/PermissionInspectorContent';
import { InspectorDrawer } from '../sections/Roles/InspectorDrawer';
import { ReviewDrawer } from '../sections/Roles/ReviewDrawer';
import { CreateRoleDrawer } from '../sections/Roles/CreateRoleDrawer';
import { CriticalPermissionDialog } from '../sections/Roles/CriticalPermissionDialog';

export function RolesPermissionsPage() {
  const { activeOrganization } = useWorkspace();
  const orgId = activeOrganization?.id;
  const { data: roles = [], isLoading: rolesLoading } = useOrgRoles(orgId);
  const studio = useRoleStudio({ orgId, roles, rolesLoading });
  const { canManageRoles } = usePermissions();

  if (!orgId) return null;

  return (
    <WorkspaceShell maxWidth="wide">
      <ManagementLayout
        header={
          <PageHeader
            eyebrow="Operations"
            title="Roles & Permissions"
            subtitle="Manage roles and access control across the organization."
          />
        }
      >
        {!canManageRoles ? (
          <EmptyState
            icon={<Icons.shieldAlert className="w-5 h-5 text-[var(--danger)]" />}
            iconBg="bg-[var(--danger-soft)]"
            title="Access Denied"
            description="You do not have permission to view or manage roles and permissions for this organization. Please contact an administrator if you believe this is a mistake."
          />
        ) : studio.rolesLoading ? (
          <div className="flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden h-[600px]">
            <Skeleton className="w-[200px] h-full shrink-0" />
            <Skeleton className="flex-1 h-full" />
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden min-h-[560px] max-h-[calc(100vh-160px)] shadow-xs">

              {/* Role Sidebar */}
              <aside className="w-full lg:w-[200px] shrink-0 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)]">
                <RoleSidebar
                  roles={studio.roles}
                  selectedRole={studio.selectedRole}
                  onSelectRole={studio.handleSelectRole}
                  onCreateClick={() => studio.setShowCreateRole(true)}
                  searchQuery={studio.roleSearchQuery}
                  onSearchChange={studio.setRoleSearchQuery}
                />
              </aside>

              {/* Main Role Studio Content */}
              {studio.selectedRole ? (
                <div className="flex-1 flex flex-col min-w-0 min-h-0">
                  <RoleHeader
                    role={studio.selectedRole}
                    isAdmin={studio.isAdminRole}
                    permissionCount={Object.keys(studio.localScopedPerms).length}
                    isDirty={studio.isDirty}
                    changeCount={studio.changeCount}
                    supervisionNames={studio.supervisionRank.can}
                    onDiscard={studio.handleDiscardChanges}
                    onSave={studio.handleSaveChanges}
                    onReview={() => studio.setShowReview(true)}
                    onClone={studio.handleCloneRole}
                    onDelete={studio.handleDeleteRole}
                    permissionMap={studio.PERMISSION_MAP}
                    localScopedPerms={studio.localScopedPerms}
                  />

                  <div className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0">
                    {/* Central Permission Column */}
                    <div className="flex-1 flex flex-col min-h-0 min-w-0 border-r-0 lg:border-r border-[var(--border-subtle)]">
                      <ModuleTabs
                        modules={studio.filteredModules}
                        activeModule={studio.activeModuleCode}
                        onModuleChange={studio.setActiveModuleCode}
                        localScopedPerms={studio.localScopedPerms}
                      />

                      {studio.activeModuleData ? (
                        <PermissionBrowser
                          groupedPermissions={studio.groupedPermissions}
                          localScopedPerms={studio.localScopedPerms}
                          permissionMap={studio.PERMISSION_MAP}
                          isAdmin={studio.isAdminRole}
                          searchQuery={studio.permSearchQuery}
                          onSearchChange={studio.setPermSearchQuery}
                          onToggle={studio.togglePermission}
                          onSelect={studio.setActivePermission}
                          activePermission={studio.activePermission}
                          onEnableAll={studio.handleEnableAll}
                          onDisableAll={studio.handleDisableAll}
                          onReset={studio.handleResetModule}
                        />
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-[12px] text-[var(--text-muted)]">
                          {studio.permSearchQuery
                            ? 'No permissions match search.'
                            : 'Select a module to browse permissions.'}
                        </div>
                      )}
                    </div>

                    {/* Inline Desktop Inspector Panel */}
                    <aside className="hidden lg:block w-[300px] shrink-0 border-l border-[var(--border-subtle)]">
                      <PermissionInspectorContent
                        role={studio.selectedRole}
                        permission={studio.activePermission}
                        isEnabled={
                          studio.activePermission
                            ? Boolean(studio.localScopedPerms?.[studio.activePermission.code])
                            : false
                        }
                        currentScope={
                          studio.activePermission
                            ? studio.localScopedPerms?.[studio.activePermission.code]?.scopeCode
                            : null
                        }
                        currentAssignments={
                          studio.activePermission
                            ? studio.localScopedPerms?.[studio.activePermission.code]?.resourceAssignments || []
                            : []
                        }
                        isAdmin={studio.isAdminRole}
                        onScopeChange={studio.handleScopeChange}
                        onResourceAssignmentChange={studio.handleResourceAssignmentChange}
                        onToggle={studio.togglePermission}
                        permissionMap={studio.PERMISSION_MAP}
                        localScopedPerms={studio.localScopedPerms}
                        supervisionNames={studio.supervisionRank.can}
                      />
                    </aside>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[12px] text-[var(--text-muted)]">
                  Select a role to configure permissions.
                </div>
              )}
            </div>

            {/* Mobile / Tablet Inspector Drawer */}
            <div className="block lg:hidden">
              <InspectorDrawer
                role={studio.selectedRole}
                permission={studio.activePermission}
                open={!!studio.activePermission}
                onOpenChange={(open) => {
                  if (!open) studio.setActivePermission(null);
                }}
                isEnabled={
                  studio.activePermission
                    ? Boolean(studio.localScopedPerms?.[studio.activePermission.code])
                    : false
                }
                currentScope={
                  studio.activePermission
                    ? studio.localScopedPerms?.[studio.activePermission.code]?.scopeCode
                    : null
                }
                currentAssignments={
                  studio.activePermission
                    ? studio.localScopedPerms?.[studio.activePermission.code]?.resourceAssignments || []
                    : []
                }
                isAdmin={studio.isAdminRole}
                onScopeChange={studio.handleScopeChange}
                onResourceAssignmentChange={studio.handleResourceAssignmentChange}
                onToggle={studio.togglePermission}
                permissionMap={studio.PERMISSION_MAP}
                localScopedPerms={studio.localScopedPerms}
                supervisionNames={studio.supervisionRank.can}
              />
            </div>

            <ReviewDrawer
              open={studio.showReview}
              onOpenChange={studio.setShowReview}
              roleName={studio.selectedRole?.name}
              addedPerms={studio.addedPerms}
              removedPerms={studio.removedPerms}
              scopeChangedPerms={studio.scopeChangedPerms}
              priorityChanged={studio.priorityChanged}
              originalPriority={studio.selectedRole?.priority ?? 100}
              newPriority={studio.localPriority}
              permissionMap={studio.PERMISSION_MAP}
              localScopedPerms={studio.localScopedPerms}
              originalMap={studio.originalMap}
              onSave={studio.handleSaveChanges}
              onDiscard={studio.handleDiscardChanges}
            />

            <CreateRoleDrawer
              roles={studio.roles}
              open={studio.showCreateRole}
              onOpenChange={studio.setShowCreateRole}
              onCreate={studio.handleCreateRole}
              isLoading={false}
            />

            <CriticalPermissionDialog
              perm={studio.confirmPerm}
              roleName={studio.selectedRole?.name}
              open={!!studio.confirmPerm}
              onConfirm={() => {
                studio.commitToggle(studio.confirmPerm);
                studio.setConfirmPerm(null);
              }}
              onCancel={() => studio.setConfirmPerm(null)}
            />
            {studio.confirmDialog}
          </>
        )}
      </ManagementLayout>
    </WorkspaceShell>
  );
}

function EmptyState({ icon, iconBg, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl h-[600px]">
      <div className={`w-11 h-11 rounded-full ${iconBg} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <Heading as="h3" size="lg" className="mb-2 text-[15px]">{title}</Heading>
      <Text variant="muted" className="max-w-md text-[13px]">{description}</Text>
    </div>
  );
}