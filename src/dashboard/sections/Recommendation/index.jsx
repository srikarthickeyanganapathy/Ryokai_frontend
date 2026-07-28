import React from 'react';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Heading, Text } from '@/shared/ui/Typography';

export function RecommendationHero({ recommendation }) {
  if (!recommendation) {
    return (
      <div className="p-6 rounded-2xl glass-panel border border-[var(--color-border-subtle)]">
        <Heading level={4}>You're all caught up!</Heading>
        <Text variant="muted">No pending recommendations.</Text>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden p-6 rounded-2xl glass-panel border border-[var(--color-border-subtle)] bg-gradient-to-br from-[var(--bg-elevated)]/90 via-[var(--bg-elevated)]/60 to-[var(--bg-subtle)]/40 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
            <Icons.sparkles className="w-3.5 h-3.5" />
            <span>Next Best Action</span>
          </div>
          <Heading level={3} className="text-xl font-semibold tracking-tight">
            {recommendation.title}
          </Heading>
          <Text variant="muted" size="sm">{recommendation.description}</Text>
        </div>
        <Button className="bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]">
          {recommendation.action}
        </Button>
      </div>
    </div>
  );
}
