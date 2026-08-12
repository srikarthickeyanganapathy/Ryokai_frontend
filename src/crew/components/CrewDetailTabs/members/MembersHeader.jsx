import { Heading, Text } from '@/shared/ui/Typography';
import { Users } from '@/shared/ui/Icons';

// Directory header — icon chip + title + seat/subtitle stats (teams design language)
export function MembersHeader({ totalCount, memberCap, activeCount }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center border border-[var(--accent-border)] shrink-0">
        <Users className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <Heading level={3} className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)]">
          Crew Members
        </Heading>
        <Text variant="muted" className="text-[12px] mt-0.5">
          {totalCount} of {memberCap} seats filled ·{' '}
          <span className="text-[var(--success)] font-medium inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
            {activeCount} active now
          </span>
        </Text>
      </div>
    </div>
  );
}
