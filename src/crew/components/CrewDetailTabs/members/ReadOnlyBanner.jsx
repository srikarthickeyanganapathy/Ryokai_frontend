import { Info } from '@/shared/ui/Icons';

// Non-owners see a read-only notice
export function ReadOnlyBanner() {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] pb-4 border-b border-[var(--border-subtle)]">
      <Info className="w-4 h-4 shrink-0" />
      <span>You're viewing the roster. Owner permissions are required to remove members or transfer ownership.</span>
    </div>
  );
}