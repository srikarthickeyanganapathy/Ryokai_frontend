import React from 'react'
import { cn } from '@/shared/lib/cn'
import { Heading, Text } from '@/shared/ui/Typography'
import { AlertCircle } from 'lucide-react'

export function ErrorState({ 
  title = 'Something went wrong', 
  description = 'There was a problem loading this data. Please try again.', 
  action, 
  className,
  ...props 
}) {
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rise-in bg-[var(--danger-soft)] border border-[var(--danger)]/20 rounded-[var(--radius-lg)]',
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--danger-soft)] text-[var(--danger)] mb-4 spring-in">
        <AlertCircle className="h-6 w-6" />
      </div>
      <Heading level={4} className="mb-1 text-[var(--danger)]">{title}</Heading>
      <Text variant="muted" size="sm" className="max-w-xs mx-auto mb-4">
        {description}
      </Text>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  )
}