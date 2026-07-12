import React, { forwardRef } from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export const Checkbox = forwardRef(({ className, indeterminate, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer relative shrink-0 w-[16px] h-[16px] rounded-[5px] border transition-[background-color,border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out)]',
      'border-[var(--border-default)] bg-[var(--bg-elevated)] shadow-[inset_0_1px_1px_rgba(0,0,0,0.03)]',
      'hover:border-[var(--border-strong)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-1',
      'data-[state=checked]:bg-[var(--accent)] data-[state=checked]:border-[var(--accent)]',
      'data-[state=indeterminate]:bg-[var(--accent)] data-[state=indeterminate]:border-[var(--accent)]',
      'disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        'flex items-center justify-center text-white',
        'data-[state=checked]:animate-in data-[state=checked]:zoom-in-75 data-[state=checked]:duration-[var(--duration-fast)]'
      )}
    >
      {indeterminate ? <Minus className="w-[11px] h-[11px]" strokeWidth={3} /> : <Check className="w-[11px] h-[11px]" strokeWidth={3} />}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = 'Checkbox'