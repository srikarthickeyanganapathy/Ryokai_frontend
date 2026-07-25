import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
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
  disabledValues = [], // Values that cannot be selected
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

  const selectedOptions = options.filter(opt => value.includes(opt.value));

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
              value.map((v) => {
                const opt = options.find(o => o.value === v);
                const label = opt ? opt.label : v;
                return (
                  <Badge key={v} variant="secondary" className="flex items-center gap-1 bg-[var(--bg-subtle)] mr-1">
                    {label}
                    <div 
                      className="cursor-pointer hover:bg-[var(--bg-hover)] rounded-full p-0.5 transition-colors"
                      onPointerDown={(e) => removeOption(e, v)}
                    >
                      <X className="w-3 h-3" />
                    </div>
                  </Badge>
                );
              })
            ) : (
              <span className="text-[var(--text-tertiary)] px-1">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command className="bg-transparent" shouldFilter={!onSearch}>
          <CommandInput 
            placeholder="Search..." 
            value={inputValue} 
            onValueChange={setInputValue} 
          />
          <CommandList>
            <CommandEmpty>{loading ? "Searching..." : emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                const isDisabled = disabledValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    disabled={isDisabled}
                    onSelect={() => {
                      toggleOption(option.value);
                    }}
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
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
