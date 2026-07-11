import React, { useState } from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { useRoles, useCreateRole, usePermissionsList, useRolePermissions, useAssignRolePermissions, useDeleteRole } from '@/features/admin/hooks/useAdmin';
import { toast } from 'sonner';

export function RolesTab() {
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissions = [], isLoading: permissionsLoading } = usePermissionsList();
  
  const [selectedRole, setSelectedRole] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const deleteRoleMutation = useDeleteRole();

  const handleSelectRole = (role) => {
    setSelectedRole(role);
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      deleteRoleMutation.mutate(roleId, {
        onSuccess: () => {
          if (selectedRole?.id === roleId) {
            setSelectedRole(null);
          }
        }
      });
    }
  };

  if (rolesLoading || permissionsLoading) {
    return (
      <div className="flex gap-6 mt-6 h-full">
        <div className="w-1/3 border-r border-[var(--color-border-subtle)] pr-6">
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
    <div className="flex gap-6 mt-6 h-full min-h-[500px]">
      {/* Roles List Sidebar */}
      <div className="w-1/3 border-r border-[var(--color-border-subtle)] pr-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <Heading level={4}>Roles</Heading>
          <Button size="sm" variant="outline" onClick={() => setIsCreateModalOpen(true)}>
            Create Role
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {roles.map(role => (
            <div 
              key={role.id}
              onClick={() => handleSelectRole(role)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedRole?.id === role.id 
                ? 'bg-[var(--bg-subtle)] border-[var(--accent-cyan)]' 
                : 'bg-[var(--bg-elevated)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <Text className="font-medium">{role.name.replace('ROLE_', '')}</Text>
                {!role.builtin && (
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }} className="text-[var(--text-muted)] hover:text-red-500">
                    Delete
                  </button>
                )}
              </div>
              <Text variant="muted" size="sm">
                {role.category}
              </Text>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Grid Panel */}
      <div className="flex-1 flex flex-col">
        {selectedRole ? (
          <RolePermissionsPanel role={selectedRole} allPermissions={permissions} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] border border-dashed border-[var(--color-border-subtle)] rounded-xl">
            <Text>Select a role to manage permissions</Text>
          </div>
        )}
      </div>

      <CreateRoleModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}

function RolePermissionsPanel({ role, allPermissions }) {
  const { data: rolePerms = [], isLoading } = useRolePermissions(role.id);
  const assignMutation = useAssignRolePermissions();
  
  // Use permission IDs or names? The hook useAssignRolePermissions says "Sends permission NAME strings, not IDs".
  // rolePerms should be an array of permissions assigned to this role.
  const rolePermNames = rolePerms.map(p => typeof p === 'string' ? p : p.name);

  const [selectedPermNames, setSelectedPermNames] = useState(rolePermNames);
  
  // Update state when data changes (i.e. changing roles)
  React.useEffect(() => {
    setSelectedPermNames(rolePermNames);
  }, [role.id, isLoading]); // intentionally leaving rolePermNames out of deps to avoid loops

  const handleToggle = (permName) => {
    if (selectedPermNames.includes(permName)) {
      setSelectedPermNames(selectedPermNames.filter(n => n !== permName));
    } else {
      setSelectedPermNames([...selectedPermNames, permName]);
    }
  };

  const handleSave = () => {
    assignMutation.mutate({ roleId: role.id, permissionNames: selectedPermNames });
  };

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border-subtle)] pb-4">
        <div>
          <Heading level={3}>{role.name.replace('ROLE_', '')}</Heading>
          <Text variant="muted" size="sm">{role.category}</Text>
        </div>
        <Button onClick={handleSave} isLoading={assignMutation.isPending}>
          Save Permissions
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allPermissions.map(perm => {
            const isChecked = selectedPermNames.includes(perm.name);
            return (
              <label 
                key={perm.id} 
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  isChecked ? 'bg-[var(--bg-subtle)] border-[var(--accent-cyan)]/50' : 'bg-transparent border-[var(--color-border-subtle)]'
                }`}
              >
                <div className="mt-0.5">
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={() => handleToggle(perm.name)}
                    className="w-4 h-4 rounded border-[var(--color-border-default)] text-[var(--accent-cyan)] focus:ring-[var(--accent-cyan)]"
                  />
                </div>
                <div>
                  <Text className="font-medium text-sm mb-0.5">{perm.name}</Text>
                  <Text variant="muted" size="sm">{perm.description || 'No description available.'}</Text>
                </div>
              </label>
            );
          })}
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
        <Heading level={3} className="mb-4">Create Custom Role</Heading>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Role Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. PROJECT_MANAGER"
              className="w-full bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg p-2 text-sm focus:outline-none focus:border-[var(--accent-cyan)] uppercase"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending}>Create</Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
