import React from 'react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription 
} from '@/shared/ui/Drawer';
import { Heading, Text } from '@/shared/ui/Typography';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { Icons } from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';
import { Mail, Shield, Users, CheckSquare, Trash2, ShieldAlert } from '@/shared/ui/Icons';

export function MemberDetailDrawer({ 
  isOpen, 
  onClose, 
  member, 
  roles = [], 
  memberTeams = [], 
  activeTaskCount = 0,
  canManageRoles,
  canRemoveMembers,
  onRoleChange,
  onRemoveMember,
  isUpdatingRole,
  isRemovingMember
}) {
  if (!member) return null;

  const currentRole = roles.find((r) => r.name === member.orgRole);
  const isSuspended = member.status === 'SUSPENDED';
  const isSelf = member.userId === member.currentUserId; // Assuming currentUserId is mapped or passed if needed

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent side="right" className="sm:max-w-md p-0 flex flex-col bg-[var(--bg-elevated)] border-l border-[var(--border-subtle)] shadow-xl">
        
        {/* Header Section */}
        <div className="relative p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/30">
          <div className="flex items-start gap-4">
            <div className={cn(
              "h-16 w-16 rounded-full border flex items-center justify-center flex-shrink-0 text-2xl font-bold",
              member.rolePriority === 0 ? "bg-[var(--danger-soft)] border-[var(--danger-border)] text-[var(--danger)]" :
              member.rolePriority === 1 ? "bg-[var(--warning-soft)] border-[var(--warning-border)] text-[var(--warning)]" :
              "bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent)]"
            )}>
              {member.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <Heading level={3} className="text-lg font-semibold text-[var(--text-primary)] truncate">
                  {member.username}
                </Heading>
                {isSuspended && (
                  <Badge variant="danger" className="text-[10px] uppercase">Suspended</Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{member.email || "No email provided"}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge 
                  variant={member.rolePriority === 0 ? 'danger' : member.rolePriority === 1 ? 'warning' : 'outline'} 
                  className="text-[10px] uppercase tracking-wider"
                >
                  {member.orgRole}
                </Badge>
                <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-mono">
                  <Shield className="h-3 w-3" /> Priority {member.rolePriority ?? 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)] rounded-lg p-3 text-center">
              <Users className="w-4 h-4 text-[var(--accent)] mx-auto mb-1" />
              <div className="text-lg font-bold text-[var(--text-primary)]">{memberTeams.length}</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Teams</div>
            </div>
            <div className="bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)] rounded-lg p-3 text-center">
              <CheckSquare className="w-4 h-4 text-[var(--warning)] mx-auto mb-1" />
              <div className="text-lg font-bold text-[var(--text-primary)]">{activeTaskCount}</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Active Tasks</div>
            </div>
            <div className="bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)] rounded-lg p-3 text-center">
              <Shield className="w-4 h-4 text-[var(--info)] mx-auto mb-1" />
              <div className="text-lg font-bold text-[var(--text-primary)]">{member.permissions?.length || 0}</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Permissions</div>
            </div>
          </div>

          {/* Team Affiliations */}
          <div className="space-y-3">
            <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Team Affiliations
            </Text>
            {memberTeams.length === 0 ? (
              <div className="text-xs text-[var(--text-muted)] italic p-3 border border-dashed border-[var(--border-subtle)] rounded-md text-center">
                Not assigned to any teams
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {memberTeams.map(team => (
                  <Badge key={team.id} variant="outline" className="px-3 py-1 text-xs bg-[var(--bg-card)]">
                    <Icons.users className="w-3 h-3 mr-1.5 text-[var(--accent)]" />
                    {team.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Permissions Breakdown */}
          <div className="space-y-3">
            <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Access & Permissions
            </Text>
            {member.permissions?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-3 bg-[var(--bg-subtle)]/30 rounded-md border border-[var(--border-subtle)]">
                {member.permissions.map(perm => (
                  <span key={perm} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    {perm.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[var(--text-muted)] italic p-3 border border-dashed border-[var(--border-subtle)] rounded-md text-center">
                No specific permissions assigned
              </div>
            )}
          </div>

        </div>

        {/* Governance Footer */}
        {(canManageRoles || canRemoveMembers) && (
          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-base)] flex items-center justify-between gap-3">
            {canManageRoles && (
              <div className="flex-1">
                <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1 block">
                  Change Role
                </label>
                <Select
                  value={currentRole?.id?.toString() ?? ''}
                  onValueChange={(val) => onRoleChange(member.userId, parseInt(val, 10))}
                  disabled={isUpdatingRole}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder={member.orgRole || 'Select Role'} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {canRemoveMembers && (
              <Button 
                variant="danger" 
                size="sm" 
                className="mt-5 h-8"
                onClick={() => onRemoveMember(member)}
                disabled={isRemovingMember}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
              </Button>
            )}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}