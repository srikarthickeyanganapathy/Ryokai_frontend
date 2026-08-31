import React from 'react'
import { Search, X, LayoutGrid, List } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { PillNav } from '@/shared/ui/PillNav'
import './entity-card.css'

/**
 * EntityFilterBar -- shared search + filter row for entity pages.
 * Uses the app's canonical PillNav for chips + view switching.
 * - search / onSearch: internal input (with clear). Pass `searchSlot` to override (e.g. SearchPlugin).
 * - chips: [{ id, label, count }]; activeChip / onChip drive selection.
 * - view / onView: optional grid|list switch; omit to hide.
 * - children: extra trailing controls (buttons etc).
 */
export function EntityFilterBar({
  search,
  onSearch,
  searchPlaceholder = 'Search...',
  searchSlot,
  chips = [],
  activeChip,
  onChip,
  view,
  onView,
  children,
  className,
}) {
  return (
    <div className={cn('ec-filterbar', className)}>
      {searchSlot ?? (
        <div className="ec-search">
          <Search />
          <input
            type="text"
            value={search ?? ''}
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
          {search ? (
            <button type="button" onClick={() => onSearch?.('')} title="Clear search" aria-label="Clear search">
              <X />
            </button>
          ) : null}
        </div>
      )}
      {chips.length > 0 && (
        <PillNav
          items={chips.map((c) => ({ value: c.id, label: c.label }))}
          counts={Object.fromEntries(chips.filter((c) => c.count != null).map((c) => [c.id, c.count]))}
          value={activeChip}
          onChange={onChip}
        />
      )}
      {view && onView && (
        <PillNav
          items={[
            { value: 'grid', label: 'Grid', icon: LayoutGrid },
            { value: 'list', label: 'List', icon: List },
          ]}
          value={view}
          onChange={onView}
        />
      )}
      {children}
    </div>
  )
}

export default EntityFilterBar
