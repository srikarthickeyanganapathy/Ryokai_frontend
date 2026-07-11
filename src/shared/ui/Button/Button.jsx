import React, { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'
import { Slot } from '@radix-ui/react-slot'

export const buttonVariants = {
  primary: 'bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] shadow-[var(--shadow-xs)]',
  secondary: 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)]',
  ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
  outline: 'bg-transparent text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)]',
  danger: 'bg-[var(--danger)] text-white hover:brightness-110 active:brightness-95',
}

const buttonSizes = {
  xs: 'h-6 px-2 text-xs rounded-[var(--radius-xs)] gap-1',
  sm: 'h-7 px-2.5 text-xs rounded-[var(--radius-sm)] gap-1.5',
  md: 'h-8 px-3.5 text-[13px] rounded-[var(--radius-md)] gap-1.5',
  lg: 'h-10 px-4 text-sm rounded-[var(--radius-md)] gap-2',
  xl: 'h-12 px-6 text-sm rounded-[var(--radius-lg)] gap-2',
}

export const Button = forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  asChild = false,
  isLoading = false,
  disabled,
  children,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : 'button'
  const isDisabled = disabled || isLoading

  return (
    <Comp
      ref={ref}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-medium select-none',
        'transition-[background-color,border-color,color,filter] duration-[var(--duration-fast)] ease-[var(--ease-out)]',
        'focus-ring cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none',
        'active:scale-[0.985]',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {asChild ? children : (
        <>
          {isLoading && (
            <svg className="animate-spin -ml-0.5 h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {children}
        </>
      )}
    </Comp>
  )
})
Button.displayName = 'Button'

export const IconButton = forwardRef(({ className, size = 'md', ...props }, ref) => {
  const iconSizes = {
    xs: 'h-6 w-6 rounded-[var(--radius-xs)]',
    sm: 'h-7 w-7 rounded-[var(--radius-sm)]',
    md: 'h-8 w-8 rounded-[var(--radius-md)]',
    lg: 'h-10 w-10 rounded-[var(--radius-md)]',
    xl: 'h-12 w-12 rounded-[var(--radius-lg)]',
  }

  return (
    <Button
      ref={ref}
      size={size}
      className={cn('px-0 flex-shrink-0', iconSizes[size], className)}
      {...props}
    />
  )
})
IconButton.displayName = 'IconButton'