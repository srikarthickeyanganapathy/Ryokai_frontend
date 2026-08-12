import React, { useMemo, useState } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { PageShell, PageHero, PageContent } from '@/shared/ui/PageShell';
import { useOrgRoles } from '../../features/hooks/useOrganizations';
import { Skeleton } from '@/shared/ui/Skeleton';
import { usePermissions } from '@/identity';
import { Heading, Text } from '@/shared/ui/Typography';
import { Icons } from '@/shared/ui/Icons';
import { ShieldCheck, ShieldAlert, KeyRound, Users2, CheckCircle2 } from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';

import { useRoleStudio } from '../hooks/useRoleStudio';
import { CommandChain } from '../components/CommandChain';
import { RoleHeader } from '../components/RoleHeader';
import { ModuleSidebar } from '../components/ModuleSidebar';
import { PermissionBrowser } from '../components/PermissionBrowser';
import { RolePassport } from '../widgets/RolePassport';
import { ReviewDrawer } from '../widgets/ReviewDrawer';
import { CreateRoleDrawer } from '../widgets/CreateRoleDrawer';

export function RolesPermissionsPage() {
  const { activeOrganization } = useWorkspace();
  const orgId = activeOrganization?.id;
  const { data: roles = [], isLoading: rolesLoading } = useOrgRoles(orgId);
  const studio = useRoleStudio({ orgId, roles, rolesLoading });
  const { canManageRoles } = usePermissions();

  const [showDirectory, setShowDirectory] = useState(true);

  const openRole = (role) => {
    studio.handleSelectRole(role);
    setShowDirectory(false);
  };

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

  const selected = studio.selectedRole;
  const isDetail = !showDirectory && Boolean(selected);
  const crit = headerStats(studio).critical;

  return (
    <PageShell maxWidth="default">
      <PageHero
        eyebrow="Security & Access Control"
        title={isDetail ? selected?.name : 'Command Chain'}
        subtitle={isDetail
          ? 'Pick a module, set its level, then assign resources.'
          : 'Every role ranked by authority — pick a link in the chain to open its passport.'}
      >
        {canManageRoles && !studio.rolesLoading && !isDetail && <PostureStrip posture={posture} />}
      </PageHero>
      <PageContent className="pt-5">
        {!canManageRoles ? (
          <EmptyState icon={<Icons.shieldAlert className="w-4 h-4 text-[var(--danger)]" />} iconBg="bg-[var(--danger-soft)]" title="Access Denied" description="You do not have permission to view or manage roles and permissions. Please contact an administrator if you believe this is a mistake." />
        ) : studio.rolesLoading ? (
          <div className="flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden h-[600px]">
            <Skeleton className="w-[220px] h-full shrink-0" />
            <Skeleton className="flex-1 h-full" />
          </div>
        ) : (
          <>
            {isDetail ? (
              <div className="flex flex-col gap-4">
                <RoleHeader
                  role={selected}
                  isAdmin={studio.isAdminRole}
                  isDirty={studio.isDirty}
                  changeCount={studio.changeCount}
                  onReview={() => studio.setShowReview(true)}
                  onDiscard={studio.handleDiscardChanges}
                  onSave={studio.handleSaveChanges}
                  onClone={studio.handleCloneRole}
                  onDelete={studio.handleDeleteRole}
                  onBack={() => setShowDirectory(true)}
                />
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start">
                  <RolePassport
                    role={selected}
                    isAdmin={studio.isAdminRole}
                    stats={headerStats(studio)}
                    enabledCount={Object.keys(studio.localScopedPerms).length}
                    totalCount={studio.PERMISSION_MAP?.size || 0}
                    supervisionNames={studio.supervisionRank.can}
                  />
                  <div className="flex flex-col gap-4 min-w-0">
                    <RiskBanner roleName={selected?.name} critical={crit} />
                    <div className="flex flex-col lg:flex-row rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden h-[calc(100vh-340px)] min-h-[540px]">
                      <ModuleSidebar
                        modules={studio.filteredModules}
                        activeModule={studio.activeModuleCode}
                        onModuleChange={studio.setActiveModuleCode}
                        localScopedPerms={studio.localScopedPerms}
                        permissionMap={studio.PERMISSION_MAP}
                      />
                      <div className="flex-1 flex min-h-0 min-w-0">
                        <PermissionBrowser
                          module={studio.activeModuleData}
                          groupedPermissions={studio.groupedPermissions}
                          localScopedPerms={studio.localScopedPerms}
                          permissionMap={studio.PERMISSION_MAP}
                          isAdmin={studio.isAdminRole}
                          searchQuery={studio.permSearchQuery}
                          onSearchChange={studio.setPermSearchQuery}
                          riskFilter={studio.riskFilter}
                          onRiskFilterChange={studio.setRiskFilter}
                          onToggle={studio.togglePermission}
                          onEnableAll={studio.handleEnableAll}
                          onDisableAll={studio.handleDisableAll}
                          onReset={studio.handleResetModule}
                          onScopeChange={studio.handleScopeChange}
                          onResourceAssignmentChange={studio.handleResourceAssignmentChange}
                          onSetModuleLevel={studio.handleSetModuleLevel}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <CommandChain
                roles={studio.roles}
                selectedRole={selected}
                onSelect={openRole}
                onCreateClick={() => studio.setShowCreateRole(true)}
                searchQuery={studio.roleSearchQuery}
                onSearchChange={studio.setRoleSearchQuery}
                permissionMap={studio.PERMISSION_MAP}
              />
            )}

            <ReviewDrawer
              open={studio.showReview}
              onOpenChange={studio.setShowReview}
              roleName={selected?.name}
              addedPerms={studio.addedPerms}
              removedPerms={studio.removedPerms}
              scopeChangedPerms={studio.scopeChangedPerms}
              priorityChanged={studio.priorityChanged}
              originalPriority={selected?.priority ?? 100}
              newPriority={studio.localPriority}
              changeRisk={studio.changeRisk}
              permissionMap={studio.PERMISSION_MAP}
              localScopedPerms={studio.localScopedPerms}
              originalMap={studio.originalMap}
              onSave={studio.handleSaveChanges}
              onDiscard={studio.handleDiscardChanges}
            />
            <CreateRoleDrawer roles={studio.roles} open={studio.showCreateRole} onOpenChange={studio.setShowCreateRole} onCreate={studio.handleCreateRole} isLoading={false} />
            {studio.confirmDialog}
          </>
        )}
      </PageContent>
    </PageShell>
  );
}

function headerStats(studio) {
  let read = 0, write = 0, workflow = 0, critical = 0;
  Object.keys(studio.localScopedPerms || {}).forEach((code) => {
    const p = studio.PERMISSION_MAP?.get(code);
    if (!p) return;
    const g = p.group || 'GENERAL';
    if (g === 'READ') read++; else if (g === 'WRITE') write++; else if (g === 'WORKFLOW') workflow++;
    if (p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH') critical++;
  });
  return { read, write, workflow, critical };
}

function RiskBanner({ roleName, critical }) {
  if (critical > 0) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-[var(--danger)]/35 bg-[var(--danger-soft)] px-4 py-3">
        <ShieldAlert className="w-4 h-4 text-[var(--danger)] shrink-0" />
        <span className="text-[12px] font-medium text-[var(--text-primary)]">{roleName} holds {critical} elevated permission{critical === 1 ? '' : 's'} — watch the red levels below.</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-[var(--success)]/30 bg-[var(--success-soft)] px-4 py-3">
      <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
      <span className="text-[12px] font-medium text-[var(--text-primary)]">No elevated permissions — this role stays within safe limits.</span>
    </div>
  );
}

function PostureStrip({ posture }) {
  return (
    <div className="flex items-stretch gap-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
      <PostureMetric icon={<Users2 className="w-3.5 h-3.5" />} label="Links in chain" value={posture.totalRoles} tone="var(--text-primary)" />
      <Divider />
      <PostureMetric icon={<ShieldCheck className="w-3.5 h-3.5" />} label="System roles" value={posture.adminRoles} tone="var(--accent)" />
      <Divider />
      <PostureMetric icon={<KeyRound className="w-3.5 h-3.5" />} label="Grants / role" value={posture.avgPerms} tone="var(--text-primary)" />
      <Divider />
      <PostureMetric icon={<ShieldAlert className="w-3.5 h-3.5" />} label="Elevated grants" value={posture.criticalGrants} tone={posture.criticalGrants > 0 ? 'var(--danger)' : 'var(--success)'} emphasize={posture.criticalGrants > 0} />
    </div>
  );
}

function PostureMetric({ icon, label, value, tone, emphasize }) {
  return (
    <div className={cn('flex-1 flex items-center gap-2.5 px-4 py-2.5 min-w-0 transition-colors hover:bg-[var(--bg-hover)]')}>
      <span className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: emphasize ? 'var(--danger-soft)' : 'var(--bg-subtle)', color: tone }}>
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[14px] font-bold font-mono leading-none tracking-tight" style={{ color: tone }}>{value}</div>
        <div className="text-[9.5px] text-[var(--text-muted)] mt-1 uppercase tracking-wider font-medium">{label}</div>
      </div>
    </div>
  );
}

function Divider() { return <div className="w-px bg-[var(--border-subtle)] shrink-0" />; }

function EmptyState({ icon, iconBg, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] rounded-xl h-[600px]">
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center mb-4`}>{icon}</div>
      <Heading as="h3" size="sm" className="mb-1.5 text-[14px] font-semibold tracking-tight">{title}</Heading>
      <Text variant="muted" className="max-w-sm text-[12px] leading-relaxed">{description}</Text>
    </div>
  );
}
