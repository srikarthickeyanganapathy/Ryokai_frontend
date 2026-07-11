import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card'
import { Text } from '@/shared/ui/Typography'
import { cn } from '@/shared/lib/cn'

export function StatCard({ title, value, description, icon: Icon, trend }) {
  return (
    <Card className="transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out)] hover:border-[var(--accent-border)] hover:shadow-[var(--accent-glow)] hover:-translate-y-[1px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
          {title}
        </CardTitle>
        {Icon && <Icon className="w-4 h-4 text-[var(--text-muted)] transition-colors group-hover:text-[var(--accent)]" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
          {value}
        </div>
        {(description || trend !== undefined) && (
          <Text size="xs" className="mt-1 flex items-center gap-1" variant="muted">
            {trend !== undefined && (
              <span className={cn(
                "font-medium",
                trend > 0 ? "text-[var(--success)]" : trend < 0 ? "text-[var(--danger)]" : "text-[var(--text-secondary)]"
              )}>
                {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
              </span>
            )}
            {description}
          </Text>
        )}
      </CardContent>
    </Card>
  )
}