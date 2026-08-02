import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text, Label } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Input } from '@/shared/ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar';
import { cn } from '@/shared/lib/cn';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { useWhiteboards,useCreateWhiteboard,useDeleteWhiteboard } from '@/whiteboard';

/* ==================== WHITEBOARDS TAB ==================== */
export function WhiteboardsTab({ crewId, isCreator }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  
  const { data: whiteboards = [], isLoading } = useWhiteboards(crewId);
  const createBoardMutation = useCreateWhiteboard(crewId);
  const deleteBoardMutation = useDeleteWhiteboard(crewId);
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const handleCreate = (e) => {
    e.preventDefault();
    if (!boardTitle.trim()) return;
    createBoardMutation.mutate(boardTitle, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setBoardTitle('');
      }
    });
  };

  const handleDelete = async (e, boardId) => {
    e.preventDefault();
    e.stopPropagation();
    if (await confirm({ title: 'Delete this whiteboard?', danger: true })) {
      deleteBoardMutation.mutate(boardId);
    }
  };

  if (isLoading) return <div className="p-8 text-center"><Icons.spinner className="w-6 h-6 animate-spin mx-auto text-[var(--accent)]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-[var(--border-subtle)] pb-4">
        <div>
          <Heading level={3} className="text-[15px] font-semibold mb-1">Crew Whiteboards</Heading>
          <Text className="text-[12px] text-[var(--text-tertiary)]">Collaborate in real-time on a shared canvas.</Text>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setIsCreateOpen(true)}>
          <Icons.plus className="w-3.5 h-3.5" />
          New Whiteboard
        </Button>
      </div>

      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ModalContent className="sm:max-w-sm">
          <Heading level={3} className="mb-3 text-[16px]">Create Whiteboard</Heading>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-[var(--text-secondary)]">Board Title</Label>
              <Input
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                placeholder="Architecture Diagram, Sprint Retrospective..."
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" isLoading={createBoardMutation.isPending}>Create</Button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      {whiteboards.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] border-dashed">
          <Icons.edit className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-2" />
          <Heading level={4} className="text-[14px] font-medium text-[var(--text-secondary)]">No whiteboards yet</Heading>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {whiteboards.map(board => (
            <Link key={board.id} to={`/app/crews/${crewId}/whiteboards/${board.id}`} className="group block">
              <div className="flex flex-col p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] hover:bg-[var(--bg-hover)] transition-colors h-full">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                      <Icons.edit className="w-4 h-4" />
                    </div>
                    <div>
                      <Heading level={4} className="text-[14px] font-semibold leading-tight line-clamp-1">{board.title}</Heading>
                      <Text className="text-[10px] text-[var(--text-tertiary)]">
                        Updated {new Date(board.updatedAt).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                  {isCreator && (
                    <Button variant="ghost" onClick={(e) => handleDelete(e, board.id)} className="text-[var(--text-tertiary)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icons.trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {confirmDialog}
    </div>
  );
}
