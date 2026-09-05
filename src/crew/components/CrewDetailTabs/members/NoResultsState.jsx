import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';

// Filter / search empty results state
export function NoResultsState({ query, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--border-subtle)] rounded-lg">
      <Heading level={4} className="text-sm font-medium text-[var(--text-primary)]">
        No matching members
      </Heading>
      <Text variant="muted" size="sm" className="mt-1 max-w-sm">
        No one matches "{query}". Try clearing the search or filters.
      </Text>
      <Button variant="ghost" size="sm" className="mt-4 h-8 text-sm" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  );
}