import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';
import { Input } from '@/shared/ui/Input';
import { useCreateOrgRole, useUpdateOrgRolePermissions, useUpdateOrgRole } from '@/features/organizations/hooks/useOrganizations';
import { Skeleton } from '@/shared/ui/Skeleton';
import { cn } from '@/shared/lib/cn';

const ALL_PERMISSIONS = [
  'TASK_VIEW', 'TASK_ASSIGN', 'TASK_EDIT', 'TASK_DELETE',
  'TASK_REVIEW', 'TASK_DEPENDENCY_EDIT',
  'TASK_REASSIGN', 'TASK_ARCHIVE', 'ROLE_MANAGE',
  'ORG_MEMBER_INVITE', 'ORG_MEMBER_REMOVE', 'LEAVE_REQUEST_MANAGE',
  'TEAM_CREATE', 'TEAM_MANAGE', 'PROJECT_CREATE', 'PROJECT_MANAGE'
];

export function OrgRolesTab({ orgId, roles, rolesLoading }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePriority, setNewRolePriority] = useState(100);
  
  // Local state for checking permissions without auto-saving
  const [localPermissions, setLocalPermissions] = useState([]);
  const [localPriority, setLocalPriority] = useState(100);

  const createRoleMutation = useCreateOrgRole(orgId);
  const updatePermissionsMutation = useUpdateOrgRolePermissions(orgId);
  const updateRoleMutation = useUpdateOrgRole(orgId);

  // Sync selectedRole with updated data from the roles array (after query refetch)
  useEffect(() => {
    if (selectedRole) {
      const updated = roles.find(r => r.id === selectedRole.id);
      if (updated) {
        setSelectedRole(updated);
      }
    }
  }, [roles, selectedRole]);

  // Sync local permission array when active selected role changes
  useEffect(() => {
    if (selectedRole) {
      setLocalPermissions(selectedRole.permissions ? selectedRole.permissions.map(p => p.name) : []);
      setLocalPriority(selectedRole.priority ?? 100);
    } else {
      setLocalPermissions([]);
      setLocalPriority(100);
    }
  }, [selectedRole]);

  const handleCreateRole = (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    createRoleMutation.mutate({
      name: newRoleName.trim().toUpperCase(),
      priority: Number(newRolePriority) || 0
    }, {
      onSuccess: () => {
        setNewRoleName('');
        setNewRolePriority(100);
        setIsCreating(false);
      }
    });
  };

  const togglePermissionLocal = (permission) => {
    if (selectedRole?.name === 'ADMIN') return; // Cannot edit ADMIN role permissions
    if (localPermissions.includes(permission)) {
      setLocalPermissions(prev => prev.filter(p => p !== permission));
    } else {
      setLocalPermissions(prev => [...prev, permission]);
    }
  };

  const handleSaveChanges = () => {
    if (!selectedRole || !isDirty) return;
    
    // Check if permissions changed
    const permsChanged = (() => {
      if (originalPermissions.length !== localPermissions.length) return true;
      return !originalPermissions.every(p => localPermissions.includes(p));
    })();
    
    // Check if priority changed
    const originalPriority = selectedRole.priority ?? 100;
    const priorityChanged = originalPriority !== Number(localPriority);

    if (permsChanged) {
      updatePermissionsMutation.mutate({
        roleId: selectedRole.id,
        permissionNames: localPermissions
      });
    }

    if (priorityChanged) {
      updateRoleMutation.mutate({
        roleId: selectedRole.id,
        payload: { name: selectedRole.name, priority: Number(localPriority) }
      });
    }
  };

  // Determine if local permissions differ from actual role permissions
  const originalPermissions = selectedRole?.permissions ? selectedRole.permissions.map(p => p.name) : [];
  const isDirty = (() => {
    const originalPriority = selectedRole?.priority ?? 100;
    if (originalPriority !== Number(localPriority)) return true;
    if (originalPermissions.length !== localPermissions.length) return true;
    return !originalPermissions.every(p => localPermissions.includes(p));
  })();

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
          {!isCreating && (
            <Button variant="ghost" size="sm" onClick={() => setIsCreating(true)}>
              <Icons.plus className="w-4 h-4" />
            </Button>
          )}
        </div>

        {isCreating && (
          <form onSubmit={handleCreateRole} className="mb-5 flex flex-col gap-3 p-4 border border-[var(--color-border-subtle)] rounded-xl bg-[var(--bg-subtle)]/50">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">Role Name</label>
              <Input
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g. MANAGER"
                autoFocus
                className="uppercase"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">Priority (0 is highest)</label>
              <Input
                type="number"
                min="0"
                value={newRolePriority}
                onChange={(e) => setNewRolePriority(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary" disabled={createRoleMutation.isPending || !newRoleName}>
                Save Role
              </Button>
            </div>
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
              <div className="flex flex-col items-start gap-1">
                <span>{role.name}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-normal">Priority: {role.priority ?? 100}</span>
              </div>
              {role.name === 'ADMIN' && <Icons.lock className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
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
              {selectedRole.name === 'ADMIN' && (
                <Badge variant="outline" className="text-[var(--warning)] border-[var(--warning)]/30">Read-Only</Badge>
              )}
            </div>
            
            {selectedRole.name !== 'ADMIN' && (
              <div className="mb-6 max-w-xs">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Role Priority (0 is highest)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={localPriority}
                  onChange={(e) => setLocalPriority(e.target.value)}
                  disabled={updateRoleMutation.isPending || updatePermissionsMutation.isPending}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_PERMISSIONS.map(permission => {
                const hasPermission = localPermissions.includes(permission);
                return (
                  <label 
                    key={permission} 
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-[var(--radius-md)] border transition-all duration-[var(--duration-base)] cursor-pointer",
                      hasPermission 
                        ? "border-[var(--accent-border)] bg-[var(--accent-soft)]" 
                        : "border-[var(--color-border-subtle)] bg-[var(--bg-subtle)] hover:border-[var(--color-border-default)]",
                      selectedRole.name === 'ADMIN' ? 'opacity-70 cursor-not-allowed' : ''
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={hasPermission}
                      disabled={selectedRole.name === 'ADMIN' || updatePermissionsMutation.isPending}
                      onChange={() => togglePermissionLocal(permission)}
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

            {selectedRole.name !== 'ADMIN' && (
              <div className="mt-8 flex justify-end pt-4 border-t border-[var(--color-border-subtle)]">
                <Button
                  onClick={handleSaveChanges}
                  disabled={!isDirty || updatePermissionsMutation.isPending || updateRoleMutation.isPending}
                  variant="primary"
                >
                  {updatePermissionsMutation.isPending || updateRoleMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
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
