import { MemberUtilizationCard } from './MemberUtilizationCard';

export function MemberUtilizationGrid({
  rows,
  threshold,
  history,
  expandedCards,
  onToggleCard,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
  );
}
