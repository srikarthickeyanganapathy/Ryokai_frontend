import React from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { Icons } from '@/shared/ui/Icons';
import { Link } from 'react-router-dom';

export function OrganizationAdministrationHub({ orgId, counts }) {
  const adminModules = [
    {
      title: 'Members',
      description: 'Manage users and roles',
      icon: Icons.users,
      count: counts.members,
      countLabel: 'Members',
      link: `/app/organizations/${orgId}/members`,
      color: 'var(--accent)'
    },
    {
      title: 'Teams',
      description: 'Group users into functional teams',
      icon: Icons.workspace,
      count: counts.teams,
      countLabel: 'Teams',
      link: `/app/organizations/${orgId}/teams`,
      color: 'var(--success)'
    },
    {
      title: 'Roles & Permissions',
      description: 'Configure RBAC and access policies',
      icon: Icons.shield,
      count: null, // Could fetch role count later
      countLabel: 'Configuration',
      link: `/app/organizations/${orgId}/roles`,
      color: 'var(--warning)'
    },
    {
      title: 'Invitations',
      description: 'Pending outbound invites',
      icon: Icons.mail,
      count: counts.pendingInvites,
      countLabel: 'Pending',
      link: `/app/organizations/${orgId}/invites`,
      color: 'var(--info)'
    },
    {
      title: 'Announcements',
      description: 'Broadcast messages to the org',
      icon: Icons.bell,
      count: null,
      countLabel: 'Broadcasts',
      link: `/app/organizations/${orgId}/announcements`,
      color: 'var(--danger)'
    },
    {
      title: 'Requests Inbox',
      description: 'Review workforce leave & member exits',
      icon: Icons.doorOpen,
      count: counts.pendingLeave,
      countLabel: 'Requests',
      link: `/app/organizations/${orgId}/leave`,
      color: 'var(--text-primary)'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <Heading level={4} className="text-[var(--text-primary)] text-base font-semibold mb-1">Administration Hub</Heading>
        <Text size="sm" variant="muted" className="leading-relaxed">
          Manage the core operational elements and governance of the organization.
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminModules.map((mod, idx) => (
          <Link
            key={idx}
            to={mod.link}
            className="group flex flex-col justify-between bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 hover:border-[var(--accent-border)] hover:bg-[var(--bg-hover)] transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center bg-[var(--bg-subtle)] group-hover:bg-white/5 transition-colors">
                  <mod.icon className="w-5 h-5" style={{ color: mod.color }} />
                </div>
                <div>
                  <Text className="font-semibold text-sm">{mod.title}</Text>
                  <Text size="xs" variant="muted">{mod.description}</Text>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
              {mod.count !== null && mod.count !== undefined ? (
                <Text size="xs" className="font-medium text-[var(--text-secondary)]">
                  <span className="text-[var(--text-primary)] font-bold mr-1">{mod.count}</span> {mod.countLabel}
                </Text>
              ) : (
                <Text size="xs" className="font-medium text-[var(--text-secondary)]">
                  {mod.countLabel}
                </Text>
              )}
              <div className="flex items-center text-[var(--accent)] text-xs font-semibold group-hover:translate-x-1 transition-transform">
                Manage <Icons.chevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
