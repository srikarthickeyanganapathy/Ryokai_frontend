import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Icons } from '@/shared/ui/Icons'
import { Text } from '@/shared/ui/Typography'
import { cn } from '@/shared/lib/cn'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useWorkspace } from '@/context/WorkspaceContext'
import { usePermissions } from '@/context/usePermissions'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select'

export function AppSidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const { workspaceMode, setWorkspaceMode, activeOrganization, setActiveOrganization, organizations } = useWorkspace()
  const { isSuperAdmin } = usePermissions()

  const navItems = [
    { icon: Icons.layoutDashboard, label: 'Dashboard', to: '/app' },
    { icon: Icons.checkCircle, label: 'Focus', to: '/app/focus' },
    { icon: Icons.listTodo, label: 'Tasks', to: '/app/tasks' },
    { icon: Icons.folderClosed, label: 'Projects', to: '/app/projects' },
    { icon: Icons.building, label: 'Organizations', to: '/app/organizations' },
    { icon: Icons.barChart2, label: 'Analytics', to: '/app/analytics' },
    ...(isSuperAdmin ? [{ icon: Icons.shield, label: 'Admin', to: '/app/admin' }] : []),
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--bg-subtle)] border-r border-[var(--border-subtle)] w-60 relative z-20">

      {/* Brand Header */}
      <div className="h-12 flex items-center px-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 text-[var(--text-primary)]">
          <div className="w-5 h-5 rounded-[var(--radius-sm)] bg-gradient-to-b from-[var(--accent-hover)] to-[var(--accent-active)] shadow-[var(--inset-highlight),0_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center">
            <Icons.dashboard className="w-3 h-3 text-white" />
          </div>
          <span className="text-[13px] font-semibold tracking-[-0.01em]">Ryokai</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-3 px-2 space-y-4 overflow-y-auto custom-scrollbar">

        <div className="px-1">
          <Select
            value={workspaceMode === 'ORG' && activeOrganization ? activeOrganization.id.toString() : 'PERSONAL'}
            onValueChange={(val) => {
              if (val === 'PERSONAL') {
                setWorkspaceMode('PERSONAL')
              } else {
                const org = organizations.find(o => o.id.toString() === val)
                if (org) {
                  setWorkspaceMode('ORG')
                  setActiveOrganization(org)
                }
              }
            }}
          >
            <SelectTrigger className="w-full bg-[var(--bg-elevated)] border-[var(--border-subtle)] h-8 text-[12px]">
              <SelectValue placeholder="Select Workspace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERSONAL">
                <div className="flex items-center gap-2">
                  <Icons.user className="w-4 h-4" />
                  <span>Personal Space</span>
                </div>
              </SelectItem>
              {organizations.map(org => (
                <SelectItem key={org.id} value={org.id.toString()}>
                  <div className="flex items-center gap-2">
                    <Icons.building className="w-4 h-4" />
                    <span>{org.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="px-2.5 pt-1 pb-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Workspace</span>
        </div>
        <div className="space-y-[2px]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              className={({ isActive }) => cn(
                "relative flex items-center gap-2.5 px-2 h-7 rounded-[var(--radius-sm)] text-[13px] font-medium transition-colors duration-150 group",
                isActive
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-[var(--radius-sm)] bg-[var(--bg-hover)] border border-[var(--border-subtle)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 38, mass: 0.6 }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-bar"
                      className="absolute -left-2 top-[22%] bottom-[22%] w-[2.5px] bg-[var(--accent)] rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 38, mass: 0.6 }}
                    />
                  )}
                  <item.icon className="relative w-[15px] h-[15px]" strokeWidth={2} />
                  <span className="relative">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* User Footer */}
      <div className="p-2 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 px-1.5 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer">
          <Avatar size="xs">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Text size="xs" className="font-medium truncate leading-tight">{user?.name || 'User'}</Text>
            <Text size="xs" variant="muted" className="truncate leading-tight text-[11px]">{user?.email}</Text>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-full">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-[var(--bg-overlay)]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 w-64 h-full bg-[var(--bg-elevated)]"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}