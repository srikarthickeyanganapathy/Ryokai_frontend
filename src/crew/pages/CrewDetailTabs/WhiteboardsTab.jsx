import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heading, Text, Label } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Link } from 'react-router-dom';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { useWhiteboards, useCreateWhiteboard, useDeleteWhiteboard } from '@/whiteboard';
import { 
  Pencil, 
  Plus, 
  Trash2, 
  Star, 
  Search, 
  ArrowUpRight, 
  Users as UsersIcon, 
  Clock, 
  LayoutGrid, 
  Spline, 
  GitBranch, 
  Network,
  Sparkles
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const templates = [
  { id: 'blank', name: 'Blank Canvas', icon: LayoutGrid, desc: 'Start from scratch' },
  { id: 'flowchart', name: 'Flowchart', icon: GitBranch, desc: 'Map processes & logic' },
  { id: 'mindmap', name: 'Mind Map', icon: Network, desc: 'Brainstorm ideas' },
  { id: 'wireframe', name: 'Wireframe', icon: Spline, desc: 'Design UI layouts' },
];

function WhiteboardCard({ board, crewId, isCreator, onDelete, isFavorite, onToggleFavorite, index }) {
  const recentEditors = board.editors || board.collaborators || [];
  const isLive = board.isLive || (recentEditors.length > 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
      className="group relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden hover:border-[var(--accent-border)] hover:shadow-sm transition-all duration-200 flex flex-col"
    >
      <div className="relative h-28 bg-[var(--bg-subtle)] overflow-hidden border-b border-[var(--border-subtle)]">
        <div 
          className="absolute inset-0 opacity-40" 
          style={{ 
            backgroundImage: 'radial-gradient(var(--border-subtle) 1px, transparent 1px)', 
            backgroundSize: '12px 12px' 
          }}
        ></div>
        
        <div className="absolute top-4 left-4 w-16 h-2.5 bg-[var(--accent-soft)] rounded-sm border border-[var(--accent-border)] opacity-70 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute top-8 left-7 w-24 h-2.5 bg-[var(--bg-hover)] rounded-sm opacity-50 group-hover:opacity-80 transition-opacity"></div>
        
        {isLive && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/20 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse"></span>
            <span className="text-[9px] font-semibold uppercase tracking-wider">Live</span>
          </div>
        )}

        <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button 
            onClick={(e) => { e.preventDefault(); onToggleFavorite(board.id); }} 
            className="p-1.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-border)] text-[var(--text-muted)] hover:text-amber-500 transition-colors shadow-sm"
            title="Favorite"
          >
            <Star className={cn("w-3 h-3", isFavorite && "fill-amber-500 text-amber-500")} />
          </button>
          {isCreator && (
            <button 
              onClick={(e) => { e.preventDefault(); onDelete(e, board.id); }} 
              className="p-1.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--danger-border)] text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors shadow-sm"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <Link to={`/app/crews/${crewId}/whiteboards/${board.id}`} className="flex-1 flex flex-col p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <Heading level={4} className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
            {board.title}
          </Heading>
          <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:text-[var(--accent)] transition-all shrink-0" />
        </div>
        
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium mb-3">
          <Clock className="w-3 h-3" />
          <span>Edited {new Date(board.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>

        <div className="mt-auto pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {recentEditors.slice(0, 3).map((editor, i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-[var(--accent)] border-2 border-[var(--bg-card)] flex items-center justify-center text-[8px] font-bold text-white shadow-sm" title={editor.username || `User ${i}`}>
                  {(editor.username || 'U').charAt(0).toUpperCase()}
                </div>
              ))}
              {recentEditors.length === 0 && (
                <div className="w-5 h-5 rounded-full bg-[var(--bg-hover)] border-2 border-[var(--bg-card)] flex items-center justify-center text-[8px] font-bold text-[var(--text-muted)]">
                  <UsersIcon className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">
              {recentEditors.length > 0 ? `${recentEditors.length} Editor${recentEditors.length > 1 ? 's' : ''}` : 'Solo editing'}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function WhiteboardsTab({ crewId, isCreator }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [favorites, setFavorites] = useState([]);
  
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
        setSelectedTemplate('blank'); 
      } 
    });
  };

  const handleDelete = async (e, boardId) => {
    e.preventDefault(); e.stopPropagation();
    if (await confirm({ title: 'Delete this whiteboard?', danger: true })) {
      deleteBoardMutation.mutate(boardId);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const filteredAndSortedBoards = useMemo(() => {
    let result = [...whiteboards];
    
    if (searchQuery) {
      result = result.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    if (sortBy === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    
    result.sort((a, b) => {
      const aFav = favorites.includes(a.id) ? 1 : 0;
      const bFav = favorites.includes(b.id) ? 1 : 0;
      return bFav - aFav;
    });

    return result;
  }, [whiteboards, searchQuery, sortBy, favorites]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <Heading level={3} className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Pencil className="w-4 h-4 text-[var(--accent)]" />
            Crew Whiteboards
          </Heading>
          <Text className="text-[12px] text-[var(--text-muted)] mt-0.5">
            Real-time collaborative canvas for diagrams, brainstorming, and planning.
          </Text>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search boards..."
              className="w-full pl-9 pr-3 py-1.5 text-[12px] font-medium bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)]"
            />
          </div>
          <Button size="sm" className="gap-1.5 h-8 text-[12px] font-semibold shadow-sm shrink-0" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> New Board
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden animate-pulse h-[180px]" />
          ))}
        </div>
      ) : filteredAndSortedBoards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)]">
          <Pencil className="w-8 h-8 text-[var(--text-muted)] mb-3" />
          <Heading level={4} className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">
            {searchQuery ? 'No boards found' : 'Start visualizing ideas'}
          </Heading>
          <Text variant="muted" className="text-[13px] max-w-sm mb-5">
            {searchQuery ? 'Try adjusting your search.' : 'Create a whiteboard to sketch diagrams, map flows, and brainstorm with your squad in real-time.'}
          </Text>
          {!searchQuery && (
            <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1.5 h-8 text-[12px] font-semibold">
              <Plus className="w-3.5 h-3.5" /> Create Whiteboard
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedBoards.map((board, index) => (
            <WhiteboardCard 
              key={board.id} 
              board={board} 
              crewId={crewId} 
              isCreator={isCreator} 
              onDelete={handleDelete} 
              isFavorite={favorites.includes(board.id)}
              onToggleFavorite={toggleFavorite}
              index={index}
            />
          ))}
        </div>
      )}

      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ModalContent className="sm:max-w-xl !bg-[var(--bg-card)] !backdrop-blur-xl border border-[var(--border-subtle)] shadow-xl rounded-xl p-6">
          <div className="flex flex-col space-y-1 mb-5">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-2 border border-[var(--accent-border)]">
              <Pencil className="w-5 h-5" />
            </div>
            <Heading level={3} className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Create Whiteboard</Heading>
            <Text variant="muted" className="text-[12px]">Choose a template and name your new collaborative canvas.</Text>
          </div>
          
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Templates</Label>
              <div className="grid grid-cols-4 gap-2.5">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer",
                      selectedTemplate === template.id 
                        ? "bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent)] font-semibold" 
                        : "bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <template.icon className="w-4 h-4" />
                    <span className="text-[10px] text-center leading-tight">{template.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Board Title</Label>
              <Input 
                value={boardTitle} 
                onChange={(e) => setBoardTitle(e.target.value)} 
                placeholder="e.g. Sprint Architecture, Q3 Brainstorm..." 
                required 
                className="h-9 text-[13px] rounded-md font-medium" 
                autoFocus
              />
            </div>
            
            <div className="flex justify-end gap-2.5 pt-5 border-t border-[var(--border-subtle)]">
              <Button type="button" variant="outline" size="sm" className="h-8 px-4 text-[12px] font-medium" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 px-4 text-[12px] font-semibold gap-1.5" isLoading={createBoardMutation.isPending}>
                <Sparkles className="w-3.5 h-3.5" /> Create Board
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      {confirmDialog}
    </div>
  );
}
