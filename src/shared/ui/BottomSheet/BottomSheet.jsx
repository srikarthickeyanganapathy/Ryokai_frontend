import React, { forwardRef } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/shared/lib/cn'
import { X } from '@/shared/ui/Icons'

export const BottomSheet = DialogPrimitive.Root
export const BottomSheetTrigger = DialogPrimitive.Trigger

const BottomSheetPortal = DialogPrimitive.Portal

const BottomSheetOverlay = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-[var(--duration-base)]',
      className
    )}
    {...props}
  />
))
BottomSheetOverlay.displayName = DialogPrimitive.Overlay.displayName

export const BottomSheetContent = forwardRef(({ className, children, ...props }, ref) => (
  <BottomSheetPortal>
    <BottomSheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 max-h-[60vh] overflow-y-auto custom-scrollbar border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 shadow-2xl rounded-t-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-300 ease-out',
        className
      )}
      {...props}
    >
      <div className="flex justify-center -mt-2 mb-4">
        <div className="h-1 w-10 rounded-full bg-[var(--border-strong)]" />
      </div>
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 opacity-60 transition-opacity hover:opacity-100 focus-ring disabled:pointer-events-none text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </BottomSheetPortal>
))
BottomSheetContent.displayName = DialogPrimitive.Content.displayName

export const BottomSheetHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
)
BottomSheetHeader.displayName = 'BottomSheetHeader'

export const BottomSheetFooter = ({ className, ...props }) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4', className)} {...props} />
)
BottomSheetFooter.displayName = 'BottomSheetFooter'

export const BottomSheetTitle = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-[16px] font-semibold leading-tight tracking-[-0.012em] text-[var(--text-primary)]', className)}
    {...props}
  />
))
BottomSheetTitle.displayName = DialogPrimitive.Title.displayName

export const BottomSheetDescription = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-[13px] leading-[1.5] text-[var(--text-secondary)]', className)}
    {...props}
  />
))
BottomSheetDescription.displayName = DialogPrimitive.Description.displayName
