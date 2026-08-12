import React, { useState } from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/shared/ui/Modal';
import { Badge } from '@/shared/ui/Badge';
import { useRoles, useCreateRole, useDeleteRole, useUpdateRole } from '@/platform/admin/features/hooks/useAdmin';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Label } from '@/shared/ui/Typography/Label';

export function RolesTab() {
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  
  const [selectedRole, setSelectedRole] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const deleteRoleMutation = useDeleteRole();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const handleSelectRole = (role) => {
    setSelectedRole(role);
  };

  // Update selectedRole when roles data changes so the panel stays synced
  React.useEffect(() => {
    if (selectedRole && roles.length) {
      const updated = roles.find(r => r.id === selectedRole.id);
      if (updated && updated.name !== selectedRole.name) {
        setSelectedRole(updated);
      }
    }
  }, [roles, selectedRole]);

  const handleDeleteRole = async (roleId) => {
    const ok = await confirm({
      title: 'Delete this role?',
      description: 'This permanently removes the role and unassigns it from any members who hold it. This can\'t be undone.',
      confirmLabel: 'Delete role',
      danger: true,
    });
    if (ok) {
      deleteRoleMutation.mutate(roleId, {
        onSuccess: () => {
          if (selectedRole?.id === roleId) {
            setSelectedRole(null);
          }
        }
      });
    }
  };

  if (rolesLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 mt-6 h-full">
        <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-[var(--color-border-subtle)] lg:pr-6 pb-6 lg:pb-0">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-20 w-full mb-2" />
          <Skeleton className="h-20 w-full mb-2" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-6 h-full min-h-[500px]">
      {confirmDialog}
      {/* Roles List Sidebar */}
      <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-[var(--color-border-subtle)] lg:pr-6 pb-6 lg:pb-0 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <Heading level={4}>Roles</Heading>
          <Button size="sm" variant="outline" onClick={() => setIsCreateModalOpen(true)}>
            Create Role
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {roles.map(role => (
            <div 
              key={role.id}
              onClick={() => handleSelectRole(role)}
              className={cn(
                "p-3 rounded-[var(--radius-md)] border cursor-pointer transition-all duration-[var(--duration-base)]",
                selectedRole?.id === role.id 
                  ? "bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--text-primary)]" 
                  : "bg-[var(--bg-elevated)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]"
              )}
            >
              <div className="flex justify-between items-center mb-1">
                <Text className="font-medium">{role.name.replace('ROLE_', '')}</Text>
                {!role.builtin && (
                  <Button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }} 
                    className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors text-xs"
                  >
                    Delete
                  </Button>
                )}
              </div>
              <Text variant="muted" size="sm">
                {role.category || 'PLATFORM'}
              </Text>
            </div>
          ))}
        </div>
      </div>

      {/* Role Details Panel */}
      <div className="flex-1 flex flex-col">
        {selectedRole ? (
          <RoleDetailsPanel 
            role={selectedRole} 
            onEdit={() => setIsUpdateModalOpen(true)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] border border-dashed border-[var(--color-border-subtle)] rounded-[var(--radius-lg)]">
            <Text>Select a role to view governance details</Text>
          </div>
        )}
      </div>

      <CreateRoleModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      {selectedRole && (
        <UpdateRoleModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          role={selectedRole}
        />
      )}
    </div>
  );
}

function RoleDetailsPanel({ role, onEdit }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border-subtle)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Heading level={3} className="mb-0">{role.name.replace('ROLE_', '')}</Heading>
            {!role.builtin && (
              <Button size="xs" variant="outline" onClick={onEdit} className="h-7 px-2">Edit Role</Button>
            )}
          </div>
          <Text variant="muted" size="sm">{role.category || 'PLATFORM'}</Text>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)] font-semibold px-3 py-1">
            {role.builtin ? 'Built-in Platform Authority' : 'Custom Platform Role'}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
        <div className="p-6 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--bg-card)] shadow-sm space-y-5">
          <div>
            <Label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1 block">
              Governance Scope
            </Label>
            <Text className="text-sm font-medium text-[var(--text-primary)]">
              Platform Control Plane (Global System Authority)
            </Text>
            <Text variant="muted" size="sm" className="mt-1 leading-relaxed">
              {role.description || 'This role operates at the platform administration layer. It governs global identities, organizations, and system-wide configurations across the entire Ryokai ecosystem.'}
            </Text>
          </div>

          <div className="border-t border-[var(--color-border-subtle)] pt-4">
            <Label className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1 block">
              Permission Strategy
            </Label>
            <Text className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Platform-level roles do not utilize granular workspace permissions (such as task assignments, project management, or organization announcement settings). Access authority is enforced globally at the control plane boundary.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateRoleModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const createMutation = useCreateRole();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // We send name, isBuiltin=false automatically handled by backend for custom roles
    // Category doesn't strictly matter for non-builtins since it falls back to CUSTOM
    createMutation.mutate({ name: name.toUpperCase() }, {
      onSuccess: () => {
        setName('');
        onClose();
      }
    });
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <ModalTitle>Create Custom Role</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="block text-sm font-medium mb-1.5">Role Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. GLOBAL_AUDITOR"
              className="uppercase"
              required
            />
          </div>
          <ModalFooter>
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending}>Create</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

function UpdateRoleModal({ isOpen, onClose, role }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const updateMutation = useUpdateRole();

  React.useEffect(() => {
    if (role) {
      setName(role.name.replace('ROLE_', ''));
      setDescription(role.description || '');
    }
  }, [role, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    updateMutation.mutate({ 
      roleId: role.id, 
      roleData: { 
        name: name.toUpperCase(),
        description: description 
      } 
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <ModalTitle>Edit Role</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="block text-sm font-medium mb-1.5">Role Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. GLOBAL_AUDITOR"
              className="uppercase"
              required
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-1.5">Description (Optional)</Label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Role description..."
            />
          </div>
          <ModalFooter>
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={updateMutation.isPending}>Save</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}