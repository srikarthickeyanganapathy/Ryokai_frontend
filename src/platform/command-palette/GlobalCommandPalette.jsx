import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const { setWorkspaceMode } = useWorkspace()

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
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
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
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Lens (Workspace)">
          <CommandItem onSelect={() => runCommand(() => {
            setWorkspaceMode('PERSONAL')
            navigate('/app')
          })}>
            <Icons.user className="mr-2 h-4 w-4" />
            <span>Switch to Personal</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => {
            setWorkspaceMode('CREWS')
            navigate('/app')
          })}>
            <Icons.rocket className="mr-2 h-4 w-4" />
            <span>Switch to Crews</span>
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
            <span>Security</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
