import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { PageHeader } from '@/shared/ui/PageHeader';
import {
  useOrgMembers,
  useUpdateMemberRole,
  useRemoveMember,
  useOrgRoles,
  useOrgTeams,
} from '../../features/hooks/useOrganizations';
import { useTaskList } from '@/task/entities/hooks/useTasks';
import { Heading, Text } from '@/shared/ui/Typography';
import {
  Mail,
  Shield,
  User as UserIcon,
  LayoutGrid,
  Table as TableIcon,
  Network,
  Users,
  FolderKanban,
  Layers,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/Badge';
import { Button, IconButton } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Checkbox } from '@/shared/ui/Checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import { FilterTabs } from '@/shared/ui/FilterTabs';
import { SegmentedToggle } from '@/shared/ui/SegmentedToggle';
import { usePermissions, useAuth } from '@/identity';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog';
import { InviteMemberModal } from '../../components/Invites/InviteMemberModal';
import {
  WorkspaceShell,
  ManagementLayout,
  PageStateContainer,
  ModularToolbar,
} from '@/shared/workspace-framework';
import { SearchPlugin } from '@/shared/workspace-framework/toolbar/plugins/SearchPlugin';
import { toast } from 'sonner';

// Child components for Phase 1 enhancements
import { MemberDetailDrawer } from '../components/MemberDetailDrawer';
import { DirectoryOrgChart } from '../components/DirectoryOrgChart';
import { DirectoryTableView } from '../components/DirectoryTableView';
import { DirectoryFilterBar, DirectoryBulkActionsBar } from '../components/DirectoryFilterAndBulkBar';

function hashHue(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

export function DirectoryPage() {
  const { activeOrganization } = useWorkspace();
  const orgId = activeOrganization?.id;
  const { user } = useAuth();

  // Existing queries + new enrichment data sources
  const { data: members = [], isLoading: isMembersLoading } = useOrgMembers(orgId);
  const { data: roles = [] } = useOrgRoles(orgId);
  const { data: teams = [], isLoading: isTeamsLoading } = useOrgTeams(orgId);
  const { data: allTasks = [], isLoading: isTasksLoading } = useTaskList({});

  // Local interface UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table' | 'orgchart'
  const [groupByRole, setGroupByRole] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);
  const [drawerMember, setDrawerMember] = useState(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const { confirm, dialog: confirmDialog } = useConfirmDialog();
  const { canManageRoles, canInviteMembers, canRemoveMembers } = usePermissions();
  const updateRoleMutation = useUpdateMemberRole(orgId);
  const removeMemberMutation = useRemoveMember(orgId);

  // Heavily memoized O(1) lookup map for member team affiliations
  const memberTeamsMap = useMemo(() => {
    const map = {};
    members.forEach((m) => { map[m.userId] = []; });

    teams.forEach((team) => {
      const teamMembers = team.members || [];
      teamMembers.forEach((tm) => {
        const targetId = tm.userId ?? tm.id ?? tm;
        if (map[targetId]) {
          map[targetId].push(team);
        } else {
          // Attempt match by username if userId isn't matched directly
          const foundByUsername = members.find(m => m.username === (tm.username || tm));
          if (foundByUsername) {
            map[foundByUsername.userId] = map[foundByUsername.userId] || [];
            map[foundByUsername.userId].push(team);
          }
        }
      });
    });
    return map;
  }, [members, teams]);

  // Heavily memoized O(1) lookup map for member active workload tasks
  const memberTasksMap = useMemo(() => {
    const map = {};
    members.forEach((m) => { map[m.userId] = []; });

    allTasks.forEach((task) => {
      if (task.assigneeUsername) {
        const found = members.find(m => m.username === task.assigneeUsername);
        if (found && map[found.userId]) {
          map[found.userId].push(task);
        }
      }
    });
    return map;
  }, [members, allTasks]);

  // Multi-criteria filter execution
  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return members.filter((member) => {
      const nameMatch = !q || member.username?.toLowerCase().includes(q) || member.email?.toLowerCase().includes(q) || member.orgRole?.toLowerCase().includes(q);
      const roleMatch = selectedRoleFilter === 'ALL' || member.orgRole === selectedRoleFilter;
      const teamMatch = selectedTeamFilter === 'ALL' || (memberTeamsMap[member.userId] && memberTeamsMap[member.userId].some(t => (t.id?.toString() ?? t.name) === selectedTeamFilter));
      return nameMatch && roleMatch && teamMatch;
    });
  }, [members, searchQuery, selectedRoleFilter, selectedTeamFilter, memberTeamsMap]);

  // Role grouping cluster calculations for Grid mode
  const groupedMembers = useMemo(() => {
    if (!groupByRole || viewMode !== 'grid') return null;

    const groups = {};
    filteredMembers.forEach((member) => {
      const roleName = member.orgRole || 'MEMBER';
      if (!groups[roleName]) {
        groups[roleName] = { roleName, items: [], totalPriority: 0 };
      }
      groups[roleName].items.push(member);
      groups[roleName].totalPriority += (member.rolePriority ?? 99);
    });

    // Sort sections by average authority rank (lower rank first)
    return Object.values(groups).sort((a, b) => {
      const avgA = a.totalPriority / a.items.length;
      const avgB = b.totalPriority / b.items.length;
      return avgA - avgB;
    });
  }, [filteredMembers, groupByRole, viewMode]);

  // Selection toggling handlers
  const handleToggleSelect = useCallback((userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }, []);

  const handleToggleAll = useCallback((visibleIds) => {
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  }, [selectedIds]);

  // Bulk sequential mutations using Promise.allSettled
  const handleBulkUpdateRole = async (targetIds, roleId, roleName) => {
    const promises = targetIds.map((id) =>
      updateRoleMutation.mutateAsync({ userId: id, roleId })
    );
    const results = await Promise.allSettled(promises);
    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed > 0) {
      toast.warning(`${targetIds.length - failed} of ${targetIds.length} roles updated successfully.`);
    }
  };

  const handleBulkRemove = async (targetIds) => {
    const promises = targetIds.map((id) => removeMemberMutation.mutateAsync(id));
    const results = await Promise.allSettled(promises);
    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed > 0) {
      toast.warning(`${targetIds.length - failed} of ${targetIds.length} members removed successfully.`);
    }
  };

  if (!activeOrganization) return null;

  const isLoading = isMembersLoading || isTeamsLoading;
  const pageState = isLoading ? 'loading' : 'ready';
  const adminCount = members.filter(m => m.rolePriority === 0).length;

  return (
    <WorkspaceShell maxWidth="default">
      <ManagementLayout
        header={
          <PageHeader
            eyebrow="People & Governance"
            meta={`${members.length} member${members.length !== 1 ? 's' : ''} · ${teams.length} ${teams.length === 1 ? 'team' : 'teams'}`}
            title="Organization Directory"
            subtitle={`Interactive member roster and authority hierarchy for ${activeOrganization.name}.`}
            actions={
              <div className="flex items-center gap-2.5">
                {canInviteMembers && (
                  <Button
                    variant="primary"
                    onClick={() => setInviteModalOpen(true)}
                    className="shrink-0 shadow-md bg-[var(--accent)] hover:opacity-90"
                  >
                    <Icons.plus className="w-4 h-4 mr-1.5" />
                    Invite Member
                  </Button>
                )}
              </div>
            }
          />
        }
        toolbar={
          <div className="space-y-3 w-full">
            <ModularToolbar
              left={
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <SearchPlugin
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search by name, role or email..."
                    className="w-full max-w-sm"
                  />
                </div>
              }
              right={
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Role Grouping Mode Toggle (Grid view only) */}
                  {viewMode === 'grid' && (
                    <Button
                      variant={groupByRole ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setGroupByRole(prev => !prev)}
                      className={cn("h-9 px-3 text-xs flex items-center gap-1.5", groupByRole ? "bg-[var(--accent)] text-white font-semibold shadow-2xs" : "bg-[var(--bg-elevated)]")}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Group by Role
                    </Button>
                  )}

                  {/* Segmented View Toggle Strip: Grid / Table / Org Chart */}
                  <SegmentedToggle
                    options={[
                      { value: 'grid', label: 'Cards', icon: LayoutGrid },
                      { value: 'table', label: 'Table', icon: TableIcon },
                      { value: 'orgchart', label: 'Org Chart', icon: Network },
                    ]}
                    value={viewMode}
                    onChange={setViewMode}
                  />
                </div>
              }
            />

            {/* Interactive Filter Bar */}
            {viewMode !== 'orgchart' && (
              <DirectoryFilterBar
                roles={roles}
                teams={teams}
                selectedRole={selectedRoleFilter}
                onRoleChange={setSelectedRoleFilter}
                selectedTeam={selectedTeamFilter}
                onTeamChange={setSelectedTeamFilter}
                onResetFilters={() => { setSelectedRoleFilter('ALL'); setSelectedTeamFilter('ALL'); setSearchQuery(''); }}
                totalCount={members.length}
                filteredCount={filteredMembers.length}
              />
            )}
          </div>
        }
      >
        <PageStateContainer
          state={pageState}
          loadingConfig={{ variant: 'cards' }}
          emptyConfig={{
            icon: UserIcon,
            title: 'No organization members found',
            description: 'Try adjusting your filter parameters or inviting new teammates.',
          }}
        >
          {filteredMembers.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-[var(--bg-subtle)] border border-dashed border-[var(--border-subtle)] rounded-2xl">
              <UserIcon className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-4" />
              <Heading level={4} className="text-[var(--text-secondary)] mb-2">
                No members found
              </Heading>
              <Text variant="muted" className="text-sm">
                Try adjusting your search query or reset your authority filters
              </Text>
              {(selectedRoleFilter !== 'ALL' || selectedTeamFilter !== 'ALL' || searchQuery) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSelectedRoleFilter('ALL'); setSelectedTeamFilter('ALL'); setSearchQuery(''); }}
                  className="mt-4"
                >
                  Reset All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-3 bg-[var(--info-soft)]/40 border border-[var(--info-border)]/40 rounded-xl flex items-start gap-3 text-xs">
                <Icons.info className="w-4 h-4 text-[var(--info)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[var(--info)]">Pro Tip: Click any member card or table row to open the inspect drawer.</span>
                  <span className="text-[var(--text-muted)] ml-1">
                    Use checkboxes to trigger batch governance commands or instantly generate CSV roster reports.
                  </span>
                </div>
              </div>

              {/* VIEW 1: GRID CARDS (Enhanced) */}
              {viewMode === 'grid' && (
                <div className="space-y-8">
                  {groupByRole ? (
                    // Grouped By Role Render Matrix
                    groupedMembers.map((group) => {
                      const avgPriority = Math.round((group.totalPriority / group.items.length) * 10) / 10;
                      return (
                        <div key={group.roleName} className="space-y-3">
                          <div className="flex items-center justify-between py-2 px-4 rounded-lg bg-[var(--bg-subtle)] border-l-4 border-l-[var(--accent)] border-y border-r border-[var(--border-subtle)] shadow-2xs">
                            <div className="flex items-center gap-2.5">
                              <span className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-tight font-mono">
                                {group.roleName}
                              </span>
                              <Badge variant="outline" className="text-[10px] bg-[var(--bg-elevated)]">
                                {group.items.length} {group.items.length === 1 ? 'Member' : 'Members'}
                              </Badge>
                            </div>
                            <span className="text-xs text-[var(--text-muted)] font-medium flex items-center gap-1">
                              <Shield className="w-3 h-3 text-[var(--accent)]" />
                              Avg Authority Rank: #{isNaN(avgPriority) ? 'N/A' : avgPriority}
                            </span>
                          </div>
                          <MemberCardGrid
                            membersList={group.items}
                            selectedIds={selectedIds}
                            onToggleSelect={handleToggleSelect}
                            onSelectMember={setDrawerMember}
                            memberTeamsMap={memberTeamsMap}
                            memberTasksMap={memberTasksMap}
                            roles={roles}
                            updateRoleMutation={updateRoleMutation}
                            removeMemberMutation={removeMemberMutation}
                            canManageRoles={canManageRoles}
                            canRemoveMembers={canRemoveMembers}
                            user={user}
                            confirm={confirm}
                            adminCount={adminCount}
                            allVisibleIds={group.items.map(i => i.userId)}
                            onToggleAll={handleToggleAll}
                          />
                        </div>
                      );
                    })
                  ) : (
                    // Standard Grid Render Matrix
                    <MemberCardGrid
                      membersList={filteredMembers}
                      selectedIds={selectedIds}
                      onToggleSelect={handleToggleSelect}
                      onSelectMember={setDrawerMember}
                      memberTeamsMap={memberTeamsMap}
                      memberTasksMap={memberTasksMap}
                      roles={roles}
                      updateRoleMutation={updateRoleMutation}
                      removeMemberMutation={removeMemberMutation}
                      canManageRoles={canManageRoles}
                      canRemoveMembers={canRemoveMembers}
                      user={user}
                      confirm={confirm}
                      adminCount={adminCount}
                      allVisibleIds={filteredMembers.map(i => i.userId)}
                      onToggleAll={handleToggleAll}
                    />
                  )}
                </div>
              )}

              {/* VIEW 2: COMPACT SORTABLE TABLE */}
              {viewMode === 'table' && (
                <DirectoryTableView
                  members={filteredMembers}
                  isLoading={isLoading}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onToggleAll={handleToggleAll}
                  memberTeamsMap={memberTeamsMap}
                  memberTasksMap={memberTasksMap}
                  roles={roles}
                  onUpdateRole={(userId, roleId) => updateRoleMutation.mutate({ userId, roleId })}
                  onRemoveMember={async (member) => {
                    if (await confirm({ title: `Remove ${member.username} from organization?`, danger: true })) {
                      removeMemberMutation.mutate(member.userId);
                    }
                  }}
                  onSelectMember={setDrawerMember}
                  canManageRoles={canManageRoles}
                  canRemoveMembers={canRemoveMembers}
                  currentUserId={user?.id}
                  adminCount={adminCount}
                />
              )}

              {/* VIEW 3: HIERARCHICAL ORG CHART */}
              {viewMode === 'orgchart' && (
                <DirectoryOrgChart
                  members={filteredMembers}
                  memberTeamsMap={memberTeamsMap}
                  memberTasksMap={memberTasksMap}
                  onSelectMember={setDrawerMember}
                  selectedMemberId={drawerMember?.userId}
                />
              )}
            </div>
          )}
        </PageStateContainer>
      </ManagementLayout>

      {/* Slide-over Detail Drawer */}
      <MemberDetailDrawer
        isOpen={!!drawerMember}
        onClose={() => setDrawerMember(null)}
        member={drawerMember}
        memberTeams={drawerMember ? (memberTeamsMap[drawerMember.userId] || []) : []}
        memberTasks={drawerMember ? (memberTasksMap[drawerMember.userId] || []) : []}
        roles={roles}
        onUpdateRole={(userId, roleId) => updateRoleMutation.mutate({ userId, roleId })}
        onRemoveMember={async (member) => {
          if (await confirm({ title: `Remove ${member.username}?`, danger: true })) {
            removeMemberMutation.mutate(member.userId);
            setDrawerMember(null);
          }
        }}
        canManageRoles={canManageRoles}
        canRemoveMembers={canRemoveMembers}
        isSelf={drawerMember?.userId === user?.id}
        isLastAdmin={adminCount <= 1 && drawerMember?.rolePriority === 0}
      />

      {/* Sticky Bottom Bulk Actions Bar */}
      <DirectoryBulkActionsBar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        allMembers={filteredMembers}
        memberTeamsMap={memberTeamsMap}
        memberTasksMap={memberTasksMap}
        roles={roles}
        onBulkUpdateRole={handleBulkUpdateRole}
        onBulkRemove={handleBulkRemove}
        canManageRoles={canManageRoles}
        canRemoveMembers={canRemoveMembers}
        currentUserId={user?.id}
      />

      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        orgId={orgId}
      />
      {confirmDialog}
    </WorkspaceShell>
  );
}

// Sub-component for rendering enhanced card grids cleanly with selection synchronization
function MemberCardGrid({
  membersList,
  selectedIds,
  onToggleSelect,
  onSelectMember,
  memberTeamsMap,
  memberTasksMap,
  roles,
  updateRoleMutation,
  removeMemberMutation,
  canManageRoles,
  canRemoveMembers,
  user,
  confirm,
  adminCount,
  allVisibleIds,
  onToggleAll,
}) {
  const isAllSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedIds.includes(id));

  return (
    <div className="space-y-2.5">
      {/* Quick check-all row for grid mode */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
        <div className="inline-flex items-center gap-2">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={() => onToggleAll(allVisibleIds)}
            aria-label="Select all displayed cards"
          />
          <span className="font-medium cursor-pointer" onClick={() => onToggleAll(allVisibleIds)}>
            {isAllSelected ? 'Unselect all cards in group' : 'Select all cards in group'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {membersList.map((member, index) => {
          const currentRole = roles.find((r) => r.name === member.orgRole);
          const isSelf = member.userId === user?.id;
          const isLastAdmin = adminCount <= 1 && member.rolePriority === 0;
          const isSuspended = member.status === 'SUSPENDED';
          const isSelected = selectedIds.includes(member.userId);
          const disabledSelect = isSelf || isLastAdmin;
          const teams = memberTeamsMap[member.userId] || [];
          const tasks = memberTasksMap[member.userId] || [];
          const hue = hashHue(member.username || '?');

          return (
            <motion.div
              key={member.userId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.25) }}
              onClick={() => onSelectMember(member)}
              className={cn(
                "group relative bg-[var(--bg-elevated)] border rounded-xl p-4 sm:p-5 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between overflow-hidden",
                isSelected ? "border-[var(--accent)] bg-[var(--accent-soft)]/10 ring-1 ring-[var(--accent)]" : "border-[var(--border-subtle)] hover:border-[var(--accent-border)]"
              )}
            >
              {/* Top Row: Checkbox, Avatar, Name & Role Badge */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div onClick={(e) => e.stopPropagation()} className="pt-0.5">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => !disabledSelect && onToggleSelect(member.userId)}
                        disabled={disabledSelect}
                        aria-label={`Select ${member.username}`}
                      />
                    </div>

                    <div
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0 relative"
                      style={{ background: `linear-gradient(135deg, hsl(${hue} 60% 46%), hsl(${(hue + 45) % 360} 65% 36%))` }}
                    >
                      {member.username?.charAt(0).toUpperCase() || '?'}
                      {isSuspended && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[var(--danger)] border-2 border-[var(--bg-elevated)] rounded-full" title="Suspended" />
                      )}
                    </div>
                  </div>

                  <Badge
                    variant={
                      member.rolePriority === 0 ? 'danger' :
                        member.rolePriority === 1 ? 'warning' : 'outline'
                    }
                    className="shrink-0 text-[10px] uppercase font-mono tracking-wider shadow-2xs font-semibold"
                  >
                    {member.orgRole}
                  </Badge>
                </div>

                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <Heading level={4} className={cn("truncate text-[15px] font-semibold tracking-tight", isSuspended ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors")}>
                      {member.username}
                    </Heading>
                    {isSelf && <span className="text-[10px] bg-[var(--bg-subtle)] text-[var(--text-muted)] px-1.5 py-0.5 rounded font-normal border border-[var(--border-subtle)]">(You)</span>}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] truncate mt-0.5">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                    <span className="truncate">{member.email || "No email provided"}</span>
                  </div>
                </div>

                {/* Team Affiliations and Workload Pills */}
                <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                  {teams.length > 0 ? (
                    teams.slice(0, 2).map((t) => (
                      <Badge key={t.id || t.name} variant="outline" className="text-[10px] bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] font-medium">
                        <Users className="w-2.5 h-2.5 mr-1 text-[var(--warning)]" />
                        {t.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-subtle)] px-2 py-0.5 rounded-full italic border border-dashed border-[var(--border-subtle)]">
                      No team assigned
                    </span>
                  )}
                  {teams.length > 2 && <span className="text-[10px] font-mono text-[var(--text-muted)] pl-0.5">+{teams.length - 2}</span>}

                  <Badge variant="outline" className="text-[10px] bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] font-medium ml-auto">
                    <FolderKanban className={cn("w-2.5 h-2.5 mr-1", tasks.length > 0 ? "text-[var(--accent)]" : "text-[var(--text-muted)]")} />
                    {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
                  </Badge>
                </div>
              </div>

              {/* Bottom Row: Priority rank & Inline Governance Controls */}
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-medium">
                  <Shield className="h-3 w-3 text-[var(--accent)]" />
                  <span>Rank #{member.rolePriority ?? 'N/A'}</span>
                </div>

                {(canManageRoles || canRemoveMembers) && (
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {canManageRoles && (
                      <Select
                        value={currentRole?.id?.toString() ?? ''}
                        onValueChange={(val) =>
                          updateRoleMutation.mutate({
                            userId: member.userId,
                            roleId: parseInt(val, 10),
                          })
                        }
                        disabled={updateRoleMutation.isPending || isSelf || isLastAdmin}
                      >
                        <SelectTrigger className="w-[105px] h-7 text-[11px] font-medium bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]">
                          <SelectValue placeholder={member.orgRole || 'Role'} />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {canRemoveMembers && !isSelf && !isLastAdmin && (
                      <IconButton
                        variant="danger"
                        size="sm"
                        className="h-7 w-7 opacity-80 hover:opacity-100 transition-opacity"
                        title="Remove Member"
                        onClick={async () => {
                          if (
                            await confirm({
                              title: `Remove ${member.username} from organization?`,
                              danger: true,
                            })
                          ) {
                            removeMemberMutation.mutate(member.userId);
                          }
                        }}
                        disabled={removeMemberMutation.isPending}
                      >
                        <Icons.trash2 className="w-3.5 h-3.5" />
                      </IconButton>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
