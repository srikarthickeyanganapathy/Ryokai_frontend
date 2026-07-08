import React, { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'

export const Input = forwardRef(({ className, type, size = 'md', ...props }, ref) => {
  const inputSizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  }

  return (
    <input
      type={type}
      className={cn(
        'flex w-full rounded-[var(--radius-input,8px)] border border-[var(--color-border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-[var(--text-secondary)]',
        'focus-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        inputSizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'
