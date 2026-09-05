import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { Check, Copy } from '@/shared/ui/Icons';

// Shown while a shareable invite link is active
export function InviteLinkBanner({ inviteLink, isLinkCopied, onCopy }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between gap-3 py-2.5 px-4 border border-[var(--border-subtle)] rounded-lg"
    >
      <div className="flex items-center gap-2 min-w-0 text-sm">
        <span className="text-[var(--text-muted)] shrink-0">Invite link</span>
        <span className="font-mono text-[var(--text-primary)] truncate">{inviteLink}</span>
      </div>
      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 shrink-0" onClick={onCopy}>
        {isLinkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {isLinkCopied ? 'Copied' : 'Copy'}
      </Button>
    </motion.div>
  );
}