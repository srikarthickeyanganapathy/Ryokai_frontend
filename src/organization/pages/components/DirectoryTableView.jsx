import React, { useMemo } from 'react';
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
import { Mail, Shield, Users, FolderKanban } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

function hashHue(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
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
  const isAllSelected = members.length > 0 && members.every((m) => selectedIds.includes(m.userId));
  const isIndeterminate = selectedIds.length > 0 && !isAllSelected;

  const columns = useMemo(() => [
    {
      id: 'select',
      header: () => (
        <div className="flex items-center px-1" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isAllSelected || (isIndeterminate && 'indeterminate')}
            onCheckedChange={() => onToggleAll && onToggleAll(members.map((m) => m.userId))}
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
    },
    {
      accessorKey: 'username',
      header: 'Member Roster',
      cell: ({ row }) => {
        const member = row.original;
        const hue = hashHue(member.username || '?');
        const isSelf = member.userId === currentUserId;
        const isSuspended = member.status === 'SUSPENDED';

        return (
          <div className="flex items-center gap-3 py-0.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-2xs relative"
              style={{ background: `linear-gradient(135deg, hsl(${hue} 60% 45%), hsl(${(hue + 45) % 360} 65% 35%))` }}
            >
              {member.username?.charAt(0).toUpperCase() || '?'}
              {isSuspended && (
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--danger)] rounded-full border border-[var(--bg-elevated)]" title="Suspended" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("font-semibold text-[13px]", isSuspended ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]")}>
                  {member.username}
                </span>
                {isSelf && (
                  <span className="text-[10px] font-normal text-[var(--text-muted)] bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] truncate">
                <Mail className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                <span>{member.email || 'No email provided'}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'orgRole',
      header: 'Authority Role',
      cell: ({ row }) => {
        const member = row.original;
        const priority = member.rolePriority ?? 99;

        return (
          <div className="space-y-1">
            <Badge
              variant={
                priority === 0 ? 'danger' :
                priority === 1 ? 'warning' : 'outline'
              }
              className="text-[10px] uppercase font-mono tracking-wider font-semibold"
            >
              {member.orgRole}
            </Badge>
            <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-medium">
              <Shield className="w-3 h-3 text-[var(--accent)]" />
              <span>Rank #{priority}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'teams',
      header: 'Team Affiliations',
      cell: ({ row }) => {
        const member = row.original;
        const teams = memberTeamsMap[member.userId] || [];

        if (teams.length === 0) {
          return <span className="text-xs text-[var(--text-muted)] italic">Unassigned</span>;
        }

        return (
          <div className="flex items-center gap-1.5 flex-wrap max-w-[200px]">
            {teams.slice(0, 2).map((t) => (
              <Badge key={t.id || t.name} variant="outline" className="text-[10px] bg-[var(--bg-subtle)] border-[var(--border-subtle)] font-medium truncate max-w-[120px]">
                <Users className="w-2.5 h-2.5 mr-1 text-[var(--warning)]" />
                {t.name}
              </Badge>
            ))}
            {teams.length > 2 && (
              <span className="text-[10px] text-[var(--text-muted)] font-mono font-medium pl-0.5">
                +{teams.length - 2} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'workload',
      header: 'Active Tasks',
      cell: ({ row }) => {
        const member = row.original;
        const tasks = memberTasksMap[member.userId] || [];

        return (
          <div className="inline-flex items-center gap-1.5 bg-[var(--bg-subtle)] px-2.5 py-1 rounded-full border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)]">
            <FolderKanban className={cn("w-3.5 h-3.5", tasks.length > 0 ? "text-[var(--accent)]" : "text-[var(--text-muted)]")} />
            <span>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Governance',
      cell: ({ row }) => {
        const member = row.original;
        const currentRole = roles.find((r) => r.name === member.orgRole);
        const isSelf = member.userId === currentUserId;
        const isLastAdmin = adminCount <= 1 && member.rolePriority === 0;

        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {(canManageRoles || canRemoveMembers) ? (
              <>
                {canManageRoles && (
                  <Select
                    value={currentRole?.id?.toString() ?? ''}
                    onValueChange={(val) => onUpdateRole && onUpdateRole(member.userId, parseInt(val, 10))}
                    disabled={isSelf || isLastAdmin}
                  >
                    <SelectTrigger className="w-[115px] h-7 text-[11px] font-medium bg-[var(--bg-elevated)]">
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
    },
  ], [members, selectedIds, isAllSelected, isIndeterminate, memberTeamsMap, memberTasksMap, roles, canManageRoles, canRemoveMembers, currentUserId, adminCount, onToggleAll, onToggleSelect, onUpdateRole, onRemoveMember]);

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={members}
        isLoading={isLoading}
        emptyStateTitle="No organization members found"
        emptyStateDescription="Try adjusting your search query or role filters."
        onRowClick={(member) => onSelectMember && onSelectMember(member)}
      />
    </div>
  );
}
