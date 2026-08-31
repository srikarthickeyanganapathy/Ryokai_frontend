import React from 'react';
import { cn } from '@/shared/lib/cn';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';

/**
 * LensStatusIndicator -- compact chip naming the active workspace.
 * Static dot (no perpetual pulse); the sidebar switcher remains the place
 * to change workspaces.
 */
const LENS_STYLES = {
  PERSONAL: {
    color: '#38BDF8',
    label: 'Personal',
  },
  CREWS: {
    color: '#A78BFA',
    label: 'Crews',
  },
  ORG: {
    color: '#5477F5',
    label: 'Org',
  },
};

export function LensStatusIndicator({ className }) {
  const { workspaceMode, activeOrganization } = useWorkspace();
  const style = LENS_STYLES[workspaceMode] || LENS_STYLES.PERSONAL;
  const name = workspaceMode === 'ORG'
    ? (activeOrganization?.name || 'Organization')
    : style.label;

  return (
    <div
      className={cn('hidden md:flex items-center h-7 gap-1.5 px-2.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-subtle)]', className)}
      title={`Workspace: ${name}`}
    >
      <span
        className="inline-flex h-1.5 w-1.5 rounded-full shrink-0"
        style={{ backgroundColor: style.color }}
      />
      <span className="text-[11px] font-medium text-[var(--text-secondary)] truncate max-w-[120px]">
        {name}
      </span>
    </div>
  );
}
