import React, { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'

export const Input = forwardRef(({ className, type, size = 'md', ...props }, ref) => {
  const inputSizes = {
    sm: 'h-7 px-2.5 text-xs rounded-[var(--radius-sm)]',
    md: 'h-8 px-3 text-[13px] rounded-[var(--radius-md)]',
    lg: 'h-10 px-3.5 text-sm rounded-[var(--radius-md)]',
  }

  return (
    <input
      type={type}
      className={cn(
        'flex w-full border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]',
        'transition-[border-color,box-shadow] duration-[var(--duration-fast)]',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-[var(--text-tertiary)]',
        'hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus-ring',
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