import React from 'react'
import { motion } from 'framer-motion'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'
import { Separator } from '@/shared/ui/Separator'
import { cn } from '@/shared/lib/cn'

/**
 * DropdownMenu
 * ---
 * Canonical dropdown/context menu for 3-dot (kebab) actions,
 * right-click menus, and inline action menus.
 *
 * @param {React.ReactNode} trigger - Trigger element (e.g., an IconButton)
 * @param {Array<{label: string, icon?: React.ElementType, onClick: () => void, danger?: boolean, disabled?: boolean, separator?: "before"}>} items - Menu items
 * @param {"start"|"center"|"end"} [align="end"] - Horizontal alignment relative to trigger
 * @param {"top"|"bottom"} [side="bottom"] - Which side of the trigger to open on
 * @param {number} [sideOffset=4] - Offset from trigger
 * @param {string} [className] - Additional content classes
 * @param {boolean} [open] - Controlled open state
 * @param {(open: boolean) => void} [onOpenChange] - Open state change handler
 */
export function DropdownMenu({
  trigger,
  items,
  align = 'end',
  side = 'bottom',
  sideOffset = 4,
  className,
  open,
  onOpenChange,
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn('w-48 p-1', className)}
      >
        {items.map((item, i) => (
          <React.Fragment key={`${item.label}-${i}`}>
            {item.separator === 'before' && i > 0 && (
              <Separator className="my-1" />
            )}
            <motion.button
              type="button"
              onClick={item.onClick}
              disabled={item.disabled}
              whileTap={item.disabled ? undefined : { scale: 0.98 }}
              className={cn(
                'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors text-left',
                item.danger
                  ? 'text-[var(--danger)] hover:bg-[var(--danger-soft)]'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
                item.disabled && 'opacity-40 cursor-not-allowed'
              )}
            >
              {item.icon && (
                <item.icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              {item.label}
            </motion.button>
          </React.Fragment>
        ))}
      </PopoverContent>
    </Popover>
  )
}

export default DropdownMenu
