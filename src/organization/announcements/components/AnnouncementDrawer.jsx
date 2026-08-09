import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/shared/ui/Drawer';
import { Button } from '@/shared/ui/Button';
import { Avatar, AvatarFallback } from '@/shared/ui/Avatar';
import { Icons } from '@/shared/ui/Icons';
import { format, formatRelative } from 'date-fns';
import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/Typography';
import { MarkdownPreviewer } from '@/shared/ui/MarkdownPreviewer';

const PRIORITY_CONFIG = {
  CRITICAL: { bg: 'bg-[var(--danger-soft)]', text: 'text-[var(--danger)]', label: 'Critical' },
  HIGH: { bg: 'bg-[var(--warning-soft)]', text: 'text-[var(--warning)]', label: 'High' },
  MEDIUM: { bg: 'bg-[var(--accent-soft)]', text: 'text-[var(--accent)]', label: 'Medium' },
  LOW: { bg: 'bg-[var(--bg-subtle)]', text: 'text-[var(--text-muted)]', label: 'Low' },
};

export function AnnouncementDrawer({ announcement, isOpen, onClose, onPin, onDelete, canManage }) {
  if (!announcement) return null;
  
  const priority = announcement.priority || 'MEDIUM';
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
  const AudienceIcon = announcement.audience === 'HR Team' || announcement.audience === 'Engineering' ? Icons.users : Icons.globe;
  const isExpired = announcement.expiresAt && new Date(announcement.expiresAt) < new Date();

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="sm:max-w-lg bg-[var(--bg-elevated)] p-6 flex flex-col">
        <DrawerHeader className="border-b border-[var(--border-subtle)] pb-4 text-left">
          <div className="flex items-center gap-2 mb-3">
            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1", config.bg, config.text)}>
              <Icons.shieldAlert className="w-3 h-3" /> {config.label}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--bg-subtle)] text-[var(--text-secondary)] flex items-center gap-1 capitalize">
              <AudienceIcon className="w-3 h-3" /> {announcement.audience || 'Organization'}
            </span>
            {announcement.isPinned && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--accent-soft)] text-[var(--accent)] flex items-center gap-1">
                <Icons.pin className="w-3 h-3" /> Pinned
              </span>
            )}
          </div>
          <DrawerTitle className="text-lg font-bold tracking-tight">{announcement.title}</DrawerTitle>
          <DrawerDescription className="flex items-center gap-2 mt-2">
            <Avatar size="xs">
              <AvatarFallback>{announcement.author?.username?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
            </Avatar>
            <Text size="xs" className="font-medium">{announcement.author?.username || 'Admin'}</Text>
            <span className="text-[var(--text-muted)]">•</span>
            <Text size="xs" variant="muted" className="flex items-center gap-1">
              <Icons.clock className="w-3 h-3" />
              {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
            </Text>
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <MarkdownPreviewer content={announcement.content} className="text-[var(--text-primary)]" />
          
          {announcement.expiresAt && (
            <div className={cn("mt-6 p-3 rounded-lg border flex items-center gap-2 text-xs", isExpired ? "bg-[var(--danger-soft)] border-[var(--danger-border)] text-[var(--danger)]" : "bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)]")}>
              <Icons.clock className="w-3.5 h-3.5" />
              {isExpired ? `Expired ${formatRelative(new Date(announcement.expiresAt), new Date())}` : `Expires ${formatRelative(new Date(announcement.expiresAt), new Date())}`}
            </div>
          )}

          {/* Attachments Section (UI Placeholder) */}
          <div className="mt-6">
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Attachments</Text>
            <div className="border border-dashed border-[var(--border-subtle)] rounded-lg p-3 flex items-center gap-3 bg-[var(--bg-subtle)]/30">
              <div className="w-9 h-9 rounded bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center">
                <Icons.paperclip className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <Text className="text-xs font-medium text-[var(--text-primary)]">Agenda.pdf</Text>
                <Text size="xs" variant="muted">2.4 MB</Text>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Icons.download className="w-4 h-4 text-[var(--text-secondary)]" />
              </Button>
            </div>
          </div>
        </div>
        
        {canManage && (
          <div className="pt-4 mt-auto border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
            <Button variant="outline" className="w-full gap-2" onClick={onPin}>
              <Icons.pin className="w-4 h-4" /> {announcement.isPinned ? "Unpin" : "Pin"}
            </Button>
            <Button variant="danger" className="w-full gap-2" onClick={onDelete}>
              <Icons.trash2 className="w-4 h-4" /> Delete
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
