import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronsUpDown } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/Command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/Popover'

export function Combobox({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select option...",
  emptyText = "No option found.",
  className
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between bg-[var(--bg-elevated)] font-normal text-[var(--text-primary)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[var(--bg-hover)] border-[var(--border-default)] transition-colors duration-[var(--duration-base)]", className)}
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            >
              <Command className="bg-transparent rounded-[var(--radius-md)] overflow-hidden">
                <CommandInput placeholder={placeholder} />
                <CommandList>
                  <CommandEmpty>{emptyText}</CommandEmpty>
                  <CommandGroup>
                    {options.map((option, idx) => (
                      <motion.div
                        key={option.value}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02, duration: 0.15 }}
                      >
                        <CommandItem
                          value={option.value}
                          onSelect={(currentValue) => {
                            onChange(currentValue === value ? "" : currentValue)
                            setOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 transition-opacity duration-[var(--duration-fast)]",
                              value === option.value ? "opacity-100 text-[var(--accent)]" : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      </motion.div>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  )
}
