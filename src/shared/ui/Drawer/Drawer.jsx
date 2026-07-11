import React, { forwardRef } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/shared/lib/cn'
import { X } from 'lucide-react'

export const Drawer = DialogPrimitive.Root

export const DrawerTrigger = DialogPrimitive.Trigger

const DrawerPortal = DialogPrimitive.Portal

const DrawerOverlay = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-[2px] transition-opacity duration-[var(--duration-slow)] ease-[var(--ease-out)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))
DrawerOverlay.displayName = DialogPrimitive.Overlay.displayName

export const DrawerContent = forwardRef(({ className, children, side = 'right', ...props }, ref) => {
  const sideVariants = {
    right: 'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
    left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
  }

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-50 gap-4 bg-[var(--bg-elevated)] border-[var(--border-subtle)] p-6 shadow-[var(--shadow-lg),var(--inset-highlight-soft)] ease-[var(--ease-spring)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-[var(--duration-base)] data-[state=open]:duration-[var(--duration-slower)]',
          sideVariants[side],
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-[var(--radius-xs)] opacity-70 transition-opacity duration-[var(--duration-fast)] hover:opacity-100 hover:bg-[var(--bg-hover)] focus-ring disabled:pointer-events-none text-[var(--text-primary)] p-1">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DrawerPortal>
  )
})
DrawerContent.displayName = DialogPrimitive.Content.displayName

export const DrawerHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
)
DrawerHeader.displayName = 'DrawerHeader'

export const DrawerFooter = ({ className, ...props }) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
)
DrawerFooter.displayName = 'DrawerFooter'

export const DrawerTitle = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-[16px] font-semibold leading-tight tracking-[-0.012em] text-[var(--text-primary)]', className)}
    {...props}
  />
))
DrawerTitle.displayName = DialogPrimitive.Title.displayName

export const DrawerDescription = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-[13px] leading-[1.5] text-[var(--text-secondary)]', className)}
    {...props}
  />
))
DrawerDescription.displayName = DialogPrimitive.Description.displayName