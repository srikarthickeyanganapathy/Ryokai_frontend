import React from 'react';
import { Skeleton } from '@/shared/ui/Skeleton';

import { useRoleStudio } from './useRoleStudio';
import { RoleSidebar } from './RoleSidebar';
import { RoleHeader } from './RoleHeader';
import { ModuleTabs } from './ModuleTabs';
import { PermissionBrowser } from './PermissionBrowser';
import { PermissionInspectorContent } from './PermissionInspectorContent';
import { InspectorDrawer } from './InspectorDrawer';
import { ReviewDrawer } from './ReviewDrawer';
import { CreateRoleDrawer } from './CreateRoleDrawer';
import { CriticalPermissionDialog } from './CriticalPermissionDialog';

export function OrgRolesTab({ orgId, roles = [], rolesLoading }) {
  const studio = useRoleStudio({ orgId, roles, rolesLoading });

  if (studio.rolesLoading) {
    return (
      <div className="flex gap-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden h-[600px]">
        <Skeleton className="w-[200px] h-full shrink-0" />
        <Skeleton className="flex-1 h-full" />
      </div>
    );
  }

  return (
    <>
      {/* ── Main Studio Layout (Eliminating box-in-box nested borders) ── */}
      <div className="flex flex-col lg:flex-row rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden min-h-[560px] max-h-[calc(100vh-160px)] shadow-xs">

        {/* ── 1. Role Sidebar ── */}
        <aside className="w-full lg:w-[200px] shrink-0 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <RoleSidebar
            roles={studio.roles}
            selectedRole={studio.selectedRole}
            onSelectRole={studio.handleSelectRole}
            onCreateClick={() => studio.setShowCreateRole(true)}
            searchQuery={studio.roleSearchQuery}
            onSearchChange={studio.setRoleSearchQuery}
          />
        </aside>

        {/* ── 2. Main Role Studio Content ── */}
        {studio.selectedRole ? (
          <div className="flex-1 flex flex-col min-w-0 min-h-0">

            {/* Role Header */}
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

            {/* Split View: Permissions + Desktop Inline Inspector Panel */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0">

              {/* Central Permission Column */}
              <div className="flex-1 flex flex-col min-h-0 min-w-0 border-r-0 lg:border-r border-[var(--border-subtle)]">
                {/* Module Navigation Tabs */}
                <ModuleTabs
                  modules={studio.filteredModules}
                  activeModule={studio.activeModuleCode}
                  onModuleChange={studio.setActiveModuleCode}
                  localScopedPerms={studio.localScopedPerms}
                />

                {/* Permission Browser */}
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
                  <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-muted)]">
                    {studio.permSearchQuery
                      ? 'No permissions match search.'
                      : 'Select a module to browse permissions.'}
                  </div>
                )}
              </div>

              {/* ── Inline Desktop Inspector Panel (lg+) ── */}
              <aside className="hidden lg:block w-[300px] shrink-0 border-l border-[var(--border-subtle)] bg-[var(--bg-card)]">
                <PermissionInspectorContent
                  role={studio.selectedRole}
                  permission={studio.activePermission}
                  isEnabled={
                    studio.activePermission
                      ? Boolean(studio.localScopedPerms[studio.activePermission.code])
                      : false
                  }
                  currentScope={
                    studio.activePermission
                      ? studio.localScopedPerms[studio.activePermission.code]
                      : null
                  }
                  isAdmin={studio.isAdminRole}
                  onScopeChange={studio.handleScopeChange}
                  onToggle={studio.togglePermission}
                  permissionMap={studio.PERMISSION_MAP}
                  localScopedPerms={studio.localScopedPerms}
                  supervisionNames={studio.supervisionRank.can}
                />
              </aside>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-muted)]">
            Select a role to configure permissions.
          </div>
        )}
      </div>

      {/* ── Mobile / Tablet Inspector Drawer (< lg) ── */}
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
              ? Boolean(studio.localScopedPerms[studio.activePermission.code])
              : false
          }
          currentScope={
            studio.activePermission
              ? studio.localScopedPerms[studio.activePermission.code]
              : null
          }
          isAdmin={studio.isAdminRole}
          onScopeChange={studio.handleScopeChange}
          onToggle={studio.togglePermission}
          permissionMap={studio.PERMISSION_MAP}
          localScopedPerms={studio.localScopedPerms}
          supervisionNames={studio.supervisionRank.can}
        />
      </div>

      {/* ── Review Drawer ── */}
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

      {/* ── Create Role Drawer ── */}
      <CreateRoleDrawer
        roles={studio.roles}
        open={studio.showCreateRole}
        onOpenChange={studio.setShowCreateRole}
        onCreate={studio.handleCreateRole}
        isLoading={false}
      />

      {/* ── Critical Permission Dialog ── */}
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
    </>
  );
}