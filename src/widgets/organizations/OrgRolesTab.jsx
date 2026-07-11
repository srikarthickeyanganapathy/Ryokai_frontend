import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button, IconButton } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';
import { Input } from '@/shared/ui/Input';
import { useCreateOrgRole, useUpdateOrgRolePermissions } from '@/features/organizations/hooks/useOrganizations';
import { Skeleton } from '@/shared/ui/Skeleton';
import { cn } from '@/shared/lib/cn';

const ALL_PERMISSIONS = [
  'TASK_VIEW', 'TASK_CREATE', 'TASK_ASSIGN', 'TASK_EDIT', 'TASK_DELETE',
  'TASK_REVIEW', 'TASK_COMMENT', 'TASK_CHECKLIST_EDIT', 'TASK_DEPENDENCY_EDIT',
  'TASK_REASSIGN', 'TASK_ARCHIVE', 'USER_MANAGE', 'ROLE_MANAGE', 'TEMPLATE_MANAGE'
];

export function OrgRolesTab({ orgId, roles, rolesLoading }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const createRoleMutation = useCreateOrgRole(orgId);
  const updatePermissionsMutation = useUpdateOrgRolePermissions(orgId);

  const handleCreateRole = (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    createRoleMutation.mutate({ name: newRoleName.trim().toUpperCase() }, {
      onSuccess: () => {
        setNewRoleName('');
        setIsCreating(false);
      }
    });
  };

  const togglePermission = (role, permission) => {
    if (role.name === 'SUPER_ADMIN') return; // Cannot edit super admin
    const currentPermissions = role.permissions ? role.permissions.map(p => p.name) : [];
    let newPermissions;
    if (currentPermissions.includes(permission)) {
      newPermissions = currentPermissions.filter(p => p !== permission);
    } else {
      newPermissions = [...currentPermissions, permission];
    }
    updatePermissionsMutation.mutate({ roleId: role.id, permissionNames: newPermissions });
  };

  if (rolesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Roles List */}
      <div className="md:col-span-1 border-r border-[var(--color-border-subtle)] pr-6">
        <div className="flex items-center justify-between mb-4">
          <Heading level={4}>Roles</Heading>
          <Button variant="ghost" size="sm" onClick={() => setIsCreating(true)}>
            <Icons.plus className="w-4 h-4" />
          </Button>
        </div>

        {isCreating && (
          <form onSubmit={handleCreateRole} className="mb-4 flex gap-2">
            <Input
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="ROLE_NAME"
              autoFocus
              className="uppercase"
            />
            <Button type="submit" size="sm" variant="primary" disabled={createRoleMutation.isPending || !newRoleName}>
              Save
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
              <Icons.x className="w-4 h-4" />
            </Button>
          </form>
        )}

        <div className="space-y-2">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-[var(--duration-base)] border",
                selectedRole?.id === role.id 
                  ? "bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--text-primary)]" 
                  : "bg-transparent border-transparent hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
              )}
            >
              <span>{role.name}</span>
              {role.name === 'SUPER_ADMIN' && <Icons.lock className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Permissions List */}
      <div className="md:col-span-2">
        {selectedRole ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <Heading level={4}>Permissions for {selectedRole.name}</Heading>
              {selectedRole.name === 'SUPER_ADMIN' && (
                <Badge variant="outline" className="text-[var(--warning)] border-[var(--warning)]/30">Read-Only</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_PERMISSIONS.map(permission => {
                const hasPermission = selectedRole.permissions?.some(p => p.name === permission);
                return (
                  <label 
                    key={permission} 
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-[var(--radius-md)] border transition-all duration-[var(--duration-base)] cursor-pointer",
                      hasPermission 
                        ? "border-[var(--accent-border)] bg-[var(--accent-soft)]" 
                        : "border-[var(--color-border-subtle)] bg-[var(--bg-subtle)] hover:border-[var(--color-border-default)]",
                      selectedRole.name === 'SUPER_ADMIN' ? 'opacity-70 cursor-not-allowed' : ''
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={hasPermission}
                      disabled={selectedRole.name === 'SUPER_ADMIN' || updatePermissionsMutation.isPending}
                      onChange={() => togglePermission(selectedRole, permission)}
                      className="mt-0.5 w-4 h-4 rounded border-[var(--color-border-subtle)] text-[var(--accent)] focus:ring-[var(--accent)]/50 bg-transparent"
                    />
                    <div>
                      <Text className="text-sm font-medium">{permission}</Text>
                      <Text variant="muted" size="sm" className="text-[11px] mt-0.5">
                        {permission.toLowerCase().replace(/_/g, ' ')}
                      </Text>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 border border-dashed border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] bg-[var(--bg-subtle)]">
            <Icons.shield className="w-10 h-10 text-[var(--text-muted)] mb-4" />
            <Heading level={4} className="mb-2">Select a Role</Heading>
            <Text variant="muted" className="max-w-xs text-[13px]">
              Choose a role from the list to view and manage its permissions.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
