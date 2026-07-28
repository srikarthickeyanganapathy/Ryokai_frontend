import React from 'react';
import { Heading, Text } from '@/shared/ui/Typography';

export function MyWork({ groups }) {
  const categories = [
    { key: 'inProgress', label: 'In Progress' },
    { key: 'waiting', label: 'Waiting' },
    { key: 'review', label: 'In Review' },
    { key: 'blocked', label: 'Blocked' }
  ];

  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] h-full">
      <Heading level={4} className="mb-4">My Work</Heading>
      <div className="grid grid-cols-2 gap-4">
        {categories.map(cat => (
          <div key={cat.key} className="p-3 bg-[var(--bg-subtle)] rounded-lg">
            <Text variant="muted" size="xs" className="uppercase tracking-wider">{cat.label}</Text>
            <Text className="text-2xl font-bold mt-1">{(groups[cat.key] || []).length}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}
