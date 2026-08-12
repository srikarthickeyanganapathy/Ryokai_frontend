import { Filter } from '@/shared/ui/Icons';
import { PillNav } from '@/shared/ui/PillNav';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'near', label: 'Near Capacity' },
  { value: 'overloaded', label: 'Overloaded' },
  { value: 'available', label: 'Available' },
];

export function WorkloadFilters({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-[var(--text-muted)]" />
      <PillNav
        filters={FILTERS}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
