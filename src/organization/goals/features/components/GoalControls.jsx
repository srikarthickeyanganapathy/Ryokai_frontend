import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/shared/ui/Select';

const FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'ON_TRACK', label: 'On Track' },
  { value: 'AT_RISK', label: 'At Risk' },
  { value: 'OFF_TRACK', label: 'Off Track' },
  { value: 'ACHIEVED', label: 'Achieved' },
];

const SORT_OPTIONS = [
  { value: 'progress_desc', label: 'Highest Progress' },
  { value: 'progress_asc', label: 'Lowest Progress' },
  { value: 'ending_soon', label: 'Ending Soon' },
  { value: 'recently_updated', label: 'Recently Updated' },
  { value: 'alphabetical', label: 'Alphabetical' },
];

export function GoalControls({ filter, setFilter, sortBy, setSortBy, counts }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
      {/* Filter tabs */}
      <div className="flex items-center gap-0.5 p-0.5 bg-[var(--bg-subtle)] rounded-lg border border-[var(--color-border-subtle)]">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5',
              filter === f.value
                ? 'bg-[var(--bg-base)] text-[var(--text-base)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-base)]',
            )}
          >
            {f.label}
            {counts && counts[f.value] !== undefined && (
              <span
                className={cn(
                  'text-[10px] font-mono px-1.5 rounded-full',
                  filter === f.value
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'bg-[var(--color-border-subtle)] text-[var(--text-muted)]',
                )}
              >
                {counts[f.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sort dropdown via Premium Select */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
        <Select value={sortBy} onValueChange={(val) => setSortBy(val)}>
          <SelectTrigger className="w-[180px] h-8 text-xs bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] hover:border-[var(--accent-border)]">
            <SelectValue placeholder="Sort goals by..." />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
