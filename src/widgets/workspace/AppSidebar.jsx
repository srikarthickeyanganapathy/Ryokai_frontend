import { Button } from '@/shared/ui/Button';

import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Icons } from '@/shared/ui/Icons'
import { Text } from '@/shared/ui/Typography'
import { cn } from '@/shared/lib/cn'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useCrews } from '@/features/crews/hooks/useCrews'
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
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover'

export function AppSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const { workspaceMode, setWorkspaceMode, activeOrganization, setActiveOrganization, organizations } = useWorkspace()
  const { isSuperAdmin, canViewAnalytics } = usePermissions()
  const { data: crewsData } = useCrews()
  const crews = crewsData || []
  const location = useLocation()
  const navigate = useNavigate()
  
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isSettingsMode = location.pathname.startsWith('/app/settings') || location.pathname.startsWith('/app/sessions')

  // ════════════════════════════════════════════════
  // Dynamic navigation based on workspace mode
  // ════════════════════════════════════════════════

  const personalItems = [
    { icon: Icons.layoutDashboard, label: 'Dashboard', to: '/app' },
    { icon: Icons.inbox, label: 'Inbox', to: '/app/inbox' },
    { icon: Icons.zap, label: 'Focus', to: '/app/focus' },
    { icon: Icons.listTodo, label: 'Tasks', to: '/app/tasks' },
  ]

  const personalWorkspaceItems = [
    { icon: Icons.folderClosed, label: 'Projects', to: '/app/projects' },
    { icon: Icons.pencil, label: 'Notes', to: '/app/notes' },
    { icon: Icons.calendar, label: 'Calendar', to: '/app/calendar' },
    { icon: Icons.bookmark, label: 'Saved', to: '/app/saved' },
  ]

  const orgItems = [
    { icon: Icons.layoutDashboard, label: 'Dashboard', to: '/app' },
    { icon: Icons.listTodo, label: 'Tasks', to: '/app/tasks' },
  ]

  const orgWorkspaceItems = [
    { icon: Icons.folderClosed, label: 'Projects', to: '/app/projects' },
    { icon: Icons.users, label: 'Teams', to: '/app/teams' },
    { icon: Icons.target, label: 'Goals & OKRs', to: '/app/goals' },
    { icon: Icons.network, label: 'Directory', to: '/app/directory' },
    { icon: Icons.megaphone, label: 'Announcements', to: '/app/announcements' },
    { icon: Icons.scale, label: 'Workload', to: '/app/workload' },
    { icon: Icons.barChart2, label: 'Analytics', to: '/app/analytics' },
    { icon: Icons.settings, label: 'Settings', to: '/app/organizations' },
    ...(isSuperAdmin ? [{ icon: Icons.shield, label: 'Admin', to: '/app/admin' }] : []),
  ]

  const crewsPrimaryItems = [
    { icon: Icons.rocket, label: 'Crews', to: '/app/crews' },
    { icon: Icons.compass, label: 'Discover & Join', to: '/app/crews/discover' },
    { icon: Icons.listTodo, label: 'All Crew Tasks', to: '/app/crews/tasks' },
    { icon: Icons.folderClosed, label: 'Projects', to: '/app/projects' },
  ]

  const settingsNavItems = [
    { icon: Icons.user, label: 'Profile', to: '/app/settings/profile' },
    { icon: Icons.shield, label: 'Security', to: '/app/settings/security' },
    { icon: Icons.settings, label: 'Sessions', to: '/app/settings/sessions' },
  ]

  // Pick the correct nav items based on workspace mode
  const getPrimaryItems = () => {
    if (workspaceMode === 'ORG') return orgItems
    if (workspaceMode === 'CREWS') return crewsPrimaryItems
    return personalItems
  }

  const getWorkspaceItems = () => {
    if (workspaceMode === 'ORG') return orgWorkspaceItems
    if (workspaceMode === 'CREWS') return null // Crews use the "My Crews" list instead
    return personalWorkspaceItems
  }

  // ════════════════════════════════════════════════
  // Dropdown value logic
  // ════════════════════════════════════════════════

  const getDropdownValue = () => {
    if (workspaceMode === 'ORG' && activeOrganization) return `org-${activeOrganization.id}`
    if (workspaceMode === 'CREWS') return 'CREWS'
    return 'PERSONAL'
  }

  const handleDropdownChange = (val) => {
    if (val === 'PERSONAL') {
      setWorkspaceMode('PERSONAL')
    } else if (val === 'CREWS') {
      setWorkspaceMode('CREWS')
    } else if (val.startsWith('org-')) {
      const orgId = val.replace('org-', '')
      const org = organizations.find(o => o.id.toString() === orgId)
      if (org) {
        setWorkspaceMode('ORG')
        setActiveOrganization(org)
      }
    }
  }

  // ════════════════════════════════════════════════
  // Render helpers
  // ════════════════════════════════════════════════

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

  const renderCrewsList = () => {
    if (workspaceMode !== 'CREWS' || isCollapsed) return null
    if (crews.length === 0) return (
      <div className="px-4 py-6 text-center">
        <Text size="sm" variant="muted">No crews yet.</Text>
        <Text size="xs" variant="muted" className="mt-1">Discover and join crews above!</Text>
      </div>
    )

    return (
      <div className="mb-6">
        <div className="px-4 pb-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-tertiary)]">My Crews</span>
        </div>
        <div className="space-y-[2px] px-3">
          {crews.map((crew) => (
            <NavLink
              key={crew.id}
              to={`/app/crews/${crew.id}`}
              className={({ isActive }) => cn(
                "relative flex items-center h-[34px] rounded-full text-[13px] font-medium transition-colors duration-150 group px-3 gap-3 w-full",
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
                  <div className="relative w-[18px] h-[18px] rounded-md bg-[var(--accent)] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                    {crew.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="relative truncate">{crew.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    )
  }

  const sidebarContent = (
    <div className={cn(
      "flex flex-col h-full bg-[var(--bg-subtle)]/40 backdrop-blur-xl relative z-20 transition-all duration-300",
      isCollapsed ? "w-[68px]" : "w-[240px]"
    )}>
      
      {/* Brand & User Profile Header */}
      <div className={cn("flex items-center shrink-0 mt-2", isCollapsed ? "justify-center py-3" : "h-14 justify-between px-3")}>
        {!isCollapsed && (
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:bg-[var(--bg-hover)] p-1.5 rounded-full transition-all duration-200 flex-1">
                <Avatar size="sm" className="bg-[var(--accent)] text-white shrink-0 shadow-sm">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="bg-[var(--accent)] text-white text-[11px] font-bold">
                    {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 text-left overflow-hidden">
                  <Text className="text-[13px] font-bold truncate text-[var(--text-primary)] leading-tight">
                    {user?.name || user?.username}
                  </Text>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent 
              align="start" 
              className="w-56 bg-[var(--bg-elevated)]/95 backdrop-blur-xl border border-[var(--color-border-subtle)] p-2 rounded-2xl shadow-xl flex flex-col gap-1 z-[9999]"
            >
              <Link
                to="/app/settings/profile"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Icons.user className="w-4 h-4 text-[var(--text-muted)]" />
                <span>Profile</span>
              </Link>
              <Link
                to="/app/settings/security"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Icons.settings className="w-4 h-4 text-[var(--text-muted)]" />
                <span>Settings</span>
              </Link>
              <Separator className="my-1 bg-[var(--color-border-subtle)]" />
              <Button
                variant="ghost"
                onClick={() => logout()}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[var(--danger)] hover:bg-[var(--danger-soft)]/20 transition-colors w-full text-left font-semibold"
              >
                <Icons.logout className="w-4 h-4" />
                <span>Log out</span>
              </Button>
            </PopoverContent>
          </Popover>
        )}

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200 p-2 rounded-xl hover:bg-[var(--bg-hover)] hidden lg:flex shrink-0 items-center justify-center border border-transparent hover:border-[var(--color-border-subtle)]"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <Icons.sidebarOpen className="w-4 h-4 text-[var(--accent)]" />
          ) : (
            <Icons.sidebarClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ═══ Workspace Switcher (Top position) ═══ */}
      {!isSettingsMode && !isCollapsed && (
        <div className="px-4 py-2">
          <Select
            value={getDropdownValue()}
            onValueChange={handleDropdownChange}
          >
            <SelectTrigger className="w-full bg-[var(--bg-elevated)]/50 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)] h-10 text-[12px] font-semibold rounded-full px-4 transition-all duration-300 shadow-sm">
              <SelectValue placeholder="Select Workspace" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-[var(--border-subtle)] bg-[var(--bg-elevated)]/95 backdrop-blur-xl shadow-lg">
              <SelectItem value="PERSONAL" className="rounded-xl">
                <div className="flex items-center gap-2">
                  <Icons.user className="w-4 h-4" />
                  <span>Personal Space</span>
                </div>
              </SelectItem>
              {organizations.map(org => (
                <SelectItem key={org.id} value={`org-${org.id}`} className="rounded-xl">
                  <div className="flex items-center gap-2">
                    <Icons.building className="w-4 h-4" />
                    <span>{org.name}</span>
                  </div>
                </SelectItem>
              ))}
              <SelectItem value="CREWS" className="rounded-xl">
                <div className="flex items-center gap-2">
                  <Icons.rocket className="w-4 h-4" />
                  <span>Crews</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">

        {!isSettingsMode && (
          <>
            {renderNavSection(getPrimaryItems(), 'Primary')}
            {getWorkspaceItems() && renderNavSection(getWorkspaceItems(), 'Workspace')}
            {renderCrewsList()}
          </>
        )}

        {isSettingsMode && (
          <>
            <div className={cn("pb-3 flex items-center", isCollapsed ? "justify-center px-2" : "px-3")}>
              <button 
                onClick={() => navigate('/app')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-soft)] hover:bg-[var(--bg-hover)] shadow-sm",
                  isCollapsed ? "w-9 h-9 justify-center p-0" : "w-full"
                )}
                title="Back to Workspace"
              >
                <Icons.chevronLeft className="w-4 h-4 text-[var(--accent)] shrink-0" />
                {!isCollapsed && <span>Back to Workspace</span>}
              </button>
            </div>
            {renderNavSection(settingsNavItems, 'Account Settings')}
          </>
        )}
      </div>

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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 h-full bg-[var(--bg-base)]/80 backdrop-blur-xl shadow-2xl rounded-r-3xl overflow-hidden"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
