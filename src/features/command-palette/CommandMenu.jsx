import React, { useState, useEffect } from 'react'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/shared/ui/Command'
import { Icons } from '@/shared/ui/Icons'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/app/providers/ThemeProvider'

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { setTheme } = useTheme()

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
    <>
      <div 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-2.5 h-8 text-[13px] text-[var(--text-tertiary)] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)] transition-colors w-full max-w-sm"
      >
        <Icons.search className="w-3.5 h-3.5" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded-[var(--radius-xs)] border border-[var(--border-default)] bg-[var(--bg-subtle)] px-1.5 font-mono text-[10px] font-medium text-[var(--text-tertiary)] shadow-[var(--inset-highlight-soft)]">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => navigate('/app'))}>
              <Icons.dashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/app/tasks'))}>
              <Icons.tasks className="mr-2 h-4 w-4" />
              <span>Tasks</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/app/projects'))}>
              <Icons.projects className="mr-2 h-4 w-4" />
              <span>Projects</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <Icons.sun className="mr-2 h-4 w-4" />
              <span>Light Theme</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <Icons.moon className="mr-2 h-4 w-4" />
              <span>Dark Theme</span>
            </CommandItem>
          </CommandGroup>
          
        </CommandList>
      </CommandDialog>
    </>
  )
}