import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePermissions } from '@/context/usePermissions';
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '@/features/organizations/hooks/useAnnouncements';
import { Heading, Text } from '@/shared/ui/Typography';
import { Megaphone, Plus, Trash2, Clock, Loader2 } from 'lucide-react';
import { formatRelative } from 'date-fns';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Modal } from '@/shared/ui/Modal';

export function AnnouncementsPage() {
  const { activeOrganization } = useWorkspace();
  const { user } = useAuth();
  
  // Do not rely on usePermissions().userOrg here, use the active org context.
  const { canManageAnnouncements } = usePermissions();
  
  const orgId = activeOrganization?.id;
  const { data: announcementsPage, isLoading } = useAnnouncements(orgId, { page: 0, size: 20 });
  const deleteMutation = useDeleteAnnouncement(orgId);
  
  const announcements = announcementsPage?.content || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!activeOrganization) return null;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="h-full px-6 py-8 md:px-10 lg:px-12 max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 border-b border-white/10 pb-6"
        >
          <div>
            <Heading level={2} className="tracking-tight text-[24px] font-semibold text-white/90">
              Announcements
            </Heading>
            <Text variant="muted" className="text-[14px] mt-1">
              Broadcasts and updates for {activeOrganization.name}
            </Text>
          </div>

          {canManageAnnouncements && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Post
            </button>
          )}
        </motion.div>

        {/* Feed Section */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-white/40" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl border-dashed">
              <Megaphone className="h-10 w-10 text-white/20 mx-auto mb-4" />
              <Heading level={4} className="text-white/60 mb-2">No announcements yet</Heading>
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
                    className="group bg-white/[0.03] border border-white/10 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <Heading level={4} className="text-lg font-semibold text-white/90">
                          {announcement.title}
                        </Heading>
                        <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                          <span className="font-medium text-white/60">{announcement.author.username}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelative(new Date(announcement.createdAt), new Date())}
                          </span>
                        </div>
                      </div>

                      {(canManageAnnouncements || announcement.author.id === user?.id) && (
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this announcement?')) {
                              deleteMutation.mutate(announcement.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
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
    <Modal isOpen={isOpen} onClose={onClose} title="New Announcement">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
            placeholder="Important Update"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/60 mb-1.5">Message</label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 resize-none"
            placeholder="Write your announcement here..."
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white/90 hover:bg-white/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || !title.trim() || !content.trim()}
            className="px-4 py-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {createMutation.isPending ? 'Posting...' : 'Post Announcement'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
