import React, { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'

export const Heading = forwardRef(function Heading({ 
  level = 1, 
  children, 
  className, 
  variant = 'default',
  ...props 
}, ref) {
  const Tag = `h${level}`
  
  // Restrained scale in the vein of Linear/Vercel — headings inside a dense
  // product UI don't need Tailwind's default display sizes. Weight and
  // negative tracking do the work instead of raw size.
  const sizes = {
    1: 'text-[28px] md:text-[34px] font-semibold tracking-[-0.02em] leading-[1.15]',
    2: 'text-2xl md:text-[26px] font-semibold tracking-[-0.018em] leading-[1.2]',
    3: 'text-xl md:text-[22px] font-semibold tracking-[-0.014em] leading-[1.25]',
    4: 'text-lg font-semibold tracking-[-0.012em] leading-[1.3]',
    5: 'text-[15px] font-semibold tracking-[-0.008em] leading-[1.35]',
    6: 'text-[13px] font-semibold tracking-[-0.004em] leading-[1.4] uppercase text-[var(--text-secondary)]',
  }

  const variants = {
    default: 'text-[var(--text-primary)]',
    muted: 'text-[var(--text-secondary)]',
    gradient: 'text-gradient',
  }

  return (
    <Tag 
      ref={ref}
      className={cn(
        sizes[level],
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
})