import React, { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'

export const Textarea = forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-[var(--radius-md)] px-3 py-2.5 text-[13px] leading-relaxed',
        'shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]',
        'transition-[border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out)]',
        'placeholder:text-[var(--text-tertiary)]',
        'hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:shadow-[var(--accent-glow)] focus-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'resize-y custom-scrollbar',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'
