import React from 'react';
import { Heading, Text } from '@/shared/ui/Typography';

export function Projects({ overview }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)]">
      <Heading level={4} className="mb-4">Projects Overview</Heading>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Text variant="muted" size="xs">Progress</Text>
          <Text className="text-lg font-bold">{overview.progress}%</Text>
        </div>
        <div>
          <Text variant="muted" size="xs">Health</Text>
          <Text className="text-lg font-bold text-emerald-500">{overview.health}</Text>
        </div>
        <div>
          <Text variant="muted" size="xs">Time Left</Text>
          <Text className="text-lg font-bold">{overview.timeLeft}</Text>
        </div>
        <div>
          <Text variant="muted" size="xs">Next Milestone</Text>
          <Text className="text-sm font-medium mt-1">{overview.nextMilestone}</Text>
        </div>
      </div>
    </div>
  );
}
