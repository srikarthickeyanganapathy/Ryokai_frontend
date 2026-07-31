import { Button } from '@/shared/ui/Button';

import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Icons } from '@/shared/ui/Icons'
import { Text } from '@/shared/ui/Typography'
import { cn } from '@/shared/lib/cn'
import { useAuth } from '@/identity'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { usePermissions } from '@/identity'
import { useCrews } from '@/crew'
import { useOrgTeams } from '@/organization'
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
  const { data: teamsData = [] } = useOrgTeams(activeOrganization?.id)
  const teams = teamsData || []
  const location = useLocation()
  const navigate = useNavigate()
  
  const isSettingsMode = location.pathname.startsWith('/app/settings') || location.pathname.startsWith('/app/sessions')

  // ════════════════════════════════════════════════
  // Dynamic navigation based on workspace mode
  const settingsNavItems = [
    { icon: Icons.user, label: 'Profile', to: '/app/settings/profile' },
    { icon: Icons.shield, label: 'Security', to: '/app/settings/security' },
    { icon: Icons.settings, label: 'Sessions', to: '/app/settings/sessions' },
  ]

  const getSidebarSections = () => {
    if (workspaceMode === 'ORG') {
      return [
        {
          items: [
            { icon: Icons.layoutDashboard, label: 'Mission Control', to: '/app' },
            { icon: Icons.folderClosed, label: 'Projects', to: '/app/projects' },
          ]
        },
        {
          items: [
            { icon: Icons.listTodo, label: 'Tasks', to: '/app/tasks' },
            { icon: Icons.users, label: 'Teams', to: '/app/teams' },
            { icon: Icons.network, label: 'Directory', to: '/app/directory' },
          ]
        },
        {
          items: [
            { icon: Icons.barChart2, label: 'Analytics', to: '/app/analytics' },
            { icon: Icons.scale, label: 'Workload', to: '/app/workload' },
            { icon: Icons.target, label: 'Goals & OKRs', to: '/app/goals' },
          ]
        },
        {
          items: [
            { icon: Icons.megaphone, label: 'Announcements', to: '/app/announcements' },
            { icon: Icons.settings, label: 'Settings', to: '/app/organizations' },
            ...(isSuperAdmin ? [{ icon: Icons.shield, label: 'Admin', to: '/app/admin' }] : []),
          ]
        }
      ]
    }
    if (workspaceMode === 'CREWS') {
      return [
        {
          items: [
            { icon: Icons.layoutDashboard, label: 'Mission Control', to: '/app' },
            { icon: Icons.rocket, label: 'Crews', to: '/app/crews' },
            { icon: Icons.listTodo, label: 'All Crew Tasks', to: '/app/crews/tasks' },
            { icon: Icons.folderClosed, label: 'Projects', to: '/app/projects' },
          ]
        },
        {
          items: [
            { icon: Icons.compass, label: 'Discover & Join', to: '/app/crews/discover' },
          ]
        }
      ]
    }
    // DEFAULT: PERSONAL
    return [
      {
        items: [
          { icon: Icons.layoutDashboard, label: 'Mission Control', to: '/app' },
          { icon: Icons.inbox, label: 'Inbox', to: '/app/inbox' },
          { icon: Icons.listTodo, label: 'Tasks', to: '/app/tasks' },
          { icon: Icons.folderClosed, label: 'Projects', to: '/app/projects' },
          { icon: Icons.zap, label: 'Focus', to: '/app/focus' },
        ]
      },
      {
        items: [
          { icon: Icons.calendar, label: 'Calendar', to: '/app/calendar' },
          { icon: Icons.pencil, label: 'Notes', to: '/app/notes' },
        ]
      },
      {
        items: [
          { icon: Icons.barChart2, label: 'Analytics', to: '/app/analytics' },
          { icon: Icons.bookmark, label: 'Saved', to: '/app/saved' },
        ]
      }
    ]
  }

  // ════════════════════════════════════════════════
  // Dropdown value logic
  // ════════════════════════════════════════════════

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
    navigate('/app')
  }

  const getWorkspaceIcon = () => {
    if (workspaceMode === 'ORG') return <Icons.building className="w-5 h-5" />
    if (workspaceMode === 'CREWS') return <Icons.rocket className="w-5 h-5" />
    return <Icons.user className="w-5 h-5" />
  }

  // ════════════════════════════════════════════════
  // Render helpers
  // ════════════════════════════════════════════════

  const renderNavSection = (items, index) => (
    <div key={index} className="space-y-[4px] mb-4 flex flex-col items-center w-full">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/app'}
          title={item.label}
          className={({ isActive }) => cn(
            "relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 group shrink-0",
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
              <item.icon className={cn("relative w-[18px] h-[18px] shrink-0", isActive ? "text-[var(--accent)]" : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]")} strokeWidth={1.5} />
            </>
          )}
        </NavLink>
      ))}
      <div className="w-6 h-[1px] bg-[var(--color-border-subtle)] mt-4 opacity-50" />
    </div>
  )

  const renderCrewsList = () => {
    if (workspaceMode !== 'CREWS') return null
    if (crews.length === 0) return null

    return (
      <div className="flex flex-col items-center space-y-2 mb-4 w-full">
        {crews.map((crew) => (
          <NavLink
            key={crew.id}
            to={`/app/crews/${crew.id}`}
            title={crew.name}
            className={({ isActive }) => cn(
              "relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 group shrink-0",
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
                <div className="relative w-6 h-6 rounded-md bg-[var(--accent)] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  {crew.name?.charAt(0).toUpperCase()}
                </div>
              </>
            )}
          </NavLink>
        ))}
        <div className="w-6 h-[1px] bg-[var(--color-border-subtle)] mt-2 opacity-50" />
      </div>
    )
  }

  const renderTeamsList = () => {
    if (workspaceMode !== 'ORG' || !activeOrganization) return null
    if (teams.length === 0) return null

    return (
      <div className="flex flex-col items-center space-y-2 mb-4 w-full">
        {teams.map((t) => (
          <NavLink
            key={t.id}
            to={`/app/organizations/${activeOrganization.id}/teams/${t.id}`}
            title={t.name}
            className={({ isActive }) => cn(
              "relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 group shrink-0",
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
                <div className="relative w-6 h-6 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] flex items-center justify-center text-[11px] font-bold shrink-0">
                  {t.name?.charAt(0).toUpperCase()}
                </div>
              </>
            )}
          </NavLink>
        ))}
        <div className="w-6 h-[1px] bg-[var(--color-border-subtle)] mt-2 opacity-50" />
      </div>
    )
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--bg-subtle)]/40 backdrop-blur-xl relative z-20 w-[68px] items-center py-4 border-r border-[var(--color-border-subtle)] shadow-sm">
      
      {/* Brand & User Profile Header */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[var(--bg-hover)] transition-all duration-200 mb-4 shrink-0 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]">
            <Avatar size="sm" className="bg-[var(--accent)] text-white shadow-sm w-8 h-8">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-[var(--accent)] text-white text-[11px] font-bold">
                {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </button>
        </PopoverTrigger>
        <PopoverContent 
          side="right"
          align="start" 
          sideOffset={10}
          className="w-56 bg-[var(--bg-elevated)]/95 backdrop-blur-xl border border-[var(--color-border-subtle)] p-2 rounded-2xl shadow-xl flex flex-col gap-1 z-[9999]"
        >
          <div className="px-3 py-2">
            <Text className="text-[13px] font-bold truncate text-[var(--text-primary)] leading-tight">
              {user?.name || user?.username}
            </Text>
            <Text className="text-[11px] text-[var(--text-muted)] truncate">
              {user?.email}
            </Text>
          </div>
          <Separator className="my-1 bg-[var(--color-border-subtle)]" />
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

      {/* ═══ Workspace / Lens Switcher (Iconic) ═══ */}
      {!isSettingsMode && (
        <Popover>
          <PopoverTrigger asChild>
            <button 
              title="Switch Lens"
              className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all duration-300 shadow-sm mb-4 shrink-0 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {getWorkspaceIcon()}
            </button>
          </PopoverTrigger>
          <PopoverContent 
            side="right"
            align="start"
            sideOffset={14}
            className="w-56 p-2 rounded-2xl border-[var(--border-subtle)] bg-[var(--bg-elevated)]/95 backdrop-blur-xl shadow-xl flex flex-col gap-1 z-[9999]"
          >
            <div className="px-3 pt-1 pb-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-tertiary)]">Operating Lens</span>
            </div>
            <button 
              onClick={() => handleDropdownChange('PERSONAL')}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left",
                workspaceMode === 'PERSONAL' ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              )}
            >
              <Icons.user className="w-4 h-4" />
              <span>Personal Space</span>
            </button>
            
            {organizations.length > 0 && <Separator className="my-1 bg-[var(--color-border-subtle)]" />}
            
            {organizations.map(org => (
              <button 
                key={org.id}
                onClick={() => handleDropdownChange(`org-${org.id}`)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left",
                  workspaceMode === 'ORG' && activeOrganization?.id === org.id ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                )}
              >
                <Icons.building className="w-4 h-4" />
                <span className="truncate">{org.name}</span>
              </button>
            ))}
            
            <Separator className="my-1 bg-[var(--color-border-subtle)]" />
            
            <button 
              onClick={() => handleDropdownChange('CREWS')}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left",
                workspaceMode === 'CREWS' ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              )}
            >
              <Icons.rocket className="w-4 h-4" />
              <span>Crews</span>
            </button>
          </PopoverContent>
        </Popover>
      )}

      {/* Global Search / Command Trigger */}
      <button 
        title="Command Palette (Cmd+K)"
        className="flex items-center justify-center w-10 h-10 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200 mb-4 shrink-0 focus:outline-none"
        onClick={() => {
          // Dispatch custom event for CommandPalette to listen to
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
        }}
      >
        <Icons.search className="w-[18px] h-[18px]" strokeWidth={1.5} />
      </button>

      {/* Main Navigation */}
      <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col items-center pt-2">

        {!isSettingsMode && (
          <>
            {getSidebarSections().map((section, idx) => renderNavSection(section.items, idx))}
            {renderTeamsList()}
            {renderCrewsList()}
          </>
        )}

        {isSettingsMode && (
          <>
            <div className="pb-4 w-full flex justify-center">
              <button 
                onClick={() => navigate('/app')}
                className="flex items-center justify-center w-10 h-10 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200 border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] shadow-sm"
                title="Back to Workspace"
              >
                <Icons.chevronLeft className="w-5 h-5 text-[var(--accent)]" />
              </button>
            </div>
            {renderNavSection(settingsNavItems, 'settings')}
          </>
        )}
      </div>

    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar (Rigid Dock) */}
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

