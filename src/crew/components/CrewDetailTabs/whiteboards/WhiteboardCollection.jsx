import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { ImmersiveEmptyState } from '@/shared/ui/Immersive';
import { Pencil, Plus, Search, AlertTriangle, RefreshCw } from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';

// UX STATE HANDLERS (7 UX STATES)
// Renders the board collection across all UX states: loading skeleton,
// error, empty crew, no search/filter match, and default grid/list view.
export function WhiteboardCollection({
  isLoading,
  isError,
  error,
  onRetry,
  whiteboards,
  filteredBoards,
  viewMode,
  onOpenCreate,
  searchQuery,
  activeFilter,
  onResetFilters,
  children
}) {
  // State 1: Loading Skeleton
  if (isLoading) {
    return (
      <div className={cn(
        "grid gap-4",
        viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
      )}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div 
            key={i} 
            className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden animate-pulse h-[200px]"
          >
            <div className="h-32 bg-[var(--bg-subtle)]" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 bg-[var(--bg-hover)] rounded-md" />
              <div className="h-3 w-1/2 bg-[var(--bg-hover)] rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // State 4: Error State
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-[var(--danger-border)]/40 rounded-xl bg-[var(--danger-soft)]/20">
        <div className="w-12 h-12 rounded-xl bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center mb-3 border border-[var(--danger-border)]/40">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <Heading level={4} className="text-[14px] font-bold text-[var(--text-primary)] mb-1">
          Failed to Load Whiteboards
        </Heading>
        <Text className="text-[12px] text-[var(--text-secondary)] max-w-md mb-4">
          {error?.message || 'An error occurred while communicating with the canvas server.'}
        </Text>
        <Button size="sm" variant="outline" onClick={() => onRetry()} className="gap-2 text-[12px] h-8 font-medium">
          <RefreshCw className="w-3.5 h-3.5" /> Retry Fetch
        </Button>
      </div>
    );
  }

  // State 2: Empty State (No Whiteboards in Crew)
  if (whiteboards.length === 0) {
    return (
      <ImmersiveEmptyState
        icon={Pencil}
        title="Start Visualizing Ideas Together"
        description="Create your crew's first interactive whiteboard to sketch diagrams, map user flows, or conduct sprint retrospectives in real-time."
        action={(
          <Button size="sm" onClick={() => onOpenCreate('blank')} className="gap-2 h-8 text-[12px] font-semibold">
            <Plus className="w-4 h-4" /> Create Blank Canvas
          </Button>
        )}
      />
    );
  }

  // State 3 & 7: No Search / Filter Match State
  if (filteredBoards.length === 0) {
    return (
      <ImmersiveEmptyState
        icon={Search}
        title="No Whiteboards Found"
        description={searchQuery 
          ? `No whiteboards match "${searchQuery}". Try a different keyword.` 
          : activeFilter === 'starred' 
            ? 'You have not favorited any whiteboards yet. Click the star icon on any board to keep it handy.' 
            : 'No active live whiteboard sessions at the moment.'}
        action={(searchQuery || activeFilter !== 'all') ? (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onResetFilters()} 
            className="text-[12px] h-8 font-medium"
          >
            Reset Filters
          </Button>
        ) : null}
      />
    );
  }

  // State 5: Default Content Grid/List View
  return (
    <div className={cn(
      "grid gap-4",
      viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
    )}>
      {children}
    </div>
  );
}
