import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '@/features/organizations/hooks/useAnnouncements';
import { Heading, Text, Label } from '@/shared/ui/Typography';
import { Megaphone, Plus, Trash2, Clock, Loader2 } from 'lucide-react';
import { formatRelative } from 'date-fns';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog';

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

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="h-full px-6 py-8 md:px-10 lg:px-12 max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6"
        >
          <div>
            <Heading level={2} className="tracking-tight text-[24px] font-semibold text-[var(--text-primary)]">
              Announcements
            </Heading>
            <Text variant="muted" className="text-[14px] mt-1">
              Broadcasts and updates for {activeOrganization.name}
            </Text>
          </div>

          {canManageAnnouncements && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          )}
        </motion.div>

        {/* Feed Section */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--text-muted)]" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-20 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-2xl border-dashed">
              <Megaphone className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-4" />
              <Heading level={4} className="text-[var(--text-secondary)] mb-2">No announcements yet</Heading>
              <Text variant="muted" className="text-sm">When an admin posts an update, it will appear here.</Text>
            </div>
          ) : (
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
          )}
        </div>
      </div>

      <CreateAnnouncementModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        orgId={orgId} 
      />
      {confirmDialog}
    </div>
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
