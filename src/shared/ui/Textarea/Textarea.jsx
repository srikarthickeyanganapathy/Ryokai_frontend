import React, { forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

export const Textarea = forwardRef(({ className, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <motion.div className="relative w-full" whileTap={{ scale: 0.998 }}>
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
        onFocus={(e) => { setIsFocused(true); props.onFocus?.(e) }}
        onBlur={(e) => { setIsFocused(false); props.onBlur?.(e) }}
      />
      {/* Animated focus underline bar */}
      <motion.div
        className="absolute bottom-0.5 left-1/2 h-[1.5px] bg-[var(--accent)] rounded-full pointer-events-none"
        initial={false}
        animate={{
          width: isFocused ? 'calc(100% - 4px)' : '0%',
          left: isFocused ? '2px' : '50%',
          opacity: isFocused ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
      />
    </motion.div>
  )
})
Textarea.displayName = 'Textarea'
