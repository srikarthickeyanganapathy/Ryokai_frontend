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
        'flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50 bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-lg',
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--error)]/10 text-[var(--error)] mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <Heading level={4} className="mb-1 text-[var(--error)]">{title}</Heading>
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
