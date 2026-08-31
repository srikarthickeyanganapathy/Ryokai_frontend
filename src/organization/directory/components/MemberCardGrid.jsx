import React from 'react';
import { EntityCard } from '@/shared/ui/entity-card';
import { Checkbox } from '@/shared/ui/Checkbox';
import { IconButton } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import { Clock, Users, FolderKanban, Shield } from '@/shared/ui/Icons';
import { hashHue, formatLastActive, hasRecentActivity } from './directoryUtils';

// --- Sub-component: Enhanced Member Card Grid ---

export function MemberCardGrid({
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

      <div className="ec-grid">
        {membersList.map((member) => {
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
            <EntityCard
              key={member.userId}
              type="member"
              name={member.username + (isSelf ? '  (You)' : '')}
              tagline={member.email || 'No email provided'}
              selected={isSelected}
              disabled={isSuspended}
              onClick={() => onSelectMember(member)}
              glyph={
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm"
                    style={{ background: `linear-gradient(135deg, hsl(${hue} 60% 46%), hsl(${(hue + 45) % 360} 65% 36%))` }}
                  >
                    {member.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  {isActiveNow && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[var(--success)] border-2 border-[var(--bg-elevated)] rounded-full" title="Active in last 24h">
                      <span className="absolute inset-0 rounded-full bg-[var(--success)] animate-ping opacity-75" />
                    </div>
                  )}
                  {isSuspended && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[var(--danger)] border-2 border-[var(--bg-elevated)] rounded-full" title="Suspended" />
                  )}
                </div>
              }
              badges={[
                <span key="role" className="ec-badge ec-badge--ghost">{member.orgRole}</span>,
                ...(isSuspended ? [<span key="susp" className="ec-badge ec-badge--rose">Suspended</span>] : []),
              ]}
              actions={
                <div className="ec-actions" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => !disabledSelect && onToggleSelect(member.userId)}
                    disabled={disabledSelect}
                    aria-label={`Select ${member.username}`}
                  />
                </div>
              }
              meta={[
                { icon: <Clock style={{ width: 11, height: 11 }} />, text: lastActive ? `Active ${lastActive}` : 'No recent activity' },
                { icon: <Users style={{ width: 11, height: 11 }} />, text: teams.length > 0 ? teams.slice(0, 2).map(t => t.name).join(', ') + (teams.length > 2 ? ` +${teams.length - 2}` : '') : 'No team assigned' },
                { icon: <FolderKanban style={{ width: 11, height: 11 }} />, text: `${tasks.length} ${tasks.length === 1 ? 'Task' : 'Tasks'}` },
              ]}
              progress={maxWorkload > 0 ? Math.round((tasks.length / maxWorkload) * 100) : 0}
              progressLabel={`Workload   avg ${avgTasksPerMember > 0 ? avgTasksPerMember : '--'}`}
              footer={
                <div className="ec-card-foot">
                  <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-medium">
                    <Shield className="h-3 w-3 text-[var(--accent)]" />
                    <span>Rank #{member.rolePriority ?? 'N/A'}</span>
                  </span>
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
              }
            />
          );
        })}
      </div>
    </div>
  );
}
