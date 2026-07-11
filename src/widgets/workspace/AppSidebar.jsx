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
    <div className="flex flex-col h-full bg-[var(--bg-elevated)] border-r border-[var(--color-border-subtle)] w-64 shadow-sm relative z-20">
      
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2 text-[var(--text-primary)]">
          <div className="w-6 h-6 rounded-md bg-[var(--accent-cyan)] flex items-center justify-center shadow-sm">
            <Icons.dashboard className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold tracking-tight">Ryokai</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <Text size="xs" variant="muted" className="px-3 mb-2 font-medium uppercase tracking-wider">
          Workspace
        </Text>

        <div className="px-3 mb-4">
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
            <SelectTrigger className="w-full bg-[var(--bg-subtle)] border-none shadow-none h-9 text-sm">
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
        
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) => cn(
              "relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group",
              isActive 
                ? "text-[var(--text-primary)] bg-[var(--bg-subtle)]" 
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]/50"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-[10%] bottom-[10%] w-[2px] bg-[var(--text-primary)] rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer">
          <Avatar size="sm">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Text size="sm" className="font-medium truncate">{user?.name || 'User'}</Text>
            <Text size="xs" variant="muted" className="truncate">{user?.email}</Text>
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
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
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
