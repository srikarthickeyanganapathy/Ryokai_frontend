import React from 'react';
import { Drawer, DrawerContent } from '@/shared/ui/Drawer';
import { PermissionInspectorContent } from './PermissionInspectorContent';

export function InspectorDrawer({
  role,
  permission,
  open,
  onOpenChange,
  isEnabled,
  currentScope,
  currentAssignments,
  isAdmin,
  onScopeChange,
  onResourceAssignmentChange,
  onToggle,
  permissionMap,
  localScopedPerms,
  supervisionNames = [],
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="sm:max-w-sm p-0 flex flex-col">
        <PermissionInspectorContent
          role={role}
          permission={permission}
          isEnabled={isEnabled}
          currentScope={currentScope}
          currentAssignments={currentAssignments}
          isAdmin={isAdmin}
          onScopeChange={onScopeChange}
          onResourceAssignmentChange={onResourceAssignmentChange}
          onToggle={onToggle}
          permissionMap={permissionMap}
          localScopedPerms={localScopedPerms}
          supervisionNames={supervisionNames}
          onClose={() => onOpenChange(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}
