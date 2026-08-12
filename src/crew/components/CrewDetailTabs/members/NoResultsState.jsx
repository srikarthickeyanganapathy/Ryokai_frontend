import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Search } from '@/shared/ui/Icons';

// Filter / search empty results state
export function NoResultsState({ query, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)] p-6">
      <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center mb-3">
        <Search className="w-4 h-4 text-[var(--text-muted)]" />
      </div>
      <Heading level={4} className="text-[14px] font-semibold text-[var(--text-primary)]">
        No matching team members found
      </Heading>
      <Text variant="muted" size="sm" className="text-[12px] mt-1 max-w-sm">
        We couldn't find any members matching "{query}". Try clearing search filters.
      </Text>
      <Button
        variant="outline"
        size="sm"
        className="mt-4 h-8 text-[12px] font-semibold"
        onClick={onClear}
      >
        Clear Filters & Search
      </Button>
    </div>
  );
}
