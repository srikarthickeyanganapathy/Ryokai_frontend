import React, { useState, useMemo, useEffect } from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { FilterTabs } from '@/shared/ui/FilterTabs';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/shared/ui/Modal';
import { useInviteMember, useOrgRoles, useCreateInviteLink } from '@/organization';
import { usePermissions } from '@/identity';
import { Label } from '@/shared/ui/Typography/Label';
import { Icons } from '@/shared/ui/Icons';
import { toast } from 'sonner';

const EMPTY_ROLES = [];

export function InviteMemberModal({ isOpen, onClose, orgId }) {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'link'
  const [username, setUsername] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  
  const { data: rawRoles, isLoading: rolesLoading } = useOrgRoles(orgId);
  const roles = rawRoles ?? EMPTY_ROLES;

  const inviteMutation = useInviteMember(orgId);
  const linkMutation = useCreateInviteLink(orgId);
  
  const { myMembership, isSuperAdmin } = usePermissions();

  const assignableRoles = useMemo(() => {
    if (!roles || roles.length === 0) return EMPTY_ROLES;
    const myPriority = myMembership?.rolePriority ?? 999;
    
    return roles.filter(r => {
      if (r.name === 'ADMIN') return false; // Admin cannot be assigned via invite
      if (isSuperAdmin) return true;
      return (r.priority ?? 999) >= myPriority;
    });
  }, [roles, myMembership?.rolePriority, isSuperAdmin]);

  // Derive default role from available roles for auto-selection
  const defaultRoleId = useMemo(() => {
    if (assignableRoles.length === 0) return '';
    const employeeRole = assignableRoles.find(r => r.name === 'EMPLOYEE') || assignableRoles[0];
    return employeeRole ? employeeRole.id.toString() : '';
  }, [assignableRoles]);

  // User-selected role; resets when modal opens/closes
  const [userSelectedRole, setUserSelectedRole] = useState('');
  const effectiveRoleId = userSelectedRole || defaultRoleId;

  // Reset user selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUserSelectedRole('');
    }
  }, [isOpen]);

  const handleSubmitDirect = (e) => {
    e.preventDefault();
    if (!username || !effectiveRoleId) return;
    inviteMutation.mutate({ username, roleId: effectiveRoleId }, {
      onSuccess: () => {
        setUsername('');
        onClose();
      }
    });
  };

  const handleGenerateLink = () => {
    if (!effectiveRoleId) return;
    linkMutation.mutate(effectiveRoleId, {
      onSuccess: (data) => {
        const inviteToken = data?.token || data?.inviteToken || data;
        const link = data?.link || `${window.location.origin}/invite/accept/${inviteToken}`;
        setGeneratedLink(link);
      }
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success('Link copied to clipboard');
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setGeneratedLink('');
        setUsername('');
        onClose();
      }
    }}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <ModalTitle>Invite member</ModalTitle>
        </ModalHeader>

        <div className="mt-4">
          <FilterTabs
            filters={[
              { value: 'direct', label: 'Direct Invite' },
              { value: 'link', label: 'Shareable Link' },
            ]}
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val);
              if (val === 'link') setGeneratedLink('');
            }}
            className="w-full [&>button]:flex-1"
          />
        </div>

        <div className="space-y-4 mt-6">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[var(--text-secondary)]">Role for new member</Label>
            <Select
              value={effectiveRoleId}
              onValueChange={(val) => {
                setUserSelectedRole(val);
                setGeneratedLink('');
              }}
              disabled={rolesLoading || assignableRoles.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select a role"} />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map(role => (
                  <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeTab === 'direct' ? (
            <form onSubmit={handleSubmitDirect} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[var(--text-secondary)]">Username or Email</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username or email"
                  autoFocus
                />
              </div>

              <ModalFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={inviteMutation.isPending || !username || !effectiveRoleId}>
                  {inviteMutation.isPending ? 'Inviting...' : 'Send Invite'}
                </Button>
              </ModalFooter>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-[var(--text-secondary)]">Invite Link</Label>
                {generatedLink ? (
                  <div className="flex items-center gap-2">
                    <Input value={generatedLink} readOnly className="font-mono text-sm" />
                    <Button type="button" variant="outline" onClick={copyLink}>
                      <Icons.copy className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-lg p-4 text-center">
                    Generate a secure link to allow anyone with the link to join as <strong>{assignableRoles.find(r => r.id.toString() === effectiveRoleId)?.name || 'a member'}</strong>.
                  </div>
                )}
              </div>

              <ModalFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Close
                </Button>
                <Button 
                  type="button" 
                  variant="primary" 
                  onClick={handleGenerateLink}
                  disabled={linkMutation.isPending || !effectiveRoleId}
                >
                  {linkMutation.isPending ? 'Generating...' : generatedLink ? 'Generate New Link' : 'Generate Link'}
                </Button>
              </ModalFooter>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}