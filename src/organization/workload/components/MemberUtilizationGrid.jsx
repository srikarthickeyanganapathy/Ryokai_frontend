import { Heading } from '@/shared/ui/Typography';
import { MemberUtilizationCard } from './MemberUtilizationCard';

export function MemberUtilizationGrid({
  rows,
  threshold,
  history,
  expandedCards,
  onToggleCard,
}) {
  return (
    <div className="space-y-3">
      <Heading
        level={2}
        className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]"
      >
        Member Utilization
      </Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map((row) => {
          const userId = row.user?.id || row.user?.username;
          return (
            <MemberUtilizationCard
              key={userId}
              row={row}
              threshold={threshold}
              history={history}
              expanded={!!expandedCards[userId]}
              onToggle={() => onToggleCard(userId)}
            />
          );
        })}
      </div>
    </div>
  );
}
