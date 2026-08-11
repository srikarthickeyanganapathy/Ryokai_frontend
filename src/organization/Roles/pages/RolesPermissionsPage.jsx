import React, { useMemo } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { PageShell, PageHero, PageContent } from '@/shared/ui/PageShell';
import { useOrgRoles } from '../../features/hooks/useOrganizations';
import { Skeleton } from '@/shared/ui/Skeleton';
import { usePermissions } from '@/identity';
import { Heading, Text } from '@/shared/ui/Typography';
import { Icons } from '@/shared/ui/Icons';
import { ShieldCheck, ShieldAlert, KeyRound, Users2 } from '@/shared/ui/Icons';

import { useRoleStudio } from '../hooks/useRoleStudio';
import { RoleSidebar } from '../components/RoleSidebar';
import { RoleHeader } from '../components/RoleHeader';
import { ModuleSidebar } from '../components/ModuleSidebar';
import { PermissionBrowser } from '../components/PermissionBrowser';
import { PermissionInspectorContent } from '../widgets/PermissionInspectorContent';
import { InspectorDrawer } from '../widgets/InspectorDrawer';
import { ReviewDrawer } from '../widgets/ReviewDrawer';
import { CreateRoleDrawer } from '../widgets/CreateRoleDrawer';

export function RolesPermissionsPage() {
  const { activeOrganization } = useWorkspace();
  const orgId = activeOrganization?.id;
  const { data: roles = [], isLoading: rolesLoading } = useOrgRoles(orgId);
  const studio = useRoleStudio({ orgId, roles, rolesLoading });
  const { canManageRoles } = usePermissions();

  const posture = useMemo(() => {
    if (!studio.roles?.length) return { totalRoles: 0, adminRoles: 0, criticalGrants: 0, avgPerms: 0 };
    let criticalGrants = 0, permSum = 0, adminRoles = 0;
    studio.roles.forEach((r) => {
      if (r.name === 'ADMIN') adminRoles++;
      const perms = r.permissions || [];
      permSum += perms.length;
      perms.forEach((p) => {
        const code = p.permissionCode || p.code;
        const meta = studio.PERMISSION_MAP?.get(code);
        if (meta?.riskLevel === 'CRITICAL' || meta?.riskLevel === 'HIGH') criticalGrants++;
      });
    });
    return { totalRoles: studio.roles.length, adminRoles, criticalGrants, avgPerms: Math.round(permSum / studio.roles.length) };
  }, [studio.roles, studio.PERMISSION_MAP]);

  if (!orgId) return null;

  return (
    <PageShell maxWidth="wide">
      <PageHero
        eyebrow="Security · Access Control"
        title="Roles & Permissions"
        subtitle="Configure the permission surface for every role in this organization."
      >
        {canManageRoles && !studio.rolesLoading && <PostureStrip posture={posture} />}
      </PageHero>
      <PageContent>
        {!canManageRoles ? (
          <EmptyState icon={<Icons.shieldAlert className="w-4 h-4 text-[var(--danger)]" />} iconBg="bg-[var(--danger-soft)]" title="Access Denied" description="You do not have permission to view or manage roles and permissions. Please contact an administrator if you believe this is a mistake." />
        ) : studio.rolesLoading ? (
          <div className="flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden h-[600px]">
            <Skeleton className="w-[220px] h-full shrink-0" />
            <Skeleton className="flex-1 h-full" />
          </div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden h-[calc(100vh-220px)] min-h-[560px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="hidden lg:flex border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] min-h-0">
                <RoleSidebar {...studio} roles={studio.roles} selectedRole={studio.selectedRole} onSelectRole={studio.handleSelectRole} onCreateClick={() => studio.setShowCreateRole(true)} searchQuery={studio.roleSearchQuery} onSearchChange={studio.setRoleSearchQuery} pinnedRoleIds={studio.pinnedRoleIds} onTogglePin={studio.togglePinRole} recentRoleIds={studio.recentRoleIds} permissionMap={studio.PERMISSION_MAP} resizable />
              </div>
              <aside className="lg:hidden w-full shrink-0 border-b border-[var(--border-subtle)] max-h-[280px] min-h-0">
                <RoleSidebar {...studio} roles={studio.roles} selectedRole={studio.selectedRole} onSelectRole={studio.handleSelectRole} onCreateClick={() => studio.setShowCreateRole(true)} searchQuery={studio.roleSearchQuery} onSearchChange={studio.setRoleSearchQuery} pinnedRoleIds={studio.pinnedRoleIds} onTogglePin={studio.togglePinRole} recentRoleIds={studio.recentRoleIds} permissionMap={studio.PERMISSION_MAP} resizable={false} />
              </aside>

              {studio.selectedRole ? (
                <div className="flex-1 flex flex-col min-w-0 min-h-0">
                  <RoleHeader role={studio.selectedRole} isAdmin={studio.isAdminRole} permissionCount={Object.keys(studio.localScopedPerms).length} isDirty={studio.isDirty} changeCount={studio.changeCount} supervisionNames={studio.supervisionRank.can} onDiscard={studio.handleDiscardChanges} onSave={studio.handleSaveChanges} onReview={() => studio.setShowReview(true)} onClone={studio.handleCloneRole} onDelete={studio.handleDeleteRole} permissionMap={studio.PERMISSION_MAP} localScopedPerms={studio.localScopedPerms} inspectorOpen={studio.inspectorOpen} onToggleInspector={studio.toggleInspector} />
                  <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
                    <ModuleSidebar modules={studio.filteredModules} activeModule={studio.activeModuleCode} onModuleChange={studio.setActiveModuleCode} localScopedPerms={studio.localScopedPerms} />
                    <div className="flex-1 flex flex-col min-h-0 min-w-0 border-r-0 lg:border-r border-[var(--border-subtle)]">
                      {studio.activeModuleData ? (
                        <PermissionBrowser groupedPermissions={studio.groupedPermissions} localScopedPerms={studio.localScopedPerms} permissionMap={studio.PERMISSION_MAP} isAdmin={studio.isAdminRole} searchQuery={studio.permSearchQuery} onSearchChange={studio.setPermSearchQuery} riskFilter={studio.riskFilter} onRiskFilterChange={studio.setRiskFilter} onToggle={studio.togglePermission} onSelect={studio.setActivePermission} activePermission={studio.activePermission} onEnableAll={studio.handleEnableAll} onDisableAll={studio.handleDisableAll} onReset={studio.handleResetModule} collapsedGroups={studio.collapsedGroups} onToggleGroupCollapsed={studio.toggleGroupCollapsed} />
                      ) : (
                        <EmptyBrowserState filtered={studio.permSearchQuery || studio.riskFilter === 'ELEVATED'} />
                      )}
                    </div>
                    {studio.inspectorOpen && (
                      <aside className="hidden lg:block w-[320px] shrink-0 min-h-0 overflow-y-auto bg-[var(--bg-subtle)]/40 backdrop-blur-md border-l border-[var(--border-subtle)]">
                        <PermissionInspectorContent role={studio.selectedRole} permission={studio.activePermission} isEnabled={studio.activePermission ? Boolean(studio.localScopedPerms?.[studio.activePermission.code]) : false} currentScope={studio.activePermission ? studio.localScopedPerms?.[studio.activePermission.code]?.scopeCode : null} currentAssignments={studio.activePermission ? studio.localScopedPerms?.[studio.activePermission.code]?.resourceAssignments || [] : []} isAdmin={studio.isAdminRole} onScopeChange={studio.handleScopeChange} onResourceAssignmentChange={studio.handleResourceAssignmentChange} onToggle={studio.togglePermission} permissionMap={studio.PERMISSION_MAP} localScopedPerms={studio.localScopedPerms} supervisionNames={studio.supervisionRank.can} />
                      </aside>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[13px] text-[var(--text-muted)] font-medium">Select a role to configure permissions.</div>
              )}
            </div>

            <div className="block lg:hidden">
              <InspectorDrawer role={studio.selectedRole} permission={studio.activePermission} open={!!studio.activePermission} onOpenChange={(open) => !open && studio.setActivePermission(null)} isEnabled={studio.activePermission ? Boolean(studio.localScopedPerms?.[studio.activePermission.code]) : false} currentScope={studio.activePermission ? studio.localScopedPerms?.[studio.activePermission.code]?.scopeCode : null} currentAssignments={studio.activePermission ? studio.localScopedPerms?.[studio.activePermission.code]?.resourceAssignments || [] : []} isAdmin={studio.isAdminRole} onScopeChange={studio.handleScopeChange} onResourceAssignmentChange={studio.handleResourceAssignmentChange} onToggle={studio.togglePermission} permissionMap={studio.PERMISSION_MAP} localScopedPerms={studio.localScopedPerms} supervisionNames={studio.supervisionRank.can} />
            </div>

            <ReviewDrawer open={studio.showReview} onOpenChange={studio.setShowReview} roleName={studio.selectedRole?.name} addedPerms={studio.addedPerms} removedPerms={studio.removedPerms} scopeChangedPerms={studio.scopeChangedPerms} priorityChanged={studio.priorityChanged} originalPriority={studio.selectedRole?.priority ?? 100} newPriority={studio.localPriority} changeRisk={studio.changeRisk} permissionMap={studio.PERMISSION_MAP} localScopedPerms={studio.localScopedPerms} originalMap={studio.originalMap} onSave={studio.handleSaveChanges} onDiscard={studio.handleDiscardChanges} />
            <CreateRoleDrawer roles={studio.roles} open={studio.showCreateRole} onOpenChange={studio.setShowCreateRole} onCreate={studio.handleCreateRole} isLoading={false} />
            {studio.confirmDialog}
          </>
        )}
      </PageContent>
    </PageShell>
  );
}

function PostureStrip({ posture }) {
  return (
    <div className="flex items-stretch gap-0 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
      <PostureMetric icon={<Users2 className="w-3.5 h-3.5" />} label="Roles defined" value={posture.totalRoles} tone="var(--text-primary)" />
      <Divider />
      <PostureMetric icon={<ShieldCheck className="w-3.5 h-3.5" />} label="System roles" value={posture.adminRoles} tone="var(--accent)" />
      <Divider />
      <PostureMetric icon={<KeyRound className="w-3.5 h-3.5" />} label="Avg. grants / role" value={posture.avgPerms} tone="var(--text-primary)" />
      <Divider />
      <PostureMetric icon={<ShieldAlert className="w-3.5 h-3.5" />} label="Elevated grants" value={posture.criticalGrants} tone={posture.criticalGrants > 0 ? 'var(--danger)' : 'var(--success)'} emphasize={posture.criticalGrants > 0} />
    </div>
  );
}

function PostureMetric({ icon, label, value, tone, emphasize }) {
  return (
    <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 min-w-0 transition-colors hover:bg-[var(--bg-hover)]">
      <span className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: emphasize ? 'var(--danger-soft)' : 'var(--bg-subtle)', color: tone }}>{icon}</span>
      <div className="min-w-0">
        <div className="text-[14px] font-bold font-mono leading-none tracking-tight" style={{ color: tone }}>{value}</div>
        <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate uppercase tracking-wider font-medium">{label}</div>
      </div>
    </div>
  );
}

function Divider() { return <div className="w-px bg-[var(--border-subtle)] shrink-0" />; }

function EmptyBrowserState({ filtered }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-1.5 text-center px-6 py-20">
      <span className="text-[13px] font-medium text-[var(--text-secondary)]">{filtered ? 'No permissions match the current filters.' : 'Select a module to browse permissions.'}</span>
      {filtered && <span className="text-[11px] text-[var(--text-muted)]">Try clearing the search or the elevated-only filter.</span>}
    </div>
  );
}

function EmptyState({ icon, iconBg, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] rounded-xl h-[600px]">
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center mb-4`}>{icon}</div>
      <Heading as="h3" size="sm" className="mb-1.5 text-[14px] font-semibold tracking-tight">{title}</Heading>
      <Text variant="muted" className="max-w-sm text-[12px] leading-relaxed">{description}</Text>
    </div>
  );
}