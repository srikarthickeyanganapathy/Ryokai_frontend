import React from 'react';
import { Heading, Text } from '@/shared/ui/Typography';

export function Agenda({ agenda }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] h-full">
      <Heading level={4} className="mb-4">Today's Agenda</Heading>
      {agenda.length === 0 ? (
        <Text variant="muted" size="xs" className="py-4 text-center">No tasks scheduled for today.</Text>
      ) : (
        <div className="space-y-3">
          {agenda.map(item => (
            <div key={item.id} className="flex gap-4">
              <Text className="text-xs font-medium min-w-[55px] text-[var(--text-secondary)]">{item.time}</Text>
              <div className="flex-1 pb-2 border-b border-[var(--color-border-subtle)] last:border-0">
                <Text className="text-sm font-semibold">{item.title}</Text>
                <Text variant="muted" size="xs" className="uppercase text-[10px] text-[var(--accent)]">{item.type}</Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
