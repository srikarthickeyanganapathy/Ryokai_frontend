import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { cn } from '@/shared/lib/cn'
import { buttonVariants } from '@/shared/ui/Button/Button'

export function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-[13px] font-semibold tracking-[-0.01em]',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants.outline,
          'h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 rounded-[var(--radius-sm)]'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-[var(--text-tertiary)] rounded-md w-9 font-medium text-[11px] uppercase tracking-[0.04em]',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-[var(--bg-subtle)]/50 [&:has([aria-selected])]:bg-[var(--bg-subtle)] first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(
          buttonVariants.ghost,
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-[var(--radius-sm)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]'
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-[var(--accent)] text-white shadow-[0_0_10px_var(--accent)] hover:bg-[var(--accent-hover)] hover:text-white focus:bg-[var(--accent)] focus:text-white',
        day_today: 'bg-[var(--bg-hover)] text-[var(--text-primary)] font-semibold',
        day_outside:
          'day-outside text-[var(--text-secondary)] opacity-50 aria-selected:bg-[var(--bg-subtle)]/50 aria-selected:text-[var(--text-secondary)] aria-selected:opacity-30',
        day_disabled: 'text-[var(--text-secondary)] opacity-50',
        day_range_middle:
          'aria-selected:bg-[var(--bg-subtle)] aria-selected:text-[var(--text-primary)]',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'