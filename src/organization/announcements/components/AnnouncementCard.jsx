import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/shared/ui/Avatar';
import { Icons } from '@/shared/ui/Icons';
import { formatRelative } from 'date-fns';
import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/Typography';

const PRIORITY_CONFIG = {
  CRITICAL: { border: 'border-l-[var(--danger)]', bg: 'bg-[var(--danger-soft)]', text: 'text-[var(--danger)]', label: 'Critical' },
  HIGH: { border: 'border-l-[var(--warning)]', bg: 'bg-[var(--warning-soft)]', text: 'text-[var(--warning)]', label: 'High' },
  MEDIUM: { border: 'border-l-[var(--accent)]', bg: 'bg-[var(--accent-soft)]', text: 'text-[var(--accent)]', label: 'Medium' },
  LOW: { border: 'border-l-[var(--text-muted)]', bg: 'bg-[var(--bg-subtle)]', text: 'text-[var(--text-muted)]', label: 'Low' },
};

export function AnnouncementCard({ announcement, onRead, onOpen, onPin, onDelete, canManage, isPinned, index = 0 }) {
  const priority = announcement.priority || 'MEDIUM';
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
  
  // Use shared Icons instead of direct lucide imports
  const AudienceIcon = announcement.audience === 'HR Team' || announcement.audience === 'Engineering' ? Icons.users : Icons.globe;
  const isExpired = announcement.expiresAt && new Date(announcement.expiresAt) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: Math.min(index * 0.04, 0.3) }}
      onClick={onOpen}
      className={cn(
        "group relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-xl shadow-sm transition-all duration-200 cursor-pointer overflow-hidden border-l-4 p-5 flex flex-col gap-3",
        config.border,
        !announcement.isRead && "ring-1 ring-[var(--accent-border)]"
      )}
    >
      {/* Quick Actions (Visible on Hover) */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-elevated)]/80 backdrop-blur-sm p-1 rounded-lg border border-[var(--border-subtle)] z-10">
        {!announcement.isRead && (
          <button onClick={(e) => { e.stopPropagation(); onRead(); }} className="p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-secondary)] hover:text-[var(--accent)]" title="Mark as read">
            <Icons.CheckCheck className="w-3.5 h-3.5" />
          </button>
        )}
        {canManage && (
          <button onClick={(e) => { e.stopPropagation(); onPin(); }} className={cn("p-1.5 hover:bg-[var(--bg-hover)] rounded", isPinned ? "text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--accent)]")} title="Pin">
            <Icons.pin className="w-3.5 h-3.5" />
          </button>
        )}
        {canManage && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-secondary)] hover:text-[var(--danger)]" title="Delete">
            <Icons.trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Header Badges */}
      <div className="flex items-center gap-2">
        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1", config.bg, config.text)}>
          <Icons.shieldAlert className="w-3 h-3" /> {config.label}
        </span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--bg-subtle)] text-[var(--text-secondary)] flex items-center gap-1 capitalize">
          <AudienceIcon className="w-3 h-3" /> {announcement.audience || 'Organization'}
        </span>
        {isPinned && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--accent-soft)] text-[var(--accent)] flex items-center gap-1">
            <Icons.pin className="w-3 h-3" /> Pinned
          </span>
        )}
      </div>

      <div className="flex-1">
        <h4 className="text-[15px] font-bold text-[var(--text-primary)] leading-snug line-clamp-2 pr-12">
          {announcement.title}
        </h4>
        <Text size="sm" variant="muted" className="mt-2 line-clamp-2">
          {announcement.content}
        </Text>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Avatar size="xs">
            <AvatarFallback>{announcement.author?.username?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
          </Avatar>
          <Text size="xs" className="font-medium text-[var(--text-secondary)]">{announcement.author?.username || 'Admin'}</Text>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-mono">
          <Icons.clock className="w-3 h-3" />
          {formatRelative(new Date(announcement.createdAt), new Date())}
        </div>
      </div>
    </motion.div>
  );
}
