import React from 'react';
import { Heading, Text } from '@/shared/ui/Typography';

export function Insights({ summary }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)]">
      <Heading level={4} className="mb-4">Today's Insights</Heading>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Text variant="muted" size="sm">Completed Tasks</Text>
          <Text className="font-semibold">{summary.completed}</Text>
        </div>
        <div className="flex justify-between items-center">
          <Text variant="muted" size="sm">Remaining Tasks</Text>
          <Text className="font-semibold">{summary.remaining}</Text>
        </div>
        <div className="flex justify-between items-center">
          <Text variant="muted" size="sm">Focus Score</Text>
          <Text className="font-semibold text-[var(--accent)]">{summary.focusScore}</Text>
        </div>
        <div className="flex justify-between items-center">
          <Text variant="muted" size="sm">Est. Finish</Text>
          <Text className="font-semibold">{summary.estimatedFinish}</Text>
        </div>
      </div>
    </div>
  );
}
