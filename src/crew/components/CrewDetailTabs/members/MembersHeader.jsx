import { Heading, Text } from '@/shared/ui/Typography';

// Directory header -- title + seat/status subtitle, no icon chrome
export function MembersHeader({ totalCount, memberCap, activeCount }) {
  return (
    <div className="min-w-0">
      <Heading level={3} className="text-base font-medium text-[var(--text-primary)]">
        Crew members
      </Heading>
      <Text variant="muted" className="text-sm mt-0.5">
        {totalCount} of {memberCap} seats filled · {activeCount} active now
      </Text>
    </div>
  );
}