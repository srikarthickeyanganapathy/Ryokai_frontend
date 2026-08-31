import React from 'react'
import { Card, CardContent } from '@/shared/ui/Card'
import { Text } from '@/shared/ui/Typography'
import { cn } from '@/shared/lib/cn'

/**
 * StatCard
 * - size="lg"  -> hero metrics (top of page, 1-2 max)
 * - size="md"  -> default, grouped secondary metrics
 * - tone="attention" -> subtly flags cards that need action (overdue, revisions)
 */
export function StatCard({ title, value, description, icon: Icon, trend, size = 'md', tone = 'default' }) {
  const isLg = size === 'lg'
  const isAttention = tone === 'attention'

  return (
    <Card
      className={cn(
        'relative overflow-hidden bg-[var(--bg-elevated)] border backdrop-blur-xl transition-colors duration-200',
        isAttention
          ? 'border-[var(--danger)]/25 hover:border-[var(--danger)]/40'
          : 'border-[var(--color-border-subtle)]/50 hover:border-[var(--accent)]/30'
      )}
    >
      <CardContent className={cn('flex items-start justify-between gap-3', isLg ? 'p-5' : 'p-4')}>
        <div className="min-w-0">
          <Text
            size="xs"
            className={cn('font-medium tracking-tight truncate', isLg ? 'text-[13px]' : 'text-[12px]')}
            variant="muted"
          >
            {title}
          </Text>

          <div
            className={cn(
              'font-bold tabular-nums tracking-tight mt-1',
              isLg ? 'text-[34px] text-[var(--text-primary)]' : 'text-[22px]',
              !isLg && isAttention ? 'text-[var(--danger)]' : !isLg && 'text-[var(--text-primary)]'
            )}
          >
            {value}
          </div>

          {(description || trend !== undefined) && (
            <div className="mt-1.5 flex items-center gap-1.5">
              {trend !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
                    trend > 0
                      ? 'bg-[var(--success-soft)] text-[var(--success)]'
                      : trend < 0
                      ? 'bg-[var(--danger-soft)] text-[var(--danger)]'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                  )}
                >
                  {trend > 0 ? ' ' : trend < 0 ? ' ' : '->'} {Math.abs(trend)}%
                </span>
              )}
              {description && <span className="text-[11px] text-[var(--text-muted)]">{description}</span>}
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              'shrink-0 rounded-lg flex items-center justify-center',
              isLg ? 'w-10 h-10' : 'w-8 h-8',
              isAttention ? 'bg-[var(--danger-soft)]' : 'bg-[var(--bg-subtle)]/60'
            )}
          >
            <Icon className={cn(isLg ? 'w-5 h-5' : 'w-4 h-4', isAttention ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]')} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}