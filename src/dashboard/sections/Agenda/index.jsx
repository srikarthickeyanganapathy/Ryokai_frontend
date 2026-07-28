import React from 'react';
import { Heading, Text } from '@/shared/ui/Typography';

export function Agenda({ agenda }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] h-full">
      <Heading level={4} className="mb-4">Today's Agenda</Heading>
      <div className="space-y-3">
        {agenda.map(item => (
          <div key={item.id} className="flex gap-4">
            <Text className="text-sm font-medium min-w-[45px] text-[var(--text-secondary)]">{item.time}</Text>
            <div className="flex-1 pb-3 border-b border-[var(--color-border-subtle)]">
              <Text className="text-sm font-semibold">{item.title}</Text>
              <Text variant="muted" size="xs" className="uppercase">{item.type}</Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
