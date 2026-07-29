import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { usePermissions } from '@/identity';
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '../features/hooks/useAnnouncements';
import { Heading, Text, Label } from '@/shared/ui/Typography';
import { Megaphone, Plus, Trash2, Clock, Loader2 } from 'lucide-react';
import { formatRelative } from 'date-fns';
import { useAuth } from '@/identity';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog';
import { PageHeader } from '@/shared/ui/PageHeader';
import {
  WorkspaceShell,
  ManagementLayout,
  PageStateContainer,
  FrameworkEmptyState,
} from '@/shared/workspace-framework';

export function AnnouncementsPage() {
  const { activeOrganization } = useWorkspace();
  const { user } = useAuth();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();
  
  // Do not rely on usePermissions().userOrg here, use the active org context.
  const { canManageAnnouncements } = usePermissions();
  
  const orgId = activeOrganization?.id;
  const { data: announcementsPage, isLoading } = useAnnouncements(orgId, { page: 0, size: 20 });
  const deleteMutation = useDeleteAnnouncement(orgId);
  
  const announcements = announcementsPage?.content || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!activeOrganization) return null;

  const handleDelete = async (id) => {
    if (await confirm({ title: 'Are you sure you want to delete this announcement?', danger: true })) {
      deleteMutation.mutate(id);
    }
  };

  const pageState = isLoading ? 'loading' : announcements.length === 0 ? 'empty' : 'ready';

  return (
    <WorkspaceShell maxWidth="narrow">
      <ManagementLayout
        header={
          <PageHeader
            eyebrow="Announcements"
            meta={`${activeOrganization.name} broadcasts`}
            title="Broadcasts & Updates"
            subtitle="Official organizational news, release updates, and team notices."
            actions={
              canManageAnnouncements ? (
                <Button size="sm" className="gap-2" onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  New Broadcast
                </Button>
              ) : null
            }
          />
        }
      >
        <PageStateContainer
          state={pageState}
          loadingConfig={{ variant: 'cards' }}
          emptyConfig={{
            icon: Megaphone,
            title: 'No announcements yet',
            description: 'When an admin posts an update, it will appear here.',
            actionLabel: canManageAnnouncements ? 'Create first announcement' : undefined,
            onAction: canManageAnnouncements ? () => setIsModalOpen(true) : undefined,
          }}
        >
          <div className="space-y-4">
            <AnimatePresence>
              {announcements.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-xl p-6 shadow-sm transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <Heading level={4} className="text-lg font-semibold text-[var(--text-primary)]">
                        {announcement.title}
                      </Heading>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
                        <span className="font-medium text-[var(--text-secondary)]">{announcement.author.username}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelative(new Date(announcement.createdAt), new Date())}
                        </span>
                      </div>
                    </div>

                    {(canManageAnnouncements || announcement.author.id === user?.id) && (
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(announcement.id)}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-[var(--danger)] hover:bg-[var(--danger-soft)] rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="text-[var(--text-primary)] text-sm leading-relaxed whitespace-pre-wrap">
                    {announcement.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </PageStateContainer>
      </ManagementLayout>

      <CreateAnnouncementModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        orgId={orgId} 
      />
      {confirmDialog}
    </WorkspaceShell>
  );
}

function CreateAnnouncementModal({ isOpen, onClose, orgId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const createMutation = useCreateAnnouncement(orgId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    createMutation.mutate({ title, content }, {
      onSuccess: () => {
        setTitle('');
        setContent('');
        onClose();
      }
    });
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="sm:max-w-lg">
        <ModalHeader>
          <ModalTitle>New Announcement</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Important Update"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full bg-[var(--bg-default)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
              placeholder="Write your announcement here..."
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !title.trim() || !content.trim()}>
              {createMutation.isPending ? 'Posting...' : 'Post Announcement'}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}