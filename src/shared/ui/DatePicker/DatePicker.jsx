import React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Calendar } from './Calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/Popover'

export function DatePicker({ date, setDate, className }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal bg-[var(--bg-elevated)] border-[var(--border-default)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]',
            !date && 'text-[var(--text-secondary)]',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 shadow-[var(--shadow-lg),var(--inset-highlight)]" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}