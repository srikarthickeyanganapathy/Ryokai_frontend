import React from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { Icons } from '@/shared/ui/Icons';
import { Button } from '@/shared/ui/Button';

export function Capture() {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] flex flex-col items-center justify-center text-center">
      <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-3">
        <Icons.zap className="w-5 h-5" />
      </div>
      <Heading level={4}>Capture</Heading>
      <Text variant="muted" size="sm" className="mb-4">Quickly log ideas or tasks before they slip away.</Text>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true }))}
      >
        New Note / Task (Cmd+K)
      </Button>
    </div>
  );
}
