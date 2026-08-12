import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { usePermissions } from '@/identity';
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '../../features/hooks/useAnnouncements';
import { Heading, Text } from '@/shared/ui/Typography';
import { Icons } from '@/shared/ui/Icons';
import { formatRelative, isToday, isYesterday } from 'date-fns';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog';
import { SearchPlugin } from '@/shared/workspace-framework';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { AnnouncementDrawer } from '../components/AnnouncementDrawer';
import { CreateAnnouncementModal } from '../components/CreateAnnouncementModal';
import { PageShell, PageHero, PageToolbar, PageContent } from '@/shared/ui/PageShell';
import { PageState } from '@/shared/ui/PageState';

export function AnnouncementsPage() {
  const { activeOrganization } = useWorkspace();
  const { canManageAnnouncements } = usePermissions();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const orgId = activeOrganization?.id;

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);

  // Page is intentionally simplified for this command center layout to avoid pagination complexity for now,
  // or we just fetch page 0 with a larger size.
  const { data: announcementsData, isLoading } = useAnnouncements(orgId, { size: 50 });
  const deleteMutation = useDeleteAnnouncement(orgId);

  const rawAnnouncements = announcementsData?.content || announcementsData || [];

  // Local State for Read/Pinned status (simulating backend persistence)
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ryokai_read_announcements') || '[]'); } catch { return []; }
  });
  const [pinnedIds, setPinnedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ryokai_pinned_announcements') || '[]'); } catch { return []; }
  });

  const announcements = useMemo(() => {
    return rawAnnouncements.map(ann => ({
      ...ann,
      isRead: readIds.includes(ann.id),
      isPinned: pinnedIds.includes(ann.id),
    }));
  }, [rawAnnouncements, readIds, pinnedIds]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(ann => {
      const matchesSearch = !search || ann.title?.toLowerCase().includes(search.toLowerCase()) || ann.content?.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (activeFilter === 'UNREAD') return !ann.isRead;
      if (activeFilter === 'READ') return ann.isRead;
      if (activeFilter === 'PINNED') return ann.isPinned;
      if (activeFilter === 'HIGH_PRIORITY') return ann.priority === 'HIGH' || ann.priority === 'CRITICAL';
      return true;
    });
  }, [announcements, search, activeFilter]);

  const handleDelete = async (id) => {
    if (await confirm({ title: 'Delete announcement?', danger: true })) {
      deleteMutation.mutate(id);
    }
  };

  const handlePin = (id) => {
    setPinnedIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleRead = (id) => {
    setReadIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  // Persist read/pinned status for demo purposes
  React.useEffect(() => {
    localStorage.setItem('ryokai_read_announcements', JSON.stringify(readIds));
  }, [readIds]);

  React.useEffect(() => {
    localStorage.setItem('ryokai_pinned_announcements', JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  const pageState = isLoading ? 'loading' : 'ready';

  return (
    <PageShell maxWidth="default">
      <PageHero
        title="Announcements"
        subtitle="Official organizational news, release updates, and team notices."
        eyebrow="Command Center"
      >
        {canManageAnnouncements && (
          <Button size="sm" className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Icons.plus className="w-4 h-4" />
            New Broadcast
          </Button>
        )}
      </PageHero>

      <PageToolbar>
        <SearchPlugin
          value={search}
          onChange={setSearch}
          placeholder="Search announcements..."
          className="w-full max-w-sm"
        />
        <div className="flex gap-2">
          <Button variant={activeFilter === 'ALL' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('ALL')}>All</Button>
          <Button variant={activeFilter === 'UNREAD' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('UNREAD')}>Unread</Button>
          <Button variant={activeFilter === 'PINNED' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('PINNED')}>Pinned</Button>
          <Button variant={activeFilter === 'HIGH_PRIORITY' ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter('HIGH_PRIORITY')}>Priority</Button>
        </div>
      </PageToolbar>

      <PageContent>
        <PageState
          state={pageState}
          moduleId="announcements"
          stateProps={{ loadingVariant: 'cards', onAction: canManageAnnouncements ? () => setIsCreateOpen(true) : undefined }}
        >
          {filteredAnnouncements.length === 0 && !isLoading && announcements.length > 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Megaphone className="w-10 h-10 text-[var(--text-tertiary)] mb-3" strokeWidth={1.5} />
              <p className="text-sm font-medium text-[var(--text-secondary)]">No matching announcements</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Try adjusting your filters or search terms.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredAnnouncements.map((ann, idx) => (
                <AnnouncementCard
                  key={ann.id}
                  announcement={ann}
                  index={idx}
                  isPinned={ann.isPinned}
                  canManage={canManageAnnouncements}
                  onRead={() => handleRead(ann.id)}
                  onPin={() => handlePin(ann.id)}
                  onDelete={() => handleDelete(ann.id)}
                  onOpen={() => { setActiveAnnouncement(ann); handleRead(ann.id); }}
                />
              ))}
            </AnimatePresence>
          </div>
        </PageState>
      </PageContent>

      <CreateAnnouncementModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} orgId={orgId} />
      <AnnouncementDrawer
        isOpen={!!activeAnnouncement}
        onClose={() => setActiveAnnouncement(null)}
        announcement={activeAnnouncement}
        canManage={canManageAnnouncements}
        onPin={() => { if (activeAnnouncement) handlePin(activeAnnouncement.id); }}
        onDelete={() => { if (activeAnnouncement) { handleDelete(activeAnnouncement.id); setActiveAnnouncement(null); } }}
      />
      {confirmDialog}
    </PageShell>
  );
}