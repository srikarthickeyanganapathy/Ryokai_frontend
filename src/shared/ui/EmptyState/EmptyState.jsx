import React from 'react'
import { cn } from '@/shared/lib/cn'
import { Heading, Text } from '@/shared/ui/Typography'

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className,
  ...props 
}) {
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50',
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] mb-4">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <Heading level={4} className="mb-1">{title}</Heading>
      {description && (
        <Text variant="muted" size="sm" className="max-w-xs mx-auto mb-4">
          {description}
        </Text>
      )}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  )
}
