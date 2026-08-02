import React, { useState } from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { OrganizationIdentity } from './OrganizationIdentity';
import { usePermissions } from '@/identity';
import { InviteMemberModal } from '../Invites/InviteMemberModal';
import { CreateTeamModal } from '../Teams/CreateTeamModal';
import { Link, useNavigate } from 'react-router-dom';

export function OrganizationOverview({ org, counts }) {
  const { can } = usePermissions();
  const navigate = useNavigate();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);

  const canInvite = can('MEMBER_INVITE') || can('SUPER_ADMIN');
  const canCreateTeam = can('TEAM_CREATE') || can('SUPER_ADMIN');
  const canManageRoles = can('ROLE_CREATE') || can('SUPER_ADMIN');
  const canCreateProject = can('PROJECT_CREATE') || can('SUPER_ADMIN');

  const atRiskGoals = (counts.goalsData || []).filter(g => g.status === 'AT_RISK' || g.status === 'OFF_TRACK');
  const pendingLeaveList = counts.leaveRequests ? counts.leaveRequests.filter(r => r.status === 'PENDING') : [];

  const attentionItems = [
    ...pendingLeaveList.map(l => ({
      type: 'leave',
      title: `${l.user?.fullName || 'A member'} requested leave`,
      description: l.reason?.slice(0, 80) + (l.reason?.length > 80 ? '...' : ''),
      actionLabel: 'Review',
      icon: Icons.doorOpen,
      onClick: () => navigate(`/app/organizations/${org.id}/leave`),
      color: 'var(--danger)',
      bg: 'var(--danger-soft)',
      border: 'var(--danger-border)'
    })),
    ...atRiskGoals.map(g => ({
      type: 'goal',
      title: `Goal off-track: ${g.title}`,
      description: `Progress at ${g.progress}%`,
      actionLabel: 'Open',
      icon: Icons.target,
      onClick: () => navigate(`/app/organizations/${org.id}/goals`),
      color: 'var(--warning)',
      bg: 'var(--warning-soft)',
      border: 'var(--warning-border)'
    }))
  ];
  
  // We can add invites here later when the backend supports pending invites listing

  return (
    <div className="space-y-10">
      
      {/* ── Organization Health ───────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <Heading level={5} className="text-[var(--text-primary)] text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Needs Attention</Heading>
          <div className="px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-elevated)]">
            {attentionItems.length} items
          </div>
        </div>
        
        {attentionItems.length === 0 && counts.pendingInvites === 0 ? (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] border-dashed rounded-[var(--radius-md)] p-6 flex flex-col items-center justify-center text-center">
            <Icons.checkCircle className="w-8 h-8 text-[var(--success)] mb-2" />
            <Text size="sm" className="font-medium text-[var(--text-primary)]">All clear!</Text>
            <Text size="xs" variant="muted">No administrative actions required at this time.</Text>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {counts.pendingInvites > 0 && (
               <div className="flex items-center gap-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-3 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer" onClick={() => navigate(`/app/organizations/${org.id}/invites`)}>
                  <div className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--warning-soft)', border: '1px solid var(--warning-border)' }}>
                    <Icons.mail className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text size="xs" className="font-medium truncate">{counts.pendingInvites} Pending Invites</Text>
                    <Text size="xs" variant="muted" className="truncate text-[10px]">Users invited to the organization have not yet accepted.</Text>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs h-7 px-2 shrink-0">
                    Manage <Icons.chevronRight className="w-3 h-3 ml-1" />
                  </Button>
               </div>
            )}
            
            {attentionItems.slice(0, 6).map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-3 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer" onClick={item.onClick}>
                  <div className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0" style={{ backgroundColor: item.bg, border: `1px solid ${item.border}` }}>
                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text size="xs" className="font-medium truncate">{item.title}</Text>
                    <Text size="xs" variant="muted" className="truncate text-[10px]">{item.description}</Text>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs h-7 px-2 shrink-0">
                    {item.actionLabel} <Icons.chevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Organization Statistics ───────────────────────── */}
      <section>
        <Heading level={5} className="text-[var(--text-primary)] text-sm font-semibold mb-3 uppercase tracking-wider text-[var(--text-muted)]">Organization Statistics</Heading>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-4 flex flex-col justify-between hover:border-[var(--accent-border)] transition-colors cursor-pointer" onClick={() => navigate(`/app/organizations/${org.id}/members`)}>
            <div className="flex items-center gap-2 mb-1">
              <Icons.users className="w-4 h-4 text-[var(--text-muted)]" />
              <Text size="xs" variant="muted" className="font-medium">Members</Text>
            </div>
            {counts.isLoading ? (
              <div className="h-8 w-12 bg-[var(--bg-hover)] animate-pulse rounded mt-2"></div>
            ) : (
              <span className="text-2xl font-bold text-[var(--text-primary)] mt-2">{counts.members}</span>
            )}
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-4 flex flex-col justify-between hover:border-[var(--accent-border)] transition-colors cursor-pointer" onClick={() => navigate(`/app/organizations/${org.id}/teams`)}>
            <div className="flex items-center gap-2 mb-1">
              <Icons.workspace className="w-4 h-4 text-[var(--text-muted)]" />
              <Text size="xs" variant="muted" className="font-medium">Teams</Text>
            </div>
            {counts.isLoading ? (
              <div className="h-8 w-12 bg-[var(--bg-hover)] animate-pulse rounded mt-2"></div>
            ) : (
              <span className="text-2xl font-bold text-[var(--text-primary)] mt-2">{counts.teams}</span>
            )}
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-1">
              <Icons.folderClosed className="w-4 h-4 text-[var(--text-muted)]" />
              <Text size="xs" variant="muted" className="font-medium">Projects</Text>
            </div>
            {counts.isLoading ? (
              <div className="h-8 w-12 bg-[var(--bg-hover)] animate-pulse rounded mt-2"></div>
            ) : (
              <span className="text-2xl font-bold text-[var(--text-primary)] mt-2">{counts.projects}</span>
            )}
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-1">
              <Icons.checkSquare className="w-4 h-4 text-[var(--text-muted)]" />
              <Text size="xs" variant="muted" className="font-medium">Active Tasks</Text>
            </div>
            {counts.isLoading ? (
              <div className="h-8 w-12 bg-[var(--bg-hover)] animate-pulse rounded mt-2"></div>
            ) : (
              <span className="text-2xl font-bold text-[var(--text-primary)] mt-2">{counts.tasks}</span>
            )}
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-4 flex flex-col justify-between hover:border-[var(--accent-border)] transition-colors cursor-pointer" onClick={() => navigate(`/app/organizations/${org.id}/goals`)}>
            <div className="flex items-center gap-2 mb-1">
              <Icons.target className="w-4 h-4 text-[var(--text-muted)]" />
              <Text size="xs" variant="muted" className="font-medium">Goals</Text>
            </div>
            {counts.isLoading ? (
              <div className="h-8 w-12 bg-[var(--bg-hover)] animate-pulse rounded mt-2"></div>
            ) : (
              <span className="text-2xl font-bold text-[var(--text-primary)] mt-2">{counts.goals}</span>
            )}
          </div>
        </div>
      </section>

      {/* ── Quick Actions ───────────────────────── */}
      <section>
        <Heading level={5} className="text-[var(--text-primary)] text-sm font-semibold mb-3 uppercase tracking-wider text-[var(--text-muted)]">Quick Actions</Heading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {canInvite && (
            <Button variant="outline" className="w-full justify-start h-12" onClick={() => setInviteModalOpen(true)}>
              <div className="w-6 h-6 rounded-full bg-[var(--accent-soft)] flex items-center justify-center mr-3 shrink-0">
                <Icons.userPlus className="w-3.5 h-3.5 text-[var(--accent)]" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-semibold">Invite Member</span>
                <span className="text-[10px] text-[var(--text-tertiary)]">Add to organization</span>
              </div>
            </Button>
          )}

          {canManageRoles && (
            <Button variant="outline" className="w-full justify-start h-12" asChild>
              <Link to={`/app/organizations/${org.id}/roles`}>
                <div className="w-6 h-6 rounded-full bg-[var(--warning-soft)] flex items-center justify-center mr-3 shrink-0">
                  <Icons.shield className="w-3.5 h-3.5 text-[var(--warning)]" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-semibold">Manage Roles</span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">Configure access</span>
                </div>
              </Link>
            </Button>
          )}

          {canCreateTeam && (
            <Button variant="outline" className="w-full justify-start h-12" onClick={() => setCreateTeamModalOpen(true)}>
              <div className="w-6 h-6 rounded-full bg-[var(--success-soft)] flex items-center justify-center mr-3 shrink-0">
                <Icons.workspace className="w-3.5 h-3.5 text-[var(--success)]" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-semibold">Create Team</span>
                <span className="text-[10px] text-[var(--text-tertiary)]">Group members</span>
              </div>
            </Button>
          )}

          {canCreateProject && (
            <Button variant="outline" className="w-full justify-start h-12" asChild>
              <Link to={`/app/projects/new?orgId=${org.id}`}>
                <div className="w-6 h-6 rounded-full bg-[var(--info-soft)] flex items-center justify-center mr-3 shrink-0">
                  <Icons.folderPlus className="w-3.5 h-3.5 text-[var(--info)]" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-semibold">Create Project</span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">New workspace</span>
                </div>
              </Link>
            </Button>
          )}
        </div>
      </section>

      <hr className="border-[var(--border-subtle)]" />

      {/* ── Organization Identity ───────────────────────── */}
      <section>
        <OrganizationIdentity org={org} />
      </section>

      {/* Modals */}
      <InviteMemberModal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)} orgId={org.id} />
      <CreateTeamModal isOpen={createTeamModalOpen} onClose={() => setCreateTeamModalOpen(false)} orgId={org.id} />
    </div>
  );
}
