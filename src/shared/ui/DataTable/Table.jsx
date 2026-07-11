import React, { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'

export const Table = forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
))
Table.displayName = 'Table'

export const TableHeader = forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b border-[var(--color-border-default)]', className)} {...props} />
))
TableHeader.displayName = 'TableHeader'

export const TableBody = forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
))
TableBody.displayName = 'TableBody'

export const TableFooter = forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('bg-[var(--bg-subtle)] font-medium text-[var(--text-primary)]', className)}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

export const TableRow = forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-[var(--color-border-subtle)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-[var(--bg-hover)] data-[state=selected]:bg-[var(--accent-soft)]',
      className
    )}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

export const TableHead = forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-9 px-3 text-left align-middle text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--text-tertiary)] [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

export const TableCell = forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('px-3 py-2.5 align-middle text-[13px] text-[var(--text-primary)] [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

export const TableCaption = forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-[var(--text-secondary)]', className)}
    {...props}
  />
))
TableCaption.displayName = 'TableCaption'