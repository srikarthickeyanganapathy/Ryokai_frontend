import React from 'react';
import { motion } from 'framer-motion';
import { Heading } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { AlertTriangle } from 'lucide-react';

export function CriticalPermissionDialog({ perm, roleName, open, onConfirm, onCancel }) {
  if (!open || !perm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[var(--bg-card)] w-full max-w-sm rounded-2xl border border-[var(--danger-border)] shadow-2xl overflow-hidden"
      >
        <div className="bg-[var(--danger-soft)] p-5 flex flex-col items-center text-center gap-3 border-b border-[var(--danger-border)]">
          <div className="w-12 h-12 rounded-full bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center ring-1 ring-[var(--danger-border)]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <Heading level={4} className="text-[var(--danger)]">Critical permission</Heading>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
            <div className="text-sm font-semibold text-[var(--text-primary)]">{perm.name}</div>
            <span className="text-[10px] text-[var(--text-muted)] font-mono mt-1 block">{perm.code}</span>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{perm.description}</p>
          <p className="text-xs text-[var(--text-muted)]">
            Are you sure you want to grant this privileged access to <strong>{roleName}</strong>?
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={onConfirm}>Enable access</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
