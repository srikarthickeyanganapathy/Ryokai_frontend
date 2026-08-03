import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { PageHeader } from '@/shared/ui/PageHeader';
import {
  useOrgMembers,
  useUpdateMemberRole,
  useRemoveMember,
  useOrgRoles,
} from '../features/hooks/useOrganizations';
import { Heading, Text } from '@/shared/ui/Typography';
import { Mail, Shield, User as UserIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/Badge';
import { Button, IconButton } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import { usePermissions, useAuth } from '@/identity';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog';
import { InviteMemberModal } from '../sections/Invites/InviteMemberModal';
import {
  WorkspaceShell,
  ManagementLayout,
  PageStateContainer,
  ModularToolbar,
} from '@/shared/workspace-framework';
import { SearchPlugin } from '@/shared/workspace-framework/toolbar/plugins/SearchPlugin';

export function DirectoryPage() {
  const { activeOrganization } = useWorkspace();
  const orgId = activeOrganization?.id;
  const { user } = useAuth();
  
  const { data: members = [], isLoading } = useOrgMembers(orgId);
  const { data: roles = [] } = useOrgRoles(orgId);

  const [searchQuery, setSearchQuery] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const { canManageRoles, canInviteMembers, canRemoveMembers } = usePermissions();
  const updateRoleMutation = useUpdateMemberRole(orgId);
  const removeMemberMutation = useRemoveMember(orgId);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return members.filter((member) => {
      const nameMatch = member.username?.toLowerCase().includes(q);
      const roleMatch = member.orgRole?.toLowerCase().includes(q);
      return nameMatch || roleMatch;
    });
  }, [members, searchQuery]);

  if (!activeOrganization) return null;

  const pageState = isLoading ? 'loading' : 'ready';

  return (
    <WorkspaceShell maxWidth="default">
      <ManagementLayout
        header={
          <PageHeader
            eyebrow="People"
            meta={`${members.length} member${members.length !== 1 ? 's' : ''}`}
            title="Organization Directory"
            subtitle={`Member roster for ${activeOrganization.name}.`}
            actions={
              canInviteMembers ? (
                <Button
                  variant="primary"
                  onClick={() => setInviteModalOpen(true)}
                  className="shrink-0"
                >
                  <Icons.plus className="w-4 h-4 mr-1.5" />
                  Invite member
                </Button>
              ) : null
            }
          />
        }
        toolbar={
          <ModularToolbar
            left={
              <SearchPlugin
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search members..."
              />
            }
          />
        }
      >
        <PageStateContainer
          state={pageState}
          loadingConfig={{ variant: 'cards' }}
          emptyConfig={{
            icon: UserIcon,
            title: 'No members found',
            description: 'Try adjusting your search criteria',
          }}
        >
          {filteredMembers.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-[var(--bg-subtle)] border border-dashed border-[var(--border-subtle)] rounded-2xl">
              <UserIcon className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-4" />
              <Heading level={4} className="text-[var(--text-secondary)] mb-2">
                No members found
              </Heading>
              <Text variant="muted" className="text-sm">
                Try adjusting your search criteria
              </Text>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-3 bg-[var(--info-soft)]/40 border border-[var(--info-border)]/40 rounded-lg flex items-start gap-3">
                <Icons.info className="w-4 h-4 text-[var(--info)] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-medium text-[var(--info)]">Pending Invites & Suspensions</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Listing pending invites and suspended users requires the next backend release. Currently showing only active members.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredMembers.map((member, index) => {
                  const currentRole = roles.find(
                    (r) => r.name === member.orgRole
                  );
                  const isSelf = member.userId === user?.id;
                  const adminCount = members.filter(m => m.rolePriority === 0).length;
                  const isLastAdmin = adminCount <= 1 && member.rolePriority === 0;
                  const isSuspended = member.status === 'SUSPENDED';

                  return (
                    <motion.div
                      key={member.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.04, 0.3) }}
                      className="group relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-border)] rounded-xl p-4 sm:p-5 transition-colors duration-200 shadow-sm"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={cn(
                          "h-11 w-11 sm:h-12 sm:w-12 rounded-full border flex items-center justify-center flex-shrink-0 relative",
                          member.rolePriority === 0 ? "bg-[var(--danger-soft)] border-[var(--danger-border)] text-[var(--danger)]" :
                          member.rolePriority === 1 ? "bg-[var(--warning-soft)] border-[var(--warning-border)] text-[var(--warning)]" :
                          "bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent)]"
                        )}>
                          <span className="text-base sm:text-lg font-medium">
                            {member.username?.charAt(0).toUpperCase() || '?'}
                          </span>
                          {isSuspended && (
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[var(--danger)] border-2 border-[var(--bg-elevated)] rounded-full" title="Suspended"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <Heading
                              level={4}
                              className={cn("truncate text-[15px] font-medium", isSuspended ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]")}
                            >
                              {member.username}
                              {isSelf && <span className="ml-2 text-[10px] font-normal text-[var(--text-muted)]">(You)</span>}
                            </Heading>
                            <Badge
                              variant={
                                member.rolePriority === 0
                                  ? 'danger'
                                  : member.rolePriority === 1
                                  ? 'warning'
                                  : 'outline'
                              }
                              className="shrink-0 text-[10px] uppercase tracking-wider"
                            >
                              {member.orgRole}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] truncate">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">
                              {member.email || "No email provided"}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                              <Shield className="h-3 w-3" />
                              Priority {member.rolePriority ?? 'N/A'}
                            </div>

                            {(canManageRoles || canRemoveMembers) && (
                              <div className="flex items-center gap-2">
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
                                    <SelectTrigger className="w-[110px] h-7 text-[11px]">
                                      <SelectValue
                                        placeholder={
                                          member.orgRole || 'Role'
                                        }
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {roles.map((role) => (
                                        <SelectItem
                                          key={role.id}
                                          value={role.id.toString()}
                                        >
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
                                    onClick={async () => {
                                      if (
                                        await confirm({
                                          title: `Remove ${member.username}?`,
                                          danger: true,
                                        })
                                      ) {
                                        removeMemberMutation.mutate(
                                          member.userId
                                        );
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
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </PageStateContainer>
      </ManagementLayout>

      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        orgId={orgId}
      />
      {confirmDialog}
    </WorkspaceShell>
  );
}
