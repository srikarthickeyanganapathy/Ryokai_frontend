import React from 'react';
import { motion } from 'framer-motion';
import { Heading } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { AlertTriangle } from 'lucide-react';

export function CriticalPermissionDialog({ perm, roleName, open, onConfirm, onCancel }) {
  if (!open || !perm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }} className="bg-[var(--bg-elevated)] w-full max-w-sm rounded-xl border border-[var(--border-subtle)] shadow-2xl overflow-hidden">
        <div className="bg-[var(--danger-soft)] p-6 flex flex-col items-center text-center gap-3 border-b border-[var(--border-subtle)]">
          <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] text-[var(--danger)] flex items-center justify-center shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <Heading level={4} className="text-[var(--danger)] text-[14px] font-semibold tracking-tight">Critical Permission</Heading>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-3 bg-[var(--bg-subtle)] rounded-md border border-[var(--border-subtle)]">
            <div className="text-[13px] font-semibold text-[var(--text-primary)] tracking-tight">{perm.name}</div>
            <span className="text-[10px] text-[var(--text-muted)] font-mono mt-1 block">{perm.code}</span>
          </div>
          <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{perm.description}</p>
          <p className="text-[11px] text-[var(--text-muted)]">Are you sure you want to grant this privileged access to <strong className="text-[var(--text-primary)]">{roleName}</strong>?</p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 text-[12px] h-8" onClick={onCancel}>Cancel</Button>
            <Button variant="danger" className="flex-1 text-[12px] h-8" onClick={onConfirm}>Enable access</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}