import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/shared/ui/Command'
import { Icons } from '@/shared/ui/Icons'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'

export function GlobalCommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { setWorkspaceMode, organizations = [], setActiveOrganization } = useWorkspace()
  
  const isTasksPage = location.pathname.startsWith('/app/tasks')

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = (command) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search workspace..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {isTasksPage && (
          <>
            <CommandGroup heading="Task Actions">
              <CommandItem onSelect={() => runCommand(() => navigate('/app/tasks?create=true'))}>
                <Icons.plus className="mr-2 h-4 w-4 text-blue-500" />
                <span>Create New Task</span>
                <CommandShortcut>C</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate('/app/tasks?view=list'))}>
                <Icons.list className="mr-2 h-4 w-4" />
                <span>Switch to List View</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate('/app/tasks?view=kanban'))}>
                <Icons.kanban className="mr-2 h-4 w-4" />
                <span>Switch to Kanban View</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate('/app/tasks?view=nebula'))}>
                <Icons.network className="mr-2 h-4 w-4" />
                <span>Switch to Nebula View</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate('/app'))}>
            <Icons.layoutDashboard className="mr-2 h-4 w-4" />
            <span>Mission Control</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/tasks'))}>
            <Icons.listTodo className="mr-2 h-4 w-4" />
            <span>Tasks</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/projects'))}>
            <Icons.folderClosed className="mr-2 h-4 w-4" />
            <span>Projects</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/directory'))}>
            <Icons.users className="mr-2 h-4 w-4" />
            <span>Members & Directory</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/teams'))}>
            <Icons.users className="mr-2 h-4 w-4" />
            <span>Teams</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/goals'))}>
            <Icons.target className="mr-2 h-4 w-4" />
            <span>Goals</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/leave-requests'))}>
            <Icons.calendar className="mr-2 h-4 w-4" />
            <span>Leave Requests & Exits</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/announcements'))}>
            <Icons.megaphone className="mr-2 h-4 w-4" />
            <span>Announcements</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/roles-permissions'))}>
            <Icons.shield className="mr-2 h-4 w-4" />
            <span>Roles & Permissions</span>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Lens (Workspace Mode)">
          <CommandItem onSelect={() => runCommand(() => {
            setWorkspaceMode('PERSONAL')
            navigate('/app')
          })}>
            <Icons.user className="mr-2 h-4 w-4" />
            <span>Switch to Personal Space</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => {
            setWorkspaceMode('CREWS')
            navigate('/app')
          })}>
            <Icons.rocket className="mr-2 h-4 w-4" />
            <span>Switch to Crews Space</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => {
            if (organizations && organizations.length > 0) {
              setWorkspaceMode('ORG')
              setActiveOrganization(organizations[0])
              navigate('/app')
            } else {
              navigate('/app/organizations')
            }
          })}>
            <Icons.building className="mr-2 h-4 w-4 text-[var(--accent)]" />
            <span>Switch to Organization Workspace</span>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => navigate('/app/settings/profile'))}>
            <Icons.user className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/settings/security'))}>
            <Icons.shield className="mr-2 h-4 w-4" />
            <span>Security Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
