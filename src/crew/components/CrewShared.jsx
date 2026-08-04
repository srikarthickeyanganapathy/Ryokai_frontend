import React from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'
import { Progress } from '@/shared/ui/Progress'
import { EmptyState } from '@/shared/ui/EmptyState'

export { Progress, EmptyState }

export function ProgressBar({ value, max, className }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : (value || 0)
  return <Progress value={pct} className={className} />
}

export function LockIcon(props) { return (<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" /></svg>) }
export function InsightsIcon(props) { return (<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M2 13.5V9M6 13.5V5M10 13.5V7.5M14 13.5V2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>) }
export function ChatIcon(props) { return (<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M2 3.5h12a1 1 0 011 1v6a1 1 0 01-1 1H6l-3 2.5v-2.5H2a1 1 0 01-1-1v-6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>) }
export function FolderIcon(props) { return (<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M1.5 4a1 1 0 011-1h3l1.2 1.5H13.5a1 1 0 011 1V12a1 1 0 01-1 1h-11a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>) }
export function ChecklistIcon(props) { return (<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M2 4h1.5M2 8h1.5M2 12h1.5M6 4h8M6 8h8M6 12h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>) }
export function AlertIcon(props) { return (<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M8 1.5l7 12.5H1L8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="M8 6.5v3M8 11.5h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>) }
export function CheckIcon(props) { return (<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>) }
export function WhiteboardIcon(props) { return (<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M2 3h12v8H2V3zM6 14h4M8 11v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>) }

export function PermissionButton({ allowed, reason, onClick, children, variant = 'outline', size = 'sm', className, icon: Icon }) {
  if (!allowed) {
    return (
      <Button type="button" variant="outline" size={size} disabled title={reason} className={cn('opacity-60 cursor-not-allowed gap-1.5 text-[12px] h-8', className)}>
        <LockIcon className="w-3 h-3" /> {children}
      </Button>
    )
  }
  return (
    <Button type="button" variant={variant} size={size} onClick={onClick} className={cn('gap-1.5 text-[12px] h-8 shadow-sm', className)}>
      {Icon && <Icon className="w-3 h-3" />} {children}
    </Button>
  )
}



export function SummaryStat({ label, value, icon: Icon, accent }) {
  return (
    <div className="rounded-lg bg-[var(--bg-subtle)]/50 p-4 border border-[var(--border-subtle)]">
      <div className="flex items-center gap-1.5 mb-2">
        {Icon && <Icon className={cn('w-3.5 h-3.5', accent === 'success' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')} />}
        <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">{label}</span>
      </div>
      <div className="text-xl font-bold tabular-nums text-[var(--text-primary)] tracking-tight">{value}</div>
    </div>
  )
}

export function AnalyticsStat({ label, value, tone }) {
  return (
    <div className="rounded-lg bg-[var(--bg-subtle)]/50 p-4 border border-[var(--border-subtle)]">
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2">{label}</div>
      <div className={cn('text-lg font-bold tabular-nums tracking-tight', tone === 'warning' ? 'text-[var(--warning)]' : 'text-[var(--text-primary)]')}>{value}</div>
    </div>
  )
}
