import { SearchInput } from '@/shared/ui/SearchInput';
import { Star, Grid, List } from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';

// Search, Filter & View-Mode Control Toolbar
export function WhiteboardToolbar({
  activeFilter,
  onFilterChange,
  totalBoards,
  favoritesCount,
  liveCount,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[12px] font-medium overflow-x-auto">
        <button
          onClick={() => onFilterChange('all')}
          className={cn(
            "px-3 py-1 rounded-md transition-all whitespace-nowrap",
            activeFilter === 'all' 
              ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm font-semibold" 
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          All Boards ({totalBoards})
        </button>

        <button
          onClick={() => onFilterChange('starred')}
          className={cn(
            "px-3 py-1 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap",
            activeFilter === 'starred' 
              ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm font-semibold" 
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          <Star className={cn("w-3 h-3", favoritesCount > 0 && "text-amber-500 fill-amber-500")} />
          Starred ({favoritesCount})
        </button>

        <button
          onClick={() => onFilterChange('live')}
          className={cn(
            "px-3 py-1 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap",
            activeFilter === 'live' 
              ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm font-semibold" 
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
          Live Now ({liveCount})
        </button>
      </div>

      {/* Search & Sort & View Mode */}
      <div className="flex items-center gap-2">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search whiteboards..."
          debounceMs={0}
          className="flex-1 sm:w-60"
        />

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="h-8 px-2.5 text-[12px] font-medium bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
        >
          <option value="recent">Recently Edited</option>
          <option value="name">Title (A-Z)</option>
          <option value="oldest">Date Created</option>
        </select>

        <div className="flex items-center p-0.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === 'grid' ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
            title="Grid View"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === 'list' ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
