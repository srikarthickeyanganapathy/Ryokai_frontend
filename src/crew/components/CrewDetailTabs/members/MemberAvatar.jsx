import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';
import { Crown, ShieldCheck, UserCheck } from '@/shared/ui/Icons';
import { PRESENCE_CONFIG, getAvatarGradient, getMemberInitial, getMemberPresence } from './utils';

/* ══════════════════════════════════════════════════════
   Shared member presentational primitives
   (RoleBadge / PresenceChip / MemberAvatar)
   ══════════════════════════════════════════════════════ */

// Role badge chip (shared Badge component — teams design language)
export function RoleBadge({ member }) {
  const isOwner = member.role === 'CREATOR' || member.role === 'OWNER';

  if (isOwner) {
    return (
      <Badge variant="warning" size="xs" className="gap-1 font-mono uppercase tracking-wider">
        <Crown className="w-3 h-3" />
        Owner
      </Badge>
    );
  }
  if (member.role === 'ADMIN') {
    return (
      <Badge variant="primary" size="xs" className="gap-1 font-mono uppercase tracking-wider">
        <ShieldCheck className="w-3 h-3" />
        Admin
      </Badge>
    );
  }
  return (
    <Badge variant="outline" size="xs" className="gap-1 font-mono uppercase tracking-wider text-[var(--text-secondary)]">
      <UserCheck className="w-3 h-3" />
      Member
    </Badge>
  );
}

// Presence status dot + label
export function PresenceChip({ presence }) {
  const cfg = PRESENCE_CONFIG[presence] || PRESENCE_CONFIG.offline;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[10px] font-medium', cfg.textColor)}>
      <span className={cn('w-2 h-2 rounded-full', cfg.dotBg)} />
      {cfg.label}
    </span>
  );
}

// Hue-gradient avatar with presence dot (teams design language)
export function MemberAvatar({ member, size = 'md', className }) {
  const presence = getMemberPresence(member);
  const cfg = PRESENCE_CONFIG[presence] || PRESENCE_CONFIG.offline;

  const sizes = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
  };
  const dotSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className={cn('relative shrink-0', className)}>
      <div
        className={cn(
          'rounded-xl flex items-center justify-center font-bold text-white shadow-sm border border-white/10',
          sizes[size]
        )}
        style={{ background: getAvatarGradient(member) }}
      >
        {getMemberInitial(member)}
      </div>
      <span
        className={cn(
          'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-[var(--bg-card)]',
          dotSizes[size],
          cfg.dotBg
        )}
      />
    </div>
  );
}
