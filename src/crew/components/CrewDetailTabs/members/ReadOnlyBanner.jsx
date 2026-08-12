import { Badge } from '@/shared/ui/Badge';
import { Info } from '@/shared/ui/Icons';

// Permission control banner — non-owners read-only notice
export function ReadOnlyBanner() {
  return (
    <div className="bg-[var(--accent-soft)]/50 border border-[var(--accent-border)] rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-[var(--accent)] shrink-0" />
        <span>
          <strong className="font-semibold text-[var(--text-primary)]">Read-Only Directory: </strong>
          You are viewing the team roster. Crew owner privileges are required to remove members or transfer ownership.
        </span>
      </div>
      <Badge variant="outline" className="text-[10px] shrink-0 font-medium">
        Member Access
      </Badge>
    </div>
  );
}
