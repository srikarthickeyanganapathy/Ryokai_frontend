import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';

/**
 * SidebarNavItem — reusable navigation link used across the sidebar.
 * Eliminates the repeated ~25-line NavLink pattern that was copy-pasted
 * in renderNavSection, renderCrewsList, renderTeamsList, and settingsNavItems.
 */
export function SidebarNavItem({
  to,
  icon: Icon,
  label,
  isExpanded,
  end = false,
  avatar,
  className,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      title={!isExpanded ? label : undefined}
      className={({ isActive }) => cn(
        "relative flex items-center transition-colors duration-200 group shrink-0",
        isExpanded ? "w-full h-9 rounded-lg px-3 justify-start" : "justify-center w-10 h-10 rounded-full",
        isActive
          ? "text-[var(--accent)]"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
        className
      )}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="sidebar-active-pill"
              className={cn("absolute inset-0 bg-[var(--accent-soft)]", isExpanded ? "rounded-lg" : "rounded-full")}
              transition={{ type: 'spring', stiffness: 500, damping: 38, mass: 0.6 }}
            />
          )}
          {avatar ? (
            avatar
          ) : (
            Icon && <Icon className={cn("relative w-[18px] h-[18px] shrink-0", isActive ? "text-[var(--accent)]" : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]")} strokeWidth={1.5} />
          )}
          {isExpanded && label && (
            <span className={cn("relative ml-3 text-sm font-medium truncate", isActive ? "text-[var(--accent)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]")}>
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
