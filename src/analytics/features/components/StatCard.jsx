import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card'
import { Text } from '@/shared/ui/Typography'
import { cn } from '@/shared/lib/cn'
import { motion } from 'framer-motion'

export function StatCard({ title, value, description, icon: Icon, trend }) {
  return (
    <Card className="group relative overflow-hidden bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)]/50 backdrop-blur-xl shadow-sm transition-all duration-300 ease-out hover:border-[var(--accent)]/30 hover:shadow-lg hover:-translate-y-1">
      
      {/* Background Gradient Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className="text-[13px] font-medium tracking-tight text-[var(--text-secondary)]">
          {title}
        </CardTitle>
        {Icon && (
          <div className="p-2 rounded-lg bg-[var(--bg-subtle)]/50 transition-colors duration-300 group-hover:bg-[var(--accent)]/10">
            <Icon className="w-4 h-4 text-[var(--text-muted)] transition-colors duration-300 group-hover:text-[var(--accent)]" />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="text-[28px] font-bold text-[var(--text-primary)] tabular-nums tracking-tight">
          {value}
        </div>
        
        {(description || trend !== undefined) && (
          <Text size="xs" className="mt-1 flex items-center gap-1.5" variant="muted">
            {trend !== undefined && (
              <span className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                trend > 0 ? "bg-[var(--success-soft)] text-[var(--success)]" 
                : trend < 0 ? "bg-[var(--danger-soft)] text-[var(--danger)]" 
                : "bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
              )}>
                {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
              </span>
            )}
            <span className="text-[11px] opacity-80">{description}</span>
          </Text>
        )}
      </CardContent>
    </Card>
  )
}