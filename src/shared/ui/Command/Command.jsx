import React, { forwardRef } from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import { Search } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Modal, ModalContent } from '@/shared/ui/Modal'

export const Command = forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] text-[var(--text-primary)]',
      className
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

export const CommandDialog = ({ children, ...props }) => {
  return (
    <Modal {...props}>
      <ModalContent className="overflow-hidden p-0 border-0 shadow-[var(--accent-glow-lg),var(--inset-highlight)] max-w-xl top-[20%] translate-y-0 data-[state=open]:duration-[var(--duration-slow)] data-[state=open]:zoom-in-[0.97]">
        <Command className="glass-panel rounded-[var(--radius-lg)] [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-11 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4 bg-transparent">
          {children}
        </Command>
      </ModalContent>
    </Modal>
  )
}

export const CommandInput = forwardRef(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-[var(--border-subtle)] px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-11 w-full bg-transparent py-3 text-[13px] outline-none placeholder:text-[var(--text-tertiary)] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  </div>
))
CommandInput.displayName = CommandPrimitive.Input.displayName

export const CommandList = forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
))
CommandList.displayName = CommandPrimitive.List.displayName

export const CommandEmpty = forwardRef((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm text-[var(--text-secondary)]"
    {...props}
  />
))
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

export const CommandGroup = forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-[var(--text-primary)] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.06em] [&_[cmdk-group-heading]]:text-[var(--text-tertiary)]',
      className
    )}
    {...props}
  />
))
CommandGroup.displayName = CommandPrimitive.Group.displayName

export const CommandSeparator = forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 h-px bg-[var(--color-border-subtle)]', className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

export const CommandItem = forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-[13px] text-[var(--text-secondary)] outline-none transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] aria-selected:bg-[var(--accent-soft)] aria-selected:text-[var(--text-primary)] aria-selected:translate-x-[1px] data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  />
))
CommandItem.displayName = CommandPrimitive.Item.displayName

export const CommandShortcut = ({ className, ...props }) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest text-[var(--text-secondary)]', className)}
      {...props}
    />
  )
}
CommandShortcut.displayName = 'CommandShortcut'