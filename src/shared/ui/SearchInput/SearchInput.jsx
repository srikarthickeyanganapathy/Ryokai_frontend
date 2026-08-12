import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Input } from '@/shared/ui/Input'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'

/**
 * SearchInput
 * ─────────────────────────────────────────────────────────
 * Canonical search input with search icon and clear button.
 * Supports optional debounce to avoid excessive callbacks.
 *
 * @param {string} value - Controlled search value
 * @param {(value: string) => void} onChange - Callback when value changes (debounced)
 * @param {string} [placeholder="Search..."] - Placeholder text
 * @param {number} [debounceMs=300] - Debounce delay in milliseconds (0 = no debounce)
 * @param {string} [className] - Additional container classes
 */
export function SearchInput({
  value = '',
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
}) {
  const [localValue, setLocalValue] = useState(value)
  const timerRef = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const debouncedOnChange = useCallback(
    (nextValue) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (debounceMs <= 0) {
        onChangeRef.current(nextValue)
        return
      }
      timerRef.current = setTimeout(() => {
        onChangeRef.current(nextValue)
      }, debounceMs)
    },
    [debounceMs]
  )

  const handleChange = useCallback(
    (e) => {
      const next = e.target.value
      setLocalValue(next)
      debouncedOnChange(next)
    },
    [debouncedOnChange]
  )

  const handleClear = useCallback(() => {
    setLocalValue('')
    // Fire immediately on clear, no debounce
    if (timerRef.current) clearTimeout(timerRef.current)
    onChangeRef.current('')
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div className={cn('relative', className)}>
      <Icons.search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-8 pr-8"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          aria-label="Clear search"
        >
          <Icons.x className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

export default SearchInput
