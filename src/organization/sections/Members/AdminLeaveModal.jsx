import React, { useState, useEffect } from 'react';
import { Text } from '@/shared/ui/Typography';
import { Label } from '@/shared/ui/Typography/Label';
import { Button } from '@/shared/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/shared/ui/Modal';
import { useAdminLeave } from '@/organization';
import { useAuth } from '@/identity';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';

export function AdminLeaveModal({ isOpen, onClose, orgId, members = [], initialMode = null }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const adminLeaveMutation = useAdminLeave(orgId);
  
  // Filter out the current admin from the successor candidates list
  const otherMembers = members.filter(m => m.userId !== user?.id);
  const isAlone = otherMembers.length === 0;

  const [mode, setMode] = useState(initialMode || (isAlone ? 'dissolve' : 'transfer'));
  const [successorUserId, setSuccessorUserId] = useState('');

  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        setMode(initialMode || (isAlone ? 'dissolve' : 'transfer'));
        setSuccessorUserId('');
      });
    }
  }, [isOpen, isAlone, initialMode]);

  const handleConfirm = () => {
    const isDissolving = mode === 'dissolve';
    const payload = {
      successorUserId: isDissolving ? null : Number(successorUserId),
      dissolve: isDissolving
    };

    if (!isDissolving && !successorUserId) return;

    adminLeaveMutation.mutate(payload, {
      onSuccess: () => {
        onClose();
        navigate('/app');
      }
    });
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6">
        <ModalHeader className="pb-2">
          <ModalTitle className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            {mode === 'transfer' ? (
              <>
                <UserCheck className="w-5 h-5 text-[var(--text-primary)]" />
                Transfer Ownership & Exit
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5 text-red-500" />
                Dissolve & Exit Organization
              </>
            )}
          </ModalTitle>
        </ModalHeader>

        <div className="space-y-5 mt-3">
          {isAlone ? (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wide">
                <ShieldAlert className="w-4 h-4" /> Sole Administrator Notice
              </div>
              <Text className="text-xs text-[var(--text-secondary)] leading-relaxed">
                You are the only surviving member in this organization. Exiting will automatically dissolve the workspace and permanently erase all associated projects and tasks.
              </Text>
            </div>
          ) : (
            <div className="space-y-4">
              <Text className="text-xs text-[var(--text-muted)] leading-relaxed">
                Choose how to resolve your administrative authority before departing from this organization:
              </Text>
              
              {/* Clean semantic card grid - No wrapping inside <Button> to prevent layout/text collapse */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setMode('transfer')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between h-auto ${
                    mode === 'transfer'
                      ? 'border-[var(--text-primary)] bg-[var(--bg-subtle)] shadow-sm'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] opacity-70 hover:opacity-100 hover:border-[var(--border-default)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`block font-medium text-sm ${mode === 'transfer' ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)]'}`}>
                      Transfer Admin Role
                    </span>
                    <UserCheck className={`w-4 h-4 mt-0.5 shrink-0 ${mode === 'transfer' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`} />
                  </div>
                  <span className="block text-xs text-[var(--text-muted)] leading-normal mt-2">
                    Pass ownership to another existing member and relinquish privileges.
                  </span>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setMode('dissolve')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between h-auto ${
                    mode === 'dissolve'
                      ? 'border-red-500/60 bg-red-500/5 shadow-sm'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] opacity-70 hover:opacity-100 hover:border-[var(--border-default)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`block font-medium text-sm ${mode === 'dissolve' ? 'text-red-500 font-semibold' : 'text-[var(--text-secondary)]'}`}>
                      Dissolve Workspace
                    </span>
                    <Trash2 className={`w-4 h-4 mt-0.5 shrink-0 ${mode === 'dissolve' ? 'text-red-500' : 'text-[var(--text-muted)]'}`} />
                  </div>
                  <span className="block text-xs text-[var(--text-muted)] leading-normal mt-2">
                    Remove all members and permanently wipe organization data.
                  </span>
                </div>
              </div>

              {mode === 'transfer' ? (
                <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                  <Label className="block text-xs font-medium text-[var(--text-secondary)]">
                    Select Successor Administrator
                  </Label>
                  <Select
                    value={successorUserId}
                    onValueChange={setSuccessorUserId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a teammate to assume leadership..." />
                    </SelectTrigger>
                    <SelectContent>
                      {otherMembers.map(m => (
                        <SelectItem key={m.userId} value={m.userId.toString()}>
                          {m.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Text size="xs" variant="muted" className="block pt-1">
                    The designated member will inherit full administrative rights immediately upon your departure.
                  </Text>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 mt-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-wide">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Irreversible Action Warning
                  </div>
                  <Text className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    All currently active team members will lose workspace access immediately. All teams, tasks, milestones, and project files under this organization will be permanently deleted from the system.
                  </Text>
                </div>
              )}
            </div>
          )}

          <ModalFooter className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === 'dissolve' ? 'danger' : 'primary'}
              onClick={handleConfirm}
              disabled={adminLeaveMutation.isPending || (mode === 'transfer' && !successorUserId)}
              className={mode === 'dissolve' ? 'bg-red-500 text-white hover:bg-red-600 font-medium px-4' : 'bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 font-medium px-4'}
            >
              {adminLeaveMutation.isPending
                ? 'Processing...'
                : mode === 'dissolve'
                ? 'Confirm & Dissolve'
                : 'Confirm Transfer & Exit'}
            </Button>
          </ModalFooter>
        </div>
      </ModalContent>
    </Modal>
  );
}