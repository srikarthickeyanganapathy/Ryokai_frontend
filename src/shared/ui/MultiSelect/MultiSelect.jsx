import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronsUpDown, X } from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/Command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/Popover';

export function MultiSelect({
  options = [],
  value = [],
  onChange,
  onSearch,
  placeholder = "Select options...",
  emptyText = "No options found.",
  loading = false,
  className,
  disabledValues = [],
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const timerRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (onSearch) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSearch(inputValue);
      }, 300);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [inputValue, onSearch]);

  const toggleOption = (optionValue) => {
    if (disabledValues.includes(optionValue)) return;
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (e, optionValue) => {
    e.stopPropagation();
    if (disabledValues.includes(optionValue)) return;
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between bg-[var(--bg-elevated)] font-normal text-[var(--text-primary)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[var(--bg-hover)] border-[var(--border-default)] transition-colors duration-[var(--duration-base)] min-h-10 h-auto p-2", className)}
        >
          <div className="flex flex-wrap gap-1 items-center overflow-hidden">
            {value.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {value.map((v) => {
                  const opt = options.find(o => o.value === v);
                  const label = opt ? opt.label : v;
                  return (
                    <motion.div
                      key={v}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Badge variant="secondary" className="flex items-center gap-1 bg-[var(--bg-subtle)] mr-1">
                        {label}
                        <div 
                          className="cursor-pointer hover:bg-[var(--bg-hover)] rounded-full p-0.5 transition-colors"
                          onPointerDown={(e) => removeOption(e, v)}
                        >
                          <X className="w-3 h-3" />
                        </div>
                      </Badge>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            ) : (
              <span className="text-[var(--text-tertiary)] px-1">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            >
              <Command className="bg-transparent rounded-[var(--radius-md)] overflow-hidden" shouldFilter={!onSearch}>
                <CommandInput 
                  placeholder="Search..." 
                  value={inputValue} 
                  onValueChange={setInputValue} 
                />
                <CommandList>
                  <CommandEmpty>{loading ? "Searching..." : emptyText}</CommandEmpty>
                  <CommandGroup>
                    {options.map((option, idx) => {
                      const isSelected = value.includes(option.value);
                      const isDisabled = disabledValues.includes(option.value);
                      return (
                        <motion.div
                          key={option.value}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02, duration: 0.15 }}
                        >
                          <CommandItem
                            value={option.value}
                            disabled={isDisabled}
                            onSelect={() => toggleOption(option.value)}
                            className={cn(isDisabled && "opacity-50 cursor-not-allowed")}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 transition-opacity duration-[var(--duration-fast)]",
                                isSelected ? "opacity-100 text-[var(--accent)]" : "opacity-0"
                              )}
                            />
                            {option.label}
                          </CommandItem>
                        </motion.div>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}
