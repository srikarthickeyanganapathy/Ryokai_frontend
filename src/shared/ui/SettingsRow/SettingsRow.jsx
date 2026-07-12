import React from 'react'
import { Text } from '@/shared/ui/Typography'
import { cn } from '@/shared/lib/cn'

export function SettingsRow({ label, description, children, className }) {
  return (
    <div className={cn("flex items-center justify-between py-4 border-b border-[var(--border-subtle)] last:border-0", className)}>
      <div className="flex flex-col space-y-1 mr-4">
        <Text className="text-[14px] font-medium text-[var(--text-primary)]">
          {label}
        </Text>
        {description && (
          <Text variant="muted" className="text-[13px] leading-relaxed">
            {description}
          </Text>
        )}
      </div>
      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  )
}
