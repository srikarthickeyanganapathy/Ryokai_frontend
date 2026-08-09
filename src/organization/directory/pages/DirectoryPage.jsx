import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import {
  useOrgMembers,
  useUpdateMemberRole,
  useRemoveMember,
  useOrgRoles,
  useOrgTeams,
} from '@/organization';
import { useTaskList } from '@/task';
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
  Download,
  TrendingUp,
  PieChart,
  Activity,
  Clock,
  BarChart3,
  GitCompare,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Check,
  X,
} from '@/shared/ui/Icons';
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
import { PageShell, PageHero, PageContent, PageToolbar } from '@/shared/ui/PageShell';
import { usePermissions, useAuth } from '@/identity';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog';
import { InviteMemberModal } from '../../components/Invites/InviteMemberModal';
import { PageState } from '@/shared/ui/PageState';
import { toast } from 'sonner';

// Child components for Phase 1 enhancements
import { MemberDetailDrawer } from '../components/MemberDetailDrawer';
import { DirectoryOrgChart } from '../components/DirectoryOrgChart';
import { DirectoryTableView } from '../components/DirectoryTableView';
import { DirectoryBulkActionsBar } from '../components/DirectoryFilterAndBulkBar';

// ───────── Utility Helpers ─────────

function hashHue(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

function timeAgo(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 0) return 'just now';
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function formatLastActive(memberTasksMap, userId) {
  const tasks = memberTasksMap[userId] || [];
  if (tasks.length === 0) return null;
  const sorted = [...tasks]
    .filter(t => t.updatedAt)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  if (sorted.length === 0) return null;
  return timeAgo(new Date(sorted[0].updatedAt));
}

function hasRecentActivity(memberTasksMap, userId, hours = 24) {
  const tasks = memberTasksMap[userId] || [];
  const threshold = Date.now() - hours * 60 * 60 * 1000;
  return tasks.some(t => t.updatedAt && new Date(t.updatedAt).getTime() >= threshold);
}

// ───────── Main Page Component ─────────

export function DirectoryPage() {
  const { activeOrganization } = useWorkspace();
  const orgId = activeOrganization?.id;
  const { user } = useAuth();

  // Existing queries + new enrichment data sources
  const { data: members = [], isLoading: isMembersLoading } = useOrgMembers(orgId);
  const { data: roles = [] } = useOrgRoles(orgId);
  const { data: teams = [], isLoading: isTeamsLoading } = useOrgTeams(orgId);
  const { data: { tasks: allTasks = [] } = {}, isLoading: isTasksLoading } = useTaskList({});

  // Local interface UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const searchDebounceRef = useRef(null)

  // Debounce search input by 300ms to avoid per-keystroke re-filters
  useEffect(() => {
    searchDebounceRef.current = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300)
    return () => clearTimeout(searchDebounceRef.current)
  }, [searchQuery])

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table' | 'orgchart'
  const [groupByRole, setGroupByRole] = useState(false);
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

  // ───────── Data Maps ─────────

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

  // ───────── Analytics ─────────

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

  // ───────── Multi-criteria Filter Execution ─────────

  const filteredMembers = useMemo(() => {
    const q = debouncedSearchQuery.toLowerCase().trim();
    const now = Date.now();
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

    return Object.values(groups).sort((a, b) => {
      const avgA = a.totalPriority / a.items.length;
      const avgB = b.totalPriority / b.items.length;
      return avgA - avgB;
    });
  }, [filteredMembers, groupByRole, viewMode]);

  // ───────── Recently Joined & Activity Feed ─────────

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

  // ───────── Compare Data ─────────

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

  // ───────── CSV Export ─────────

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

  // ───────── Selection toggling handlers ─────────

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
  const isQuickViewActive = quickView !== null;

  // Role distribution for analytics bar
  const roleDistribution = analytics.roleCounts;
  const totalForRolePct = analytics.totalMembers || 1;

  return (
    <PageShell maxWidth="default">
      <PageHero
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

      <PageToolbar>
        <div className="flex items-center gap-3 flex-wrap w-full">
          {/* Search — matches teams pattern */}
          <div className="relative flex-1 max-w-md">
            <Icons.search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, role or email..."
              className="w-full pl-9 pr-8 py-2 text-[13px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent-border)] transition-all text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <Icons.x className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View mode — Calendar-style pill buttons */}
          <div className="flex items-center bg-[var(--bg-subtle)] rounded-md p-0.5 border border-[var(--border-subtle)]">
            {[
              { value: 'grid', label: 'Cards' },
              { value: 'table', label: 'Table' },
              { value: 'orgchart', label: 'Chart' },
            ].map(opt => (
              <Button
                key={opt.value}
                variant="ghost"
                onClick={() => setViewMode(opt.value)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-medium rounded-sm transition-colors h-auto',
                  viewMode === opt.value
                    ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                )}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* Quick view presets — Calendar-style pill buttons */}
          <div className="flex items-center bg-[var(--bg-subtle)] rounded-md p-0.5 border border-[var(--border-subtle)]">
            {[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'unassigned', label: 'Unassigned' },
              { value: 'admins', label: 'Admins' },
            ].map(opt => (
              <Button
                key={opt.value}
                variant="ghost"
                onClick={() => setQuickView(opt.value === 'all' ? null : opt.value)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-medium rounded-sm transition-colors h-auto',
                  (quickView || 'all') === opt.value
                    ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                )}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* Group by Role — Calendar-style compact toggle */}
          {viewMode === 'grid' && (
            <Button
              variant="ghost"
              onClick={() => setGroupByRole(prev => !prev)}
              className={cn(
                'px-2.5 py-1 text-[11px] font-medium rounded-sm transition-colors h-auto gap-1.5',
                groupByRole
                  ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              <Layers className="w-3 h-3" />
              Grouped
            </Button>
          )}
        </div>

        {/* Compare button when 2 selected */}
        {selectedIds.length === 2 && (
          <div className="mt-2 flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCompareModalOpen(true)}
              className="gap-1.5 text-[12px] h-8"
            >
              <Icons.gitCompare className="w-3.5 h-3.5" />
              Compare (2)
            </Button>
          </div>
        )}
      </PageToolbar>

      <PageContent>
        {/* ───────── Analytics Summary Header ───────── */}
        {pageState === 'ready' && members.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6"
          >
            {/* Total Members */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg p-3 shadow-xs hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-1.5">
                <Users className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Total</span>
              </div>
              <div className="text-[22px] sm:text-[26px] font-bold text-[var(--text-primary)] tracking-tight">{analytics.totalMembers}</div>
              <Text variant="muted" className="text-[11px] mt-0.5">
                {analytics.newThisMonth > 0
                  ? `${analytics.newThisMonth} new this month`
                  : 'Members'}
              </Text>
            </div>

            {/* Role Distribution */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg p-3 shadow-xs hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-1.5">
                <PieChart className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Roles</span>
              </div>
              <div className="space-y-1.5 mt-1">
                {['ADMIN', 'MANAGER', 'MEMBER'].map(role => {
                  const count = roleDistribution[role] || 0;
                  const pct = totalForRolePct > 0 ? Math.round((count / totalForRolePct) * 100) : 0;
                  if (count === 0) return null;
                  return (
                    <div key={role} className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-[var(--text-secondary)] w-[72px] truncate">{role}</span>
                      <div className="flex-1 h-1 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full bg-[var(--accent)] rounded-full opacity-80"
                        />
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] w-7 text-right tabular-nums">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Teams Coverage */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg p-3 shadow-xs hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Coverage</span>
              </div>
              <div className="text-[22px] sm:text-[26px] font-bold text-[var(--text-primary)] tracking-tight">{analytics.teamsCoveragePct}%</div>
              <div className="mt-1.5 h-1 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analytics.teamsCoveragePct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                  className="h-full bg-[var(--accent)] rounded-full"
                />
              </div>
              <Text variant="muted" className="text-[11px] mt-1">members in ≥1 team</Text>
            </div>

            {/* Active This Week */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg p-3 shadow-xs hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-1.5">
                <Activity className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Active</span>
              </div>
              <div className="text-[22px] sm:text-[26px] font-bold text-[var(--text-primary)] tracking-tight">{analytics.activeThisWeek}</div>
              <Text variant="muted" className="text-[11px] mt-0.5">
                {analytics.totalMembers > 0
                  ? `${Math.round((analytics.activeThisWeek / analytics.totalMembers) * 100)}% active this week`
                  : 'No recent activity'}
              </Text>
            </div>
          </motion.div>
        )}

        {/* ───────── Page State & Member Grid ───────── */}
        <PageState
          state={pageState}
          stateProps={{
            loadingVariant: 'cards',
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
                  <span className="font-medium text-[var(--text-secondary)]">Pro Tip: Click any member card or table row to open the inspect drawer.</span>
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
                            avgTasksPerMember={avgTasksPerMember}
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
                      avgTasksPerMember={avgTasksPerMember}
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
        </PageState>

        {/* ───────── Recent Activity Feed ───────── */}
        {pageState === 'ready' && members.length > 0 && (
          <div className="mt-8 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-elevated)] overflow-hidden">
            <button
              type="button"
              onClick={() => setActivityFeedExpanded(prev => !prev)}
              className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-subtle)]/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">Recent Activity</span>
                <Badge variant="outline" className="text-[10px]">
                  {recentlyJoined.length > 0 ? `${recentlyJoined.length} joined` : 'All caught up'}
                </Badge>
              </div>
              {activityFeedExpanded
                ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
              }
            </button>

            <AnimatePresence>
              {activityFeedExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-4">
                    {/* Recently Joined */}
                    <div className="space-y-2">
                      <Text className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Recently Joined (last 30 days)
                      </Text>
                      {recentlyJoined.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {recentlyJoined.slice(0, 6).map(member => {
                            const joinedDate = member.joinedAt || member.createdAt;
                            return (
                              <div
                                key={member.userId}
                                className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--accent-border)] transition-colors"
                                onClick={() => setDrawerMember(member)}
                              >
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0"
                                  style={{ background: `linear-gradient(135deg, hsl(${hashHue(member.username || '?')} 60% 46%), hsl(${(hashHue(member.username || '?') + 45) % 360} 65% 36%))` }}
                                >
                                  {member.username?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-semibold text-[var(--text-primary)] truncate">{member.username}</div>
                                  <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">{member.orgRole}</Badge>
                                    {joinedDate && <span>{timeAgo(new Date(joinedDate))}</span>}
                                  </div>
                                </div>
                                <UserPlus className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-[var(--text-muted)] italic p-3 border border-dashed border-[var(--border-subtle)] rounded-md text-center">
                          No new members joined in the last 30 days
                        </div>
                      )}
                    </div>

                    {/* Role Changes */}
                    <div className="space-y-2">
                      <Text className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Role Changes (this week)
                      </Text>
                      <div className="text-xs text-[var(--text-muted)] italic p-3 border border-dashed border-[var(--border-subtle)] rounded-md text-center">
                        No role changes recorded this week
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </PageContent>

      {/* ───────── Member Compare Modal ───────── */}
      <AnimatePresence>
        {compareModalOpen && compareMembers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Compare team members"
            onClick={() => setCompareModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-full max-w-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2.5">
                  <GitCompare className="w-5 h-5 text-[var(--accent)]" />
                  <Heading level={4} className="text-[15px] font-semibold text-[var(--text-primary)]">
                    Member Comparison
                  </Heading>
                </div>
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setCompareModalOpen(false)}
                  className="h-8 w-8"
                  aria-label="Close comparison"
                >
                  <X className="w-4 h-4" />
                </IconButton>
              </div>

              {/* Modal body — side-by-side comparison */}
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {/* Member A */}
                  {[compareMembers.memberA, compareMembers.memberB].map((m, idx) => {
                    const hue = hashHue(m.username || '?');
                    return (
                      <div key={m.userId} className="space-y-3 p-4 rounded-xl bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)]">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm shrink-0 relative"
                            style={{ background: `linear-gradient(135deg, hsl(${hue} 60% 46%), hsl(${(hue + 45) % 360} 65% 36%))` }}
                          >
                            {m.username?.charAt(0).toUpperCase() || '?'}
                            {m.isActiveNow && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[var(--success)] border-2 border-[var(--bg-elevated)] rounded-full" title="Active now" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{m.username}</div>
                            <Badge variant="outline" className="text-[9px]">{m.orgRole}</Badge>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[var(--text-muted)]">Teams</span>
                            <span className="font-semibold text-[var(--text-primary)]">{m.teamsCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-muted)]">Tasks</span>
                            <span className="font-semibold text-[var(--text-primary)]">{m.tasksCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-muted)]">Priority</span>
                            <span className="font-semibold text-[var(--text-primary)]">#{m.rolePriority ?? 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-muted)]">Last active</span>
                            <span className="font-semibold text-[var(--text-primary)]">{m.lastActive || 'No activity'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Task count bar comparison */}
                <div className="space-y-2">
                  <Text className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Task Workload Comparison
                  </Text>
                  <div className="space-y-2">
                    {[
                      { label: compareMembers.memberA.username, count: compareMembers.memberA.tasksCount, color: 'bg-[var(--accent)]' },
                      { label: compareMembers.memberB.username, count: compareMembers.memberB.tasksCount, color: 'bg-[var(--accent)]' },
                    ].map(item => {
                      const maxTasks = Math.max(compareMembers.memberA.tasksCount, compareMembers.memberB.tasksCount, 1);
                      const pct = Math.round((item.count / maxTasks) * 100);
                      return (
                        <div key={item.label} className="flex items-center gap-3">
                          <span className="text-[11px] text-[var(--text-secondary)] w-24 truncate">{item.label}</span>
                          <div className="flex-1 h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                              className={cn("h-full rounded-full", item.color)}
                            />
                          </div>
                          <span className="text-[11px] font-mono font-semibold text-[var(--text-primary)] w-6 text-right">{item.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Team overlap */}
                <div className="space-y-2">
                  <Text className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Shared Teams ({compareMembers.sharedTeams.length})
                  </Text>
                  {compareMembers.sharedTeams.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {compareMembers.sharedTeams.map(team => (
                        <Badge key={team.id || team.name} variant="outline" className="text-[10px] bg-[var(--bg-card)]">
                          <Users className="w-2.5 h-2.5 mr-1 text-[var(--accent)]" />
                          {team.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[var(--text-muted)] italic p-2 border border-dashed border-[var(--border-subtle)] rounded-md text-center">
                      These members don't share any teams
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

// ───────── Sub-component: Enhanced Member Card Grid ─────────

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
  avgTasksPerMember = 0,
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
          const isActiveNow = hasRecentActivity(memberTasksMap, member.userId, 24);
          const lastActive = formatLastActive(memberTasksMap, member.userId);
          const maxWorkload = Math.max(avgTasksPerMember, tasks.length, 1);

          return (
            <motion.div
              key={member.userId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.25) }}
              onClick={() => onSelectMember(member)}
              className={cn(
                "group relative bg-[var(--bg-elevated)] border rounded-xl p-4 sm:p-5 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between overflow-hidden",
                isSelected
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]/10 ring-2 ring-[var(--accent)]/30 shadow-[0_0_12px_rgba(var(--accent-rgb,99,102,241),0.15)]"
                  : "border-[var(--border-subtle)] hover:border-[var(--accent-border)]"
              )}
            >
              {/* Selection checkmark overlay */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-md z-10"
                >
                  <Check className="w-3.5 h-3.5 text-white" />
                </motion.div>
              )}

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

                    <div className="relative">
                      <div
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm shrink-0"
                        style={{ background: `linear-gradient(135deg, hsl(${hue} 60% 46%), hsl(${(hue + 45) % 360} 65% 36%))` }}
                      >
                        {member.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      {/* Activity pulse indicator */}
                      {isActiveNow && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[var(--success)] border-2 border-[var(--bg-elevated)] rounded-full" title="Active in last 24h">
                          <span className="absolute inset-0 rounded-full bg-[var(--success)] animate-ping opacity-75" />
                        </div>
                      )}
                      {isSuspended && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[var(--danger)] border-2 border-[var(--bg-elevated)] rounded-full" title="Suspended" />
                      )}
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className="shrink-0 text-[10px] uppercase tracking-wider shadow-2xs font-medium"
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

                  {/* Last active timestamp */}
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-[var(--text-muted)]">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>{lastActive ? `Last active: ${lastActive}` : 'No recent activity'}</span>
                    {isActiveNow && <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />}
                  </div>
                </div>

                {/* Team Affiliations and Workload Pills */}
                <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                  {teams.length > 0 ? (
                    teams.slice(0, 2).map((t) => (
                      <Badge key={t.id || t.name} variant="outline" className="text-[10px] bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] font-medium">
                        <Users className="w-2.5 h-2.5 mr-1 text-[var(--text-muted)]" />
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

                {/* Mini workload bar: this member vs org average */}
                <div className="mt-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[9px] text-[var(--text-muted)]">
                    <span>Workload</span>
                    <span>avg {avgTasksPerMember > 0 ? avgTasksPerMember : '—'}</span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: maxWorkload > 0 ? `${(tasks.length / maxWorkload) * 100}%` : '0%' }}
                      transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.02 }}
                      className={cn(
                        "h-full rounded-full",
                        tasks.length >= avgTasksPerMember && avgTasksPerMember > 0
                          ? "bg-[var(--warning)]"
                          : "bg-[var(--accent)]"
                      )}
                    />
                    {avgTasksPerMember > 0 && (
                      <div
                        className="h-full w-0.5 bg-[var(--text-muted)]/50"
                        style={{ marginLeft: `-${(avgTasksPerMember / maxWorkload) * 100}%` }}
                      />
                    )}
                  </div>
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
                        aria-label="Remove member"
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
