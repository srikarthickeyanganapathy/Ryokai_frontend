import { ArrowUpDown } from '@/shared/ui/Icons';
import { PillNav } from '@/shared/ui/PillNav';
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
      <PillNav filters={FILTERS} value={filter} onChange={setFilter} counts={counts} />

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
