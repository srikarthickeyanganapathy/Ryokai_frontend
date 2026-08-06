import React, { forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

export const Input = forwardRef(({ className, type, size = 'md', ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false)

  const inputSizes = {
    sm: 'h-7 px-2.5 text-xs rounded-[var(--radius-sm)]',
    md: 'h-8 px-3 text-[13px] rounded-[var(--radius-md)]',
    lg: 'h-10 px-3.5 text-sm rounded-[var(--radius-md)]',
  }

  return (
    <motion.div className="relative w-full" whileTap={{ scale: 0.998 }}>
      <input
        type={type}
        className={cn(
          'flex w-full border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]',
          'shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]',
          'transition-[border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out)]',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-[var(--text-tertiary)]',
          'hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:shadow-[var(--accent-glow)] focus-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          inputSizes[size],
          className
        )}
        ref={ref}
        {...props}
        onFocus={(e) => { setIsFocused(true); props.onFocus?.(e) }}
        onBlur={(e) => { setIsFocused(false); props.onBlur?.(e) }}
      />
      {/* Animated focus underline bar */}
      <motion.div
        className="absolute bottom-0 left-1/2 h-[1.5px] bg-[var(--accent)] rounded-full pointer-events-none"
        initial={false}
        animate={{
          width: isFocused ? 'calc(100% - 2px)' : '0%',
          left: isFocused ? '1px' : '50%',
          opacity: isFocused ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
      />
    </motion.div>
  )
})
Input.displayName = 'Input'
