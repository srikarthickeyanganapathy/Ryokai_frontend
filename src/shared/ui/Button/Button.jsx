import React, { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'
import { motion } from 'framer-motion'
import { Slot } from '@radix-ui/react-slot'

export const buttonVariants = {
  primary: 'bg-[var(--accent-cyan)] text-white hover:bg-[var(--accent-cyan)]/90 shadow-sm',
  secondary: 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--color-border-default)] hover:bg-[var(--bg-glass)]',
  ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
  outline: 'bg-transparent text-[var(--text-primary)] border border-[var(--color-border-strong)] hover:bg-[var(--bg-elevated)]',
  danger: 'bg-[var(--error)] text-white hover:bg-[var(--error)]/90',
}

const buttonSizes = {
  xs: 'h-7 px-2 text-xs rounded-sm',
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-10 px-4 text-sm rounded-md',
  lg: 'h-12 px-6 text-base rounded-lg',
  xl: 'h-14 px-8 text-lg rounded-xl',
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
    <motion.div
      whileHover={!isDisabled ? { scale: 1.01 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className="inline-flex"
    >
      <Comp
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors focus-ring cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        {...props}
      >
        {asChild ? children : (
          <>
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {children}
          </>
        )}
      </Comp>
    </motion.div>
  )
})
Button.displayName = 'Button'

export const IconButton = forwardRef(({ className, size = 'md', ...props }, ref) => {
  const iconSizes = {
    xs: 'h-7 w-7 rounded-sm',
    sm: 'h-8 w-8 rounded-md',
    md: 'h-10 w-10 rounded-md',
    lg: 'h-12 w-12 rounded-lg',
    xl: 'h-14 w-14 rounded-xl',
  }
  
  return (
    <Button
      ref={ref}
      size="md"
      className={cn('px-0 flex-shrink-0', iconSizes[size], className)}
      {...props}
    />
  )
})
IconButton.displayName = 'IconButton'
