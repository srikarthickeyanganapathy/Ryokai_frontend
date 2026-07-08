import React from 'react'
import { cn } from '@/shared/lib/cn'

export function Heading({ 
  level = 1, 
  children, 
  className, 
  variant = 'default',
  ...props 
}) {
  const Tag = `h${level}`
  
  const sizes = {
    1: 'text-4xl md:text-5xl font-extrabold tracking-tight',
    2: 'text-3xl md:text-4xl font-bold tracking-tight',
    3: 'text-2xl md:text-3xl font-semibold tracking-tight',
    4: 'text-xl md:text-2xl font-semibold tracking-tight',
    5: 'text-lg md:text-xl font-semibold tracking-tight',
    6: 'text-base md:text-lg font-semibold tracking-tight',
  }

  const variants = {
    default: 'text-[var(--text-primary)]',
    muted: 'text-[var(--text-secondary)]',
    gradient: 'text-gradient',
  }

  return (
    <Tag 
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
}
