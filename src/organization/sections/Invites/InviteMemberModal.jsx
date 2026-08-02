import React, { useState, useMemo, useEffect } from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/shared/ui/Modal';
import { useInviteMember, useOrgRoles, useCreateInviteLink } from '@/organization';
import { usePermissions } from '@/identity';
import { Label } from '@/shared/ui/Typography/Label';
import { Icons } from '@/shared/ui/Icons';
import { toast } from 'sonner';

export function InviteMemberModal({ isOpen, onClose, orgId }) {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'link'
  const [username, setUsername] = useState('');
  const [roleId, setRoleId] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  
  const { data: roles = [], isLoading: rolesLoading } = useOrgRoles(orgId);
  const inviteMutation = useInviteMember(orgId);
  const linkMutation = useCreateInviteLink(orgId);
  
  const { myMembership, isSuperAdmin } = usePermissions();

  const assignableRoles = useMemo(() => {
    if (!roles) return [];
    const myPriority = myMembership?.rolePriority ?? 999;
    
    return roles.filter(r => {
      if (r.name === 'ADMIN') return false; // Admin cannot be assigned via invite
      if (isSuperAdmin) return true;
      return (r.priority ?? 999) >= myPriority;
    });
  }, [roles, myMembership?.rolePriority, isSuperAdmin]);

  // Set default role when roles load
  useEffect(() => {
    if (assignableRoles.length > 0 && !roleId) {
      const employeeRole = assignableRoles.find(r => r.name === 'EMPLOYEE') || assignableRoles[0];
      setRoleId(employeeRole.id.toString());
    } else if (assignableRoles.length > 0 && roleId) {
      // If currently selected role is no longer assignable, reset it
      if (!assignableRoles.find(r => r.id.toString() === roleId)) {
        const employeeRole = assignableRoles.find(r => r.name === 'EMPLOYEE') || assignableRoles[0];
        setRoleId(employeeRole.id.toString());
      }
    }
  }, [assignableRoles, roleId]);

  const handleSubmitDirect = (e) => {
    e.preventDefault();
    if (!username || !roleId) return;
    inviteMutation.mutate({ username, roleId }, {
      onSuccess: () => {
        setUsername('');
        onClose();
      }
    });
  };

  const handleGenerateLink = () => {
    if (!roleId) return;
    linkMutation.mutate(roleId, {
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
      }
      onClose(open);
    }}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <ModalTitle>Invite member</ModalTitle>
        </ModalHeader>

        <div className="flex bg-[var(--bg-muted)] p-1 rounded-lg mt-4">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
              activeTab === 'direct'
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            Direct Invite
          </button>
          <button
            onClick={() => { setActiveTab('link'); setGeneratedLink(''); }}
            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
              activeTab === 'link'
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            Shareable Link
          </button>
        </div>

        <div className="space-y-4 mt-6">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[var(--text-secondary)]">Role for new member</Label>
            <Select
              value={roleId}
              onValueChange={(val) => {
                setRoleId(val);
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
                <Button type="submit" variant="primary" disabled={inviteMutation.isPending || !username || !roleId}>
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
                    Generate a secure link to allow anyone with the link to join as <strong>{assignableRoles.find(r => r.id.toString() === roleId)?.name || 'a member'}</strong>.
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
                  disabled={linkMutation.isPending || !roleId}
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