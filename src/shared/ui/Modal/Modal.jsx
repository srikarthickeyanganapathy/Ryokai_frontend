import React, { forwardRef } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/shared/lib/cn'
import { X } from 'lucide-react'

export const Modal = DialogPrimitive.Root

export const ModalTrigger = DialogPrimitive.Trigger

const ModalPortal = DialogPrimitive.Portal

const ModalOverlay = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-[var(--bg-overlay)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-[var(--duration-base)]',
      className
    )}
    {...props}
  />
))
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName

export const ModalContent = forwardRef(({ className, children, ...props }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-lg)] duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98] sm:rounded-[var(--radius-lg)]',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-[var(--radius-xs)] opacity-60 transition-opacity hover:opacity-100 focus-ring disabled:pointer-events-none text-[var(--text-primary)]">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </ModalPortal>
))
ModalContent.displayName = DialogPrimitive.Content.displayName

export const ModalHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
)
ModalHeader.displayName = 'ModalHeader'

export const ModalFooter = ({ className, ...props }) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
)
ModalFooter.displayName = 'ModalFooter'

export const ModalTitle = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight text-[var(--text-primary)]', className)}
    {...props}
  />
))
ModalTitle.displayName = DialogPrimitive.Title.displayName

export const ModalDescription = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-[var(--text-secondary)]', className)}
    {...props}
  />
))
ModalDescription.displayName = DialogPrimitive.Description.displayName