import React, { useState } from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { AdminLeaveModal } from '../Members/AdminLeaveModal';

export function DangerZone({ orgId, members, isOrgAdmin }) {
  const [adminModalState, setAdminModalState] = useState({ isOpen: false, mode: 'transfer' });

  if (!isOrgAdmin) return null;

  return (
    <div className="space-y-6">
      <div>
        <Heading level={4} className="text-[var(--danger)] text-base font-semibold mb-1">Danger Zone</Heading>
        <Text size="sm" variant="muted" className="leading-relaxed">
          Irreversible and critical administrative actions. Use with extreme caution.
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Transfer Ownership */}
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-5 flex flex-col justify-between gap-4 transition-colors hover:border-[var(--warning-border)]">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Text className="font-semibold text-[var(--text-primary)]">Transfer Ownership</Text>
              <div className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning-border)]">HIGH RISK</div>
            </div>
            <Text size="sm" variant="muted">
              Hand over ADMIN role to another member. You will be demoted to DIRECTOR.
            </Text>
            <div className="mt-3 p-2 bg-[var(--bg-subtle)] rounded text-xs text-[var(--text-muted)] border border-[var(--border-subtle)]">
              <span className="font-semibold">Impact:</span> Role change + task reassignment. <span className="font-semibold ml-2">Recovery:</span> Another transfer.
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setAdminModalState({ isOpen: true, mode: 'transfer' })} className="shrink-0 self-start">
            <Icons.userCheck className="w-4 h-4 mr-2" />
            Transfer Ownership
          </Button>
        </div>

        {/* Delete Organization */}
        <div className="bg-[var(--danger-soft)] border border-[var(--danger-border)] rounded-[var(--radius-lg)] p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Text className="font-semibold text-[var(--danger)]">Delete Organization</Text>
              <div className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950 text-red-400 border border-red-900">CRITICAL RISK</div>
            </div>
            <Text size="sm" className="text-[var(--danger)]/80">
              Permanently dissolve the organization. All data, teams, projects, and tasks will be destroyed. This cannot be undone.
            </Text>
            <div className="mt-3 p-2 bg-red-950/20 rounded text-xs text-[var(--danger)]/90 border border-red-900/30">
              <span className="font-semibold">Impact:</span> Full data deletion. <span className="font-semibold ml-2">Recovery:</span> None.
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => setAdminModalState({ isOpen: true, mode: 'dissolve' })} className="shrink-0 self-start">
            <Icons.trash2 className="w-4 h-4 mr-2" />
            Dissolve Organization
          </Button>
        </div>
      </div>

      <AdminLeaveModal
        isOpen={adminModalState.isOpen}
        initialMode={adminModalState.mode}
        onClose={() => setAdminModalState({ isOpen: false, mode: 'transfer' })}
        orgId={orgId}
        members={members}
      />
    </div>
  );
}
