import React, { useState } from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { AdminLeaveModal } from '../Members/AdminLeaveModal';
import { MemberExitModal } from '../Members/MemberExitModal';

export function DangerZone({ orgId, members, isOrgAdmin }) {
  const [adminModalState, setAdminModalState] = useState({ isOpen: false, mode: 'transfer' });
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Heading level={4} className="text-base font-semibold text-[var(--text-primary)] mb-1">
          Danger Zone
        </Heading>
        <Text size="sm" variant="muted">
          Manage critical membership changes and irreversible organizational actions.
        </Text>
      </div>

      <div className="space-y-4">
        {isOrgAdmin ? (
          <>
            {/* Transfer Ownership Card for Admin */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-5 transition-colors duration-200 hover:border-[var(--border-default)]">
              <div className="space-y-1 max-w-lg">
                <Text className="font-medium text-[var(--text-primary)] text-sm">
                  Transfer Ownership
                </Text>
                <Text size="xs" variant="muted" className="leading-relaxed">
                  Transfer full administrative control of this organization to another active member. You will remain as a standard member.
                </Text>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdminModalState({ isOpen: true, mode: 'transfer' })}
                className="shrink-0 font-medium"
              >
                Transfer Ownership
              </Button>
            </div>

            {/* Dissolve Organization Card for Admin */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-5 transition-colors duration-200 hover:border-red-500/40">
              <div className="space-y-1 max-w-lg">
                <Text className="font-medium text-[var(--text-primary)] text-sm">
                  Dissolve Organization
                </Text>
                <Text size="xs" variant="muted" className="leading-relaxed">
                  Permanently delete this organization, along with all associated teams, projects, workflows, and task records. This action cannot be undone.
                </Text>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdminModalState({ isOpen: true, mode: 'dissolve' })}
                className="shrink-0 font-medium text-red-500 hover:text-red-600 hover:border-red-500/50 hover:bg-red-500/5"
              >
                Dissolve Organization
              </Button>
            </div>
          </>
        ) : (
          /* Exit Organization Card for Non-Admin Members */
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-5 transition-colors duration-200 hover:border-red-500/40">
            <div className="space-y-1 max-w-lg">
              <Text className="font-medium text-[var(--text-primary)] text-sm">
                Exit Organization
              </Text>
              <Text size="xs" variant="muted" className="leading-relaxed">
                Submit a formal request to relinquish your membership and depart from this organization. Once approved, new tasks cannot be assigned to you.
              </Text>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExitModalOpen(true)}
              className="shrink-0 font-medium text-red-500 hover:text-red-600 hover:border-red-500/50 hover:bg-red-500/5"
            >
              Request Exit
            </Button>
          </div>
        )}
      </div>

      <AdminLeaveModal
        isOpen={adminModalState.isOpen}
        initialMode={adminModalState.mode}
        onClose={() => setAdminModalState({ isOpen: false, mode: 'transfer' })}
        orgId={orgId}
        members={members}
      />

      <MemberExitModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        orgId={orgId}
      />
    </div>
  );
}
