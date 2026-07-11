import React, { forwardRef } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/shared/lib/cn'

export const TooltipProvider = TooltipPrimitive.Provider

export const Tooltip = TooltipPrimitive.Root

export const TooltipTrigger = TooltipPrimitive.Trigger

export const TooltipContent = forwardRef(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border-default)] px-2 py-1 text-[11px] font-medium text-[var(--text-primary)] shadow-[var(--shadow-md)] animate-in fade-in-0 zoom-in-[0.98] duration-[var(--duration-fast)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.98] data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName