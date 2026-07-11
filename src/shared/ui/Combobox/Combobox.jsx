import React, { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
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
        <Command className="bg-transparent">
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
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
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}