import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import {
  useOrgMembers,
  useUpdateMemberRole,
  useRemoveMember,
  useOrgRoles,
  useOrgTeams,
} from '@/organization';
import { useTaskList } from '@/task';
import { toast } from 'sonner';
import { Heading, Text } from '@/shared/ui/Typography';
import {
  Shield,
  Users,
  Layers,
} from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { PageShell, PageHero, PageContent } from '@/shared/ui/PageShell';
import { usePermissions } from '@/identity';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog';
import { InviteMemberModal } from '../../components/Invites/InviteMemberModal';
import { PageState } from '@/shared/ui/PageState';
import { PillNav } from '@/shared/ui/PillNav';
import { MemberDetailDrawer } from '../components/MemberDetailDrawer';
import { DirectoryOrgChart } from '../components/DirectoryOrgChart';
import { DirectoryTableView } from '../components/DirectoryTableView';
import { DirectoryBulkActionsBar } from '../components/DirectoryFilterAndBulkBar';
import { MemberCompareModal } from '../components/MemberCompareModal';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { formatLastActive, hasRecentActivity } from '../components/directoryUtils';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useAuth } from '@/identity';
import { EntityFilterBar, EntityStatStrip } from '@/shared/ui/entity-card';
import { UserIcon, PieChart, BarChart3, Activity } from 'lucide-react';
// --- Main Page Component ---

export function DirectoryPage() {
  const { activeOrganization } = useWorkspace();
  const orgId = activeOrganization?.id;
  const { user } = useAuth();

  // Existing queries + new enrichment data sources
  const { data: members = [], isLoading: isMembersLoading, isError: isMembersError, error: membersError, refetch: refetchMembers } = useOrgMembers(orgId);
  const { data: roles = [] } = useOrgRoles(orgId);
  const { data: teams = [], isLoading: isTeamsLoading, isError: isTeamsError, error: teamsError, refetch: refetchTeams } = useOrgTeams(orgId);
  const { data: { tasks: allTasks = [] } = {}, isLoading: isTasksLoading, isError: isTaskssError, error: tasksError, refetch: refetchTasks } = useTaskList({});

  // Local interface UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const searchDebounceRef = useRef(null)

  // Debounce search input by 300ms to avoid per-keystroke re-filters
  useEffect(() => {
    searchDebounceRef.current = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300)
    return () => clearTimeout(searchDebounceRef.current)
  }, [searchQuery])

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'orgchart'
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);
  const [drawerMember, setDrawerMember] = useState(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // New state additions
  const [quickView, setQuickView] = useState(null); // 'active' | 'unassigned' | 'admins' | null
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [activityFeedExpanded, setActivityFeedExpanded] = useState(false);

  const { confirm, dialog: confirmDialog } = useConfirmDialog();
  const { canManageRoles, canInviteMembers, canRemoveMembers } = usePermissions();
  const updateRoleMutation = useUpdateMemberRole(orgId);
  const removeMemberMutation = useRemoveMember(orgId);

  // --- Data Maps ---

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

  // --- Analytics ---

  const analytics = useMemo(() => {
    const totalMembers = members.length;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // New this month (joined within last 30 days)
    const newThisMonth = members.filter(m => {
      const joinedDate = m.joinedAt || m.createdAt;
      if (!joinedDate) return false;
      return new Date(joinedDate) >= thirtyDaysAgo;
    }).length;

    // Role distribution counts
    const roleCounts = {};
    members.forEach(m => {
      const role = m.orgRole || 'MEMBER';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    // Teams coverage
    const membersWithTeams = members.filter(m => (memberTeamsMap[m.userId] || []).length > 0).length;
    const teamsCoveragePct = totalMembers > 0 ? Math.round((membersWithTeams / totalMembers) * 100) : 0;

    // Active this week (has task updated in last 7 days)
    const activeThisWeek = members.filter(m =>
      hasRecentActivity(memberTasksMap, m.userId, 24 * 7)
    ).length;

    return { totalMembers, newThisMonth, roleCounts, teamsCoveragePct, activeThisWeek };
  }, [members, memberTeamsMap, memberTasksMap]);

  // Avg tasks per member for workload comparison in cards
  const avgTasksPerMember = useMemo(() => {
    if (members.length === 0) return 0;
    const total = Object.values(memberTasksMap).reduce((sum, tasks) => sum + tasks.length, 0);
    return Math.round((total / members.length) * 10) / 10;
  }, [members, memberTasksMap]);

  // --- Multi-criteria Filter Execution ---

  const filteredMembers = useMemo(() => {
    const q = debouncedSearchQuery.toLowerCase().trim();
    const now = new Date().getTime();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    return members.filter((member) => {
      // Quick view presets (additive alongside existing filters)
      if (quickView === 'active') {
        const tasks = memberTasksMap[member.userId] || [];
        if (!tasks.some(t => t.updatedAt && new Date(t.updatedAt) >= weekAgo)) return false;
      }
      if (quickView === 'unassigned') {
        if ((memberTeamsMap[member.userId] || []).length > 0) return false;
      }
      if (quickView === 'admins') {
        if (member.rolePriority !== 0) return false;
      }

      const nameMatch = !q
        || member.username?.toLowerCase().includes(q)
        || member.email?.toLowerCase().includes(q)
        || member.orgRole?.toLowerCase().includes(q);
      const roleMatch = selectedRoleFilter === 'ALL' || member.orgRole === selectedRoleFilter;
      const teamMatch = selectedTeamFilter === 'ALL'
        || (memberTeamsMap[member.userId]
          && memberTeamsMap[member.userId].some(t => (t.id?.toString() ?? t.name) === selectedTeamFilter));
      return nameMatch && roleMatch && teamMatch;
    });
  }, [members, debouncedSearchQuery, selectedRoleFilter, selectedTeamFilter, memberTeamsMap, memberTasksMap, quickView]);



  // --- Recently Joined & Activity Feed ---

  const recentlyJoined = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return members
      .filter(m => {
        const joinedDate = m.joinedAt || m.createdAt;
        if (!joinedDate) return false;
        return new Date(joinedDate) >= thirtyDaysAgo;
      })
      .sort((a, b) => {
        const dateA = new Date(a.joinedAt || a.createdAt || 0);
        const dateB = new Date(b.joinedAt || b.createdAt || 0);
        return dateB - dateA;
      });
  }, [members]);

  // --- Compare Data ---

  const compareMembers = useMemo(() => {
    if (selectedIds.length !== 2) return null;
    const [idA, idB] = selectedIds;
    const memberA = members.find(m => m.userId === idA);
    const memberB = members.find(m => m.userId === idB);
    if (!memberA || !memberB) return null;

    const teamsA = memberTeamsMap[idA] || [];
    const teamsB = memberTeamsMap[idB] || [];
    const tasksA = memberTasksMap[idA] || [];
    const tasksB = memberTasksMap[idB] || [];

    // Team overlap
    const sharedTeams = teamsA.filter(ta => teamsB.some(tb => (tb.id || tb.name) === (ta.id || ta.name)));

    return {
      memberA: {
        ...memberA,
        teamsCount: teamsA.length,
        tasksCount: tasksA.length,
        lastActive: formatLastActive(memberTasksMap, idA),
        isActiveNow: hasRecentActivity(memberTasksMap, idA, 24),
      },
      memberB: {
        ...memberB,
        teamsCount: teamsB.length,
        tasksCount: tasksB.length,
        lastActive: formatLastActive(memberTasksMap, idB),
        isActiveNow: hasRecentActivity(memberTasksMap, idB, 24),
      },
      sharedTeams,
    };
  }, [selectedIds, members, memberTeamsMap, memberTasksMap]);

  // --- CSV Export ---

  const handleExportCSV = useCallback(() => {
    try {
      const targetMembers = filteredMembers;
      const headers = ['User ID', 'Username', 'Email', 'Org Role', 'Priority Rank', 'Assigned Teams Count', 'Active Tasks Count', 'Status'];

      const rows = targetMembers.map((m) => {
        const teamsCount = (memberTeamsMap[m.userId] || []).length;
        const tasksCount = (memberTasksMap[m.userId] || []).length;
        const cleanEmail = m.email || 'N/A';
        const priority = m.rolePriority ?? 99;
        return [
          `"${m.userId}"`,
          `"${(m.username || '').replace(/"/g, '""')}"`,
          `"${cleanEmail}"`,
          `"${m.orgRole || 'MEMBER'}"`,
          priority,
          teamsCount,
          tasksCount,
          `"${m.status || 'ACTIVE'}"`,
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `ryokai_directory_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${targetMembers.length} member${targetMembers.length !== 1 ? 's' : ''} to CSV`);
    } catch (err) {
      toast.error('Failed to generate CSV file');
      console.error(err);
    }
  }, [filteredMembers, memberTeamsMap, memberTasksMap]);

  // --- Selection toggling handlers ---

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

  const isError = isMembersError || isTeamsError || isTaskssError;
  const isLoading = isMembersLoading || isTeamsLoading;
  const pageState = isError ? 'error' : isLoading ? 'loading' : 'ready';
  const handleRetry = () => { refetchMembers(); refetchTeams(); refetchTasks(); };
  const adminCount = members.filter(m => m.rolePriority === 0).length;
  const isQuickViewActive = quickView !== null;

  // Role distribution for analytics bar
  const roleDistribution = analytics.roleCounts;
  const totalForRolePct = analytics.totalMembers || 1;

  return (
    <PageShell maxWidth="default">
      <PageHero
        eyebrow="People & Governance"
        meta={`${members.length} member${members.length !== 1 ? 's' : ''}   ${teams.length} ${teams.length === 1 ? 'team' : 'teams'}`}
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

      <EntityFilterBar
          search={searchQuery}
          onSearch={setSearchQuery}
          searchPlaceholder="Search by name, role or email..."
          chips={[
            { id: 'all', label: 'All', count: members.length },
            { id: 'active', label: 'Active', count: analytics.activeThisWeek },
            { id: 'unassigned', label: 'Unassigned', count: members.filter(m => (memberTeamsMap[m.userId] || []).length === 0).length },
            { id: 'admins', label: 'Admins', count: members.filter(m => m.rolePriority === 0).length },
          ]}
          activeChip={quickView || 'all'}
          onChip={(id) => setQuickView(id === 'all' ? null : id)}
        >
                    <PillNav
            items={[
              { value: 'table', label: 'Table' },
              { value: 'orgchart', label: 'Chart' },
            ]}
            value={viewMode}
            onChange={setViewMode}
          />
          {selectedIds.length === 2 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCompareModalOpen(true)}
              className="gap-1.5 text-[12px] h-8"
            >
              <Icons.gitCompare className="w-3.5 h-3.5" />
              Compare (2)
            </Button>
          )}
        </EntityFilterBar>

      <PageContent>
        {pageState === 'ready' && members.length > 0 && (
          <EntityStatStrip
            stats={[
              { key: 'total', label: 'Total Members', value: analytics.totalMembers, sublabel: analytics.newThisMonth > 0 ? `${analytics.newThisMonth} new this month` : 'Members', icon: Users, tone: 'cyan' },
              { key: 'roles', label: 'Roles', value: Object.keys(analytics.roleCounts || {}).length || '--', sublabel: 'Role distribution', icon: PieChart, tone: 'amber' },
              { key: 'coverage', label: 'Coverage', value: `${analytics.teamsCoveragePct}%`, sublabel: 'Members in  1 team', icon: BarChart3, tone: 'emerald' },
              { key: 'active', label: 'Active', value: analytics.activeThisWeek, sublabel: analytics.totalMembers > 0 ? `${Math.round((analytics.activeThisWeek / analytics.totalMembers) * 100)}% active this week` : 'No recent activity', icon: Activity, tone: 'rose' },
            ]}
          />
        )}

        {/* --- Page State & Views --- */}
        <PageState
          state={pageState}
          stateProps={{skeleton: <DirectorySkeleton />, 
            loadingVariant: 'table',
            icon: UserIcon,
            title: 'No organization members found',
            description: 'Try adjusting your filter parameters or inviting new teammates.',
            onRetry: handleRetry,
          }}
        >
          {filteredMembers.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-[var(--bg-subtle)] border border-dashed border-[var(--border-subtle)] rounded-2xl">
              <UserIcon className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-4" />
              <Heading level={2} className="text-[var(--text-secondary)] mb-2">
                No members found
              </Heading>
              <Text variant="muted" className="text-sm">
                {isQuickViewActive
                  ? 'No members match the selected quick view. Try a different preset.'
                  : 'Try adjusting your search query or reset your authority filters'}
              </Text>
              {(selectedRoleFilter !== 'ALL' || selectedTeamFilter !== 'ALL' || searchQuery || isQuickViewActive) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSelectedRoleFilter('ALL'); setSelectedTeamFilter('ALL'); setSearchQuery(''); setQuickView(null); }}
                  className="mt-4"
                >
                  Reset All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-3 bg-[var(--info-soft)]/40 border border-[var(--info-border)]/40 rounded-xl flex items-start gap-3 text-xs">
                <Icons.info className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-[var(--text-secondary)]">Pro Tip: Click any table row to open the inspect drawer.</span>
                  <span className="text-[var(--text-muted)] ml-1">
                    Use checkboxes to trigger batch governance commands or instantly generate CSV roster reports.
                  </span>
                </div>
              </div>

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
        </PageState>

        {/* --- Recent Activity Feed --- */}
        {pageState === 'ready' && members.length > 0 && (
          <RecentActivityFeed
            recentlyJoined={recentlyJoined}
            expanded={activityFeedExpanded}
            onToggleExpanded={() => setActivityFeedExpanded(prev => !prev)}
            onSelectMember={setDrawerMember}
          />
        )}
      </PageContent>

      {/* --- Member Compare Modal --- */}
      <MemberCompareModal
        open={compareModalOpen && !!compareMembers}
        onOpenChange={(open) => !open && setCompareModalOpen(false)}
        compareMembers={compareMembers}
      />

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
    </PageShell>
  );
}

function DirectorySkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
      <div className="h-10 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] px-4 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 px-4 border-b border-[var(--border-subtle)] flex items-center gap-4">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}
