import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DataTable } from '@/shared/ui/data-table/DataTable';
import { Checkbox } from '@/shared/ui/Checkbox';
import { Badge } from '@/shared/ui/Badge';
import { IconButton } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/Popover';
import {
  Mail,
  Shield,
  Users,
  FolderKanban,
  Eye,
  MessageSquare,
  CheckSquare as CheckSquareIcon,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Columns,
  Clock,
  UserCheck,
} from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';
import { SPRINGS, EASING } from '@/shared/lib/uxTokens';
import { toast } from 'sonner';

function hashHue(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

// ─── Sortable Header Renderer ─────────────────────────────────────────
function SortableHeader({ label, sortKey, currentSort, onSort, className }) {
  const isActive = currentSort?.key === sortKey;
  const direction = isActive ? currentSort?.direction : null;

  const ArrowIcon = direction === 'asc' ? ArrowUp : direction === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        'flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors select-none group',
        isActive && 'text-[var(--accent)] hover:text-[var(--accent)]',
        className
      )}
    >
      {label}
      <ArrowIcon
        className={cn(
          'w-3 h-3 transition-colors',
          isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] opacity-40 group-hover:opacity-100'
        )}
      />
    </button>
  );
}

// ─── Column Visibility Toggle ─────────────────────────────────────────
const COLUMN_DEFS = [
  { id: 'username', label: 'Name', alwaysOn: true },
  { id: 'orgRole', label: 'Role', alwaysOn: false },
  { id: 'email', label: 'Email', alwaysOn: false },
  { id: 'teams', label: 'Teams', alwaysOn: false },
  { id: 'workload', label: 'Tasks', alwaysOn: false },
  { id: 'joined', label: 'Joined', alwaysOn: false },
  { id: 'status', label: 'Status', alwaysOn: false },
];

function ColumnVisibilityToggle({ visibleColumns, onToggle }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          className="h-8 w-8 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          title="Toggle columns"
          aria-label="Toggle columns"
        >
          <Columns className="w-4 h-4" />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg shadow-xl" align="end">
        <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Visible Columns
        </div>
        {COLUMN_DEFS.map((col) => (
          <label
            key={col.id}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors',
              col.alwaysOn ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[var(--bg-subtle)]'
            )}
          >
            <Checkbox
              checked={col.alwaysOn ? true : visibleColumns.includes(col.id)}
              onCheckedChange={() => !col.alwaysOn && onToggle(col.id)}
              disabled={col.alwaysOn}
            />
            <span className="text-xs text-[var(--text-primary)]">{col.label}</span>
            {col.alwaysOn && (
              <span className="text-[9px] text-[var(--text-muted)] ml-auto">required</span>
            )}
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// ─── Quick Row Actions ────────────────────────────────────────────────
function QuickRowActions({ member, onView, onMessage, onTasks }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 4 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 4 }}
      transition={SPRINGS.fast}
      className="flex items-center gap-0.5"
    >
      <IconButton
        variant="ghost"
        size="sm"
        className="h-7 w-7 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]/50"
        title="View profile"
        aria-label="View profile"
        onClick={(e) => { e.stopPropagation(); onView?.(member); }}
      >
        <Eye className="w-3.5 h-3.5" />
      </IconButton>
      <IconButton
        variant="ghost"
        size="sm"
        className="h-7 w-7 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]/50"
        title="Send message"
        aria-label="Send message"
        onClick={(e) => { e.stopPropagation(); onMessage?.(member); }}
      >
        <Mail className="w-3.5 h-3.5" />
      </IconButton>
      <IconButton
        variant="ghost"
        size="sm"
        className="h-7 w-7 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]/50"
        title="View tasks"
        aria-label="View tasks"
        onClick={(e) => { e.stopPropagation(); onTasks?.(member); }}
      >
        <CheckSquareIcon className="w-3.5 h-3.5" />
      </IconButton>
    </motion.div>
  );
}

// ─── Sorting Logic ────────────────────────────────────────────────────
function useSortedMembers(members, sort, memberTeamsMap, memberTasksMap) {
  return useMemo(() => {
    if (!sort?.key) return members;
    const sorted = [...members];
    const dir = sort.direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      let aVal, bVal;
      switch (sort.key) {
        case 'username':
          aVal = (a.username || '').toLowerCase();
          bVal = (b.username || '').toLowerCase();
          return aVal.localeCompare(bVal) * dir;
        case 'orgRole':
          aVal = a.rolePriority ?? 999;
          bVal = b.rolePriority ?? 999;
          return (aVal - bVal) * dir;
        case 'teams':
          aVal = (memberTeamsMap[a.userId] || []).length;
          bVal = (memberTeamsMap[b.userId] || []).length;
          return (aVal - bVal) * dir;
        case 'workload':
          aVal = (memberTasksMap[a.userId] || []).length;
          bVal = (memberTasksMap[b.userId] || []).length;
          return (aVal - bVal) * dir;
        default:
          return 0;
      }
    });
    return sorted;
  }, [members, sort, memberTeamsMap, memberTasksMap]);
}

export function DirectoryTableView({
  members = [],
  isLoading,
  selectedIds = [],
  onToggleSelect,
  onToggleAll,
  memberTeamsMap = {},
  memberTasksMap = {},
  roles = [],
  onUpdateRole,
  onRemoveMember,
  onSelectMember,
  canManageRoles,
  canRemoveMembers,
  currentUserId,
  adminCount,
}) {
  const [sort, setSort] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState([
    'orgRole', 'email', 'teams', 'workload', 'joined', 'status',
  ]);
  const [updatedRoles, setUpdatedRoles] = useState({}); // userId → timestamp

  const sortedMembers = useSortedMembers(members, sort, memberTeamsMap, memberTasksMap);

  const isAllSelected = sortedMembers.length > 0 && sortedMembers.every((m) => selectedIds.includes(m.userId));
  const isIndeterminate = selectedIds.length > 0 && !isAllSelected;

  const handleSort = useCallback((key) => {
    setSort((prev) => {
      if (prev?.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return null; // clear sort
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const handleToggleColumn = useCallback((colId) => {
    setVisibleColumns((prev) =>
      prev.includes(colId) ? prev.filter((c) => c !== colId) : [...prev, colId]
    );
  }, []);

  const handleRoleChange = useCallback(
    async (userId, roleId) => {
      try {
        await onUpdateRole?.(userId, roleId);
        setUpdatedRoles((prev) => ({ ...prev, [userId]: Date.now() }));
        // Auto-clear badge after 2.5s
        setTimeout(() => {
          setUpdatedRoles((prev) => {
            const next = { ...prev };
            delete next[userId];
            return next;
          });
        }, 2500);
      } catch (err) {
        toast.error('Failed to update role');
      }
    },
    [onUpdateRole]
  );

  const columns = useMemo(() => {
    const cols = [];

    // Selection column (always visible)
    cols.push({
      id: 'select',
      header: () => (
        <div className="flex items-center px-1" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isAllSelected || (isIndeterminate ? 'indeterminate' : false)}
            onCheckedChange={() =>
              onToggleAll && onToggleAll(sortedMembers.map((m) => m.userId))
            }
            aria-label="Select all rows"
          />
        </div>
      ),
      cell: ({ row }) => {
        const member = row.original;
        const isSelf = member.userId === currentUserId;
        const isLastAdmin = adminCount <= 1 && member.rolePriority === 0;
        const disabled = isSelf || isLastAdmin;

        return (
          <div className="flex items-center px-1" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selectedIds.includes(member.userId)}
              onCheckedChange={() => !disabled && onToggleSelect && onToggleSelect(member.userId)}
              disabled={disabled}
              aria-label="Select member"
            />
          </div>
        );
      },
    });

    // Name column (always visible)
    cols.push({
      accessorKey: 'username',
      header: () => (
        <SortableHeader label="Member Roster" sortKey="username" currentSort={sort} onSort={handleSort} />
      ),
      cell: ({ row }) => {
        const member = row.original;
        const hue = hashHue(member.username || '?');
        const isSelf = member.userId === currentUserId;
        const isSuspended = member.status === 'SUSPENDED';
        const isSelected = selectedIds.includes(member.userId);

        return (
          <div
            className={cn(
              'flex items-center gap-3 py-0.5 px-1 rounded-lg -mx-1 transition-colors',
              isSelected && 'bg-[var(--accent-soft)]/20'
            )}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-2xs relative"
              style={{
                background: `linear-gradient(135deg, hsl(${hue} 60% 45%), hsl(${(hue + 45) % 360} 65% 35%))`,
              }}
            >
              {member.username?.charAt(0).toUpperCase() || '?'}
              {isSuspended && (
                <div
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--danger)] rounded-full border border-[var(--bg-elevated)]"
                  title="Suspended"
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'font-semibold text-[13px]',
                    isSuspended
                      ? 'line-through text-[var(--text-muted)] decoration-[var(--danger)]'
                      : 'text-[var(--text-primary)]'
                  )}
                >
                  {member.username}
                </span>
                {isSelf && (
                  <span className="text-[10px] font-normal text-[var(--accent)] bg-[var(--accent-soft)]/60 px-1.5 py-0.5 rounded border border-[var(--accent-border)]/40">
                    You
                  </span>
                )}
              </div>
              {visibleColumns.includes('email') && (
                <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] truncate">
                  <Mail className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                  <span>{member.email || 'No email provided'}</span>
                </div>
              )}
            </div>
          </div>
        );
      },
    });

    // Role column
    if (visibleColumns.includes('orgRole')) {
      cols.push({
        accessorKey: 'orgRole',
        header: () => (
          <SortableHeader label="Authority Role" sortKey="orgRole" currentSort={sort} onSort={handleSort} />
        ),
        cell: ({ row }) => {
          const member = row.original;
          const priority = member.rolePriority ?? 99;
          const justUpdated = updatedRoles[member.userId];

          return (
            <div className="space-y-1 relative">
              <div className="flex items-center gap-1.5">
                <Badge
                  variant={
                    priority === 0 ? 'danger' : priority === 1 ? 'warning' : 'outline'
                  }
                  className="text-[10px] uppercase tracking-wider font-medium"
                >
                  {member.orgRole}
                </Badge>
                {/* AnimatePresence "Updated!" badge */}
                <AnimatePresence>
                  {justUpdated && (
                    <motion.span
                      key={`updated-${justUpdated}`}
                      initial={{ opacity: 0, scale: 0.5, x: -4 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.5, y: -4 }}
                      transition={SPRINGS.fast}
                      className="inline-flex items-center gap-0.5 text-[9px] font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded-full border border-[var(--border-subtle)]"
                    >
                      <motion.span
                        animate={{ rotate: [0, -15, 15, 0] }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        ✓
                      </motion.span>
                      Updated!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-medium">
                <Shield className="w-3 h-3 text-[var(--accent)]" />
                <span>Rank #{priority}</span>
              </div>
            </div>
          );
        },
      });
    }

    // Teams column
    if (visibleColumns.includes('teams')) {
      cols.push({
        id: 'teams',
        header: () => (
          <SortableHeader label="Team Affiliations" sortKey="teams" currentSort={sort} onSort={handleSort} />
        ),
        cell: ({ row }) => {
          const member = row.original;
          const teams = memberTeamsMap[member.userId] || [];

          if (teams.length === 0) {
            return (
              <span className="text-xs text-[var(--text-muted)] italic">Unassigned</span>
            );
          }

          return (
            <div className="flex items-center gap-1.5 flex-wrap max-w-[200px]">
              {teams.slice(0, 2).map((t) => (
                <Badge
                  key={t.id || t.name}
                  variant="outline"
                  className="text-[10px] bg-[var(--bg-subtle)] border-[var(--border-subtle)] font-medium truncate max-w-[120px]"
                >
                  <Users className="w-2.5 h-2.5 mr-1 text-[var(--text-muted)]" />
                  {t.name}
                </Badge>
              ))}
              {teams.length > 2 && (
                <span className="text-[10px] text-[var(--text-muted)] font-medium tabular-nums pl-0.5">
                  +{teams.length - 2} more
                </span>
              )}
            </div>
          );
        },
      });
    }

    // Tasks column
    if (visibleColumns.includes('workload')) {
      cols.push({
        id: 'workload',
        header: () => (
          <SortableHeader label="Active Tasks" sortKey="workload" currentSort={sort} onSort={handleSort} />
        ),
        cell: ({ row }) => {
          const member = row.original;
          const tasks = memberTasksMap[member.userId] || [];

          return (
            <div className="inline-flex items-center gap-1.5 bg-[var(--bg-subtle)] px-2.5 py-1 rounded-full border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)]">
              <FolderKanban
                className={cn(
                  'w-3.5 h-3.5',
                  tasks.length > 0 ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
                )}
              />
              <span>
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
          );
        },
      });
    }

    // Joined column
    if (visibleColumns.includes('joined')) {
      cols.push({
        id: 'joined',
        header: () => <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Joined</span>,
        cell: ({ row }) => {
          const member = row.original;
          const joinedDate = member.createdAt || member.joinedAt;
          if (!joinedDate) {
            return <span className="text-xs text-[var(--text-muted)]">—</span>;
          }
          const date = new Date(joinedDate);
          const formatted = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          return (
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[var(--text-muted)]" />
              {formatted}
            </span>
          );
        },
      });
    }

    // Status column
    if (visibleColumns.includes('status')) {
      cols.push({
        id: 'status',
        header: () => <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Status</span>,
        cell: ({ row }) => {
          const member = row.original;
          const isSuspended = member.status === 'SUSPENDED';
          const isActive = member.status === 'ACTIVE' || !member.status;

          return (
            <Badge
              variant={isSuspended ? 'danger' : 'outline'}
              className={cn(
                'text-[10px] font-semibold uppercase tracking-wider',
                isActive && 'text-[var(--success)] border-[var(--success)]/40 bg-[var(--success)]/10'
              )}
            >
              <UserCheck className="w-2.5 h-2.5 mr-1" />
              {member.status || 'ACTIVE'}
            </Badge>
          );
        },
      });
    }

    // Governance / Actions column
    cols.push({
      id: 'actions',
      header: () => (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Actions</span>
          <ColumnVisibilityToggle visibleColumns={visibleColumns} onToggle={handleToggleColumn} />
        </div>
      ),
      cell: ({ row }) => {
        const member = row.original;
        const currentRole = roles.find((r) => r.name === member.orgRole);
        const isSelf = member.userId === currentUserId;
        const isLastAdmin = adminCount <= 1 && member.rolePriority === 0;

        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {canManageRoles || canRemoveMembers ? (
              <>
                {canManageRoles && (
                  <Select
                    value={currentRole?.id?.toString() ?? ''}
                    onValueChange={(val) => handleRoleChange(member.userId, parseInt(val, 10))}
                    disabled={isSelf || isLastAdmin}
                  >
                    <SelectTrigger className="w-[115px] h-7 text-[11px] font-medium bg-[var(--bg-card)]">
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
                    className="h-7 w-7"
                    title="Remove Member"
                    aria-label="Remove member"
                    onClick={() => onRemoveMember && onRemoveMember(member)}
                  >
                    <Icons.trash2 className="w-3.5 h-3.5" />
                  </IconButton>
                )}
              </>
            ) : (
              <span className="text-[11px] text-[var(--text-muted)]">No permissions</span>
            )}
          </div>
        );
      },
    });

    return cols;
  }, [
    sortedMembers,
    selectedIds,
    isAllSelected,
    isIndeterminate,
    memberTeamsMap,
    memberTasksMap,
    roles,
    canManageRoles,
    canRemoveMembers,
    currentUserId,
    adminCount,
    sort,
    updatedRoles,
    visibleColumns,
    onToggleAll,
    onToggleSelect,
    handleSort,
    handleToggleColumn,
    handleRoleChange,
    onRemoveMember,
  ]);

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={sortedMembers}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        emptyStateTitle="No organization members found"
        emptyStateDescription="Try adjusting your search query or role filters."
        onRowClick={(member) => onSelectMember && onSelectMember(member)}
      />
    </div>
  );
}
