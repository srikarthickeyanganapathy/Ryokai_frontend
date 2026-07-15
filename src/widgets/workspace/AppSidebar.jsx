import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Icons } from '@/shared/ui/Icons'
import { Text } from '@/shared/ui/Typography'
import { cn } from '@/shared/lib/cn'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useWorkspace } from '@/context/WorkspaceContext'
import { usePermissions } from '@/context/usePermissions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select'
import { Separator } from '@/shared/ui/Separator'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar'
export function AppSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const { workspaceMode, setWorkspaceMode, activeOrganization, setActiveOrganization, organizations } = useWorkspace()
  const { isSuperAdmin } = usePermissions()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isSettingsMode = location.pathname.startsWith('/app/settings') || location.pathname.startsWith('/app/sessions')

  const primaryItems = [
    { icon: Icons.layoutDashboard, label: 'Dashboard', to: '/app' },
    { icon: Icons.inbox, label: 'Inbox', to: '/app/inbox' },
    { icon: Icons.checkCircle, label: 'Focus', to: '/app/focus' },
    { icon: Icons.listTodo, label: 'Tasks', to: '/app/tasks' },
  ]

  const workspaceItems = [
    { icon: Icons.folderClosed, label: 'Projects', to: '/app/projects' },
    { icon: Icons.building, label: 'Organizations', to: '/app/organizations' },
    { icon: Icons.users, label: 'Crews', to: '/app/crews' },
    { icon: Icons.barChart2, label: 'Analytics', to: '/app/analytics' },
    ...(isSuperAdmin ? [{ icon: Icons.shield, label: 'Admin', to: '/app/admin' }] : []),
  ]

  const settingsNavItems = [
    { icon: Icons.user, label: 'Profile', to: '/app/settings/profile' },
    { icon: Icons.shield, label: 'Security', to: '/app/settings/security' },
    { icon: Icons.settings, label: 'Sessions', to: '/app/settings/sessions' },
  ]

  const renderNavSection = (items, title) => (
    <div className="space-y-1 mb-6">
      {title && !isCollapsed && (
        <div className="px-4 pb-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-tertiary)]">{title}</span>
        </div>
      )}
      <div className={cn("space-y-[2px]", isCollapsed ? "px-2" : "px-3")}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) => cn(
              "relative flex items-center h-[34px] rounded-full text-[13px] font-medium transition-colors duration-150 group",
              isCollapsed ? "justify-center w-10 mx-auto" : "px-3 gap-3 w-full",
              isActive
                ? "text-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-full bg-[var(--accent-soft)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38, mass: 0.6 }}
                  />
                )}
                <item.icon className={cn("relative w-[16px] h-[16px] shrink-0", isActive ? "text-[var(--accent)]" : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]")} strokeWidth={1.5} />
                {!isCollapsed && <span className="relative truncate">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  )

  const sidebarContent = (
    <div className={cn(
      "flex flex-col h-full bg-[var(--bg-sidebar)] relative z-20 border-r border-[var(--border-subtle)] transition-all duration-300",
      isCollapsed ? "w-[68px]" : "w-[240px]"
    )}>
      
      {/* Brand Header */}
      <div className={cn("flex items-center shrink-0", isCollapsed ? "flex-col justify-center gap-2 py-3" : "h-14 justify-between px-3")}>
        <div 
          onClick={() => navigate('/app/settings/profile')}
          className={cn(
            "flex items-center gap-2.5 min-w-0 cursor-pointer hover:bg-[var(--bg-hover)] rounded-md transition-colors",
            isCollapsed ? "p-1" : "p-1.5 flex-1"
          )}
        >
          <Avatar size="sm" className="bg-[#B8720A] text-white shrink-0">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback className="bg-[#B8720A] text-white text-[11px] font-medium">
              {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 text-left overflow-hidden">
              <Text className="text-[13px] font-medium truncate text-[var(--text-primary)] leading-tight">{user?.name || user?.username}</Text>
            </div>
          )}
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1.5 rounded-md hover:bg-[var(--bg-hover)] hidden lg:flex shrink-0",
            isCollapsed && "mt-1"
          )}
        >
          {isCollapsed ? (
            <Icons.sidebarOpen className="w-4 h-4" />
          ) : (
            <Icons.sidebarClose className="w-4 h-4" />
          )}
        </button>
      </div>



      {/* Main Navigation */}
      <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">

        {!isSettingsMode && (
          <>
            {renderNavSection(primaryItems, 'Primary')}
            {renderNavSection(workspaceItems, 'Workspace')}
            
            {!isCollapsed && (
              <div className="px-3 mt-6">
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
                  <SelectTrigger className="w-full bg-transparent border-transparent hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)] h-8 text-[12px] font-medium rounded-md px-3 transition-colors shadow-none">
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
            )}
          </>
        )}

        {isSettingsMode && (
          <>
            <div className={cn("pb-4 flex items-center", isCollapsed ? "justify-center px-2" : "px-4 gap-2")}>
              <button 
                onClick={() => navigate('/app')}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors"
                title={isCollapsed ? "Back to app" : undefined}
              >
                <Icons.chevronLeft className="w-4 h-4" />
              </button>
              {!isCollapsed && <span className="text-[13px] font-medium text-[var(--text-primary)]">Settings</span>}
            </div>
            {renderNavSection(settingsNavItems, 'Account')}
          </>
        )}
      </div>

      {/* User footer removed, moved to top */}
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-full shrink-0">
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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 h-full bg-[var(--bg-sidebar)] shadow-xl"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}