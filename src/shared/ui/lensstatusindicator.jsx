import React from 'react';
import { cn } from '@/shared/lib/cn';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';

/**
 * LensStatusIndicator — a small glowing dot + label showing which workspace
 * "lens" is currently active. Extends the cosmic/pulsar theme into the topbar.
 */
const LENS_STYLES = {
  PERSONAL: {
    color: '#38BDF8',
    glow: 'shadow-[0_0_8px_rgba(56,189,248,0.6)]',
    label: 'Personal',
    pulse: true,
  },
  CREWS: {
    color: '#A78BFA',
    glow: 'shadow-[0_0_8px_rgba(167,139,250,0.6)]',
    label: 'Crew',
    pulse: false,
  },
  ORG: {
    color: '#5477F5',
    glow: 'shadow-[0_0_8px_rgba(84,119,245,0.6)]',
    label: 'Org',
    pulse: false,
  },
};

export function LensStatusIndicator({ className }) {
  const { workspaceMode } = useWorkspace();
  const style = LENS_STYLES[workspaceMode] || LENS_STYLES.PERSONAL;

  return (
    <div className={cn('flex items-center gap-1.5 mr-2', className)}>
      <span
        className={cn(
          'relative inline-flex h-2 w-2 rounded-full transition-all duration-500',
          style.glow,
          style.pulse && 'animate-pulse'
        )}
        style={{ backgroundColor: style.color }}
      >
        <span
          className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
          style={{ backgroundColor: style.color }}
        />
      </span>
      <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider hidden sm:inline">
        {style.label} Lens
      </span>
    </div>
  );
}
