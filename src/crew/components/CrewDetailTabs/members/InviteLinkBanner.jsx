import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { Sparkles, Check, Copy } from '@/shared/ui/Icons';

// Shareable link active alert (shown while an invite link is generated)
export function InviteLinkBanner({ inviteLink, isLinkCopied, onCopy }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 bg-[var(--bg-card)] border border-[var(--accent-border)] rounded-xl flex items-center justify-between gap-3 shadow-sm"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0" />
        <span className="text-xs text-[var(--text-muted)] font-medium shrink-0">Invite Link:</span>
        <span className="text-xs font-mono text-[var(--text-primary)] truncate">{inviteLink}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-[12px] gap-1 font-semibold shrink-0"
        onClick={onCopy}
      >
        {isLinkCopied ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
        {isLinkCopied ? 'Copied' : 'Copy Link'}
      </Button>
    </motion.div>
  );
}
