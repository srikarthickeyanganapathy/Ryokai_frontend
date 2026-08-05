import React from 'react'
import { NavLink } from 'react-router-dom'
import { Icons } from '@/shared/ui/Icons'
import { Heading } from '@/shared/ui/Typography'
import { cn } from '@/shared/lib/cn'
import { RyokaiLogo } from '@/shared/ui/Logo/RyokaiLogo'

const platformNav = [
  { name: 'Dashboard', path: '/platform/dashboard', icon: Icons.dashboard },
  { name: 'Organization Explorer', path: '/platform/organizations', icon: Icons.workspace },
  { name: 'Users', path: '/platform/users', icon: Icons.users },
  { name: 'Monitoring', path: '/platform/monitoring', icon: Icons.activity },
  { name: 'Audit Logs', path: '/platform/audit', icon: Icons.archive },
  { name: 'System Health', path: '/platform/health', icon: Icons.activity },
  { name: 'Settings', path: '/platform/settings', icon: Icons.settings },
]

export function PlatformSidebar({ className }) {
  return (
    <aside className={cn(
      "w-64 border-r border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] flex flex-col h-full",
      className
    )}>
      {/* Brand */}
      <div className="h-14 px-4 flex items-center border-b border-[var(--color-border-subtle)]">
        <RyokaiLogo size="sm" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-2 pb-2">
          <Heading level={6} className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            Control Plane
          </Heading>
        </div>
        {platformNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors duration-[var(--duration-base)]",
              isActive 
                ? "bg-[var(--accent-soft)] text-[var(--accent)]" 
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Area Placeholder */}
      <div className="p-4 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
            <Icons.shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-medium">Platform Admin</div>
            <div className="text-xs text-[var(--text-muted)]">Control Plane Access</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
