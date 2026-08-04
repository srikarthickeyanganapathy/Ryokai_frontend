import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  GitBranch, 
  Network,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  Compass,
  MessageSquare,
  Grid,
  List,
  Layers,
  ArrowRight,
  Zap,
  Check
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';

// Template Definitions with Visual Configurations
const TEMPLATES = [
  {
    id: 'brainstorming',
    name: 'Brainstorming',
    category: 'Ideation',
    icon: Lightbulb,
    desc: 'Mind maps, sticky note clusters & freeform team ideation.',
    accentColor: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.08)'
  },
  {
    id: 'architecture',
    name: 'Architecture Diagram',
    category: 'System Design',
    icon: GitBranch,
    desc: 'System topology, flowcharts, microservices & DB schemas.',
    accentColor: '#4169E1',
    bgColor: 'rgba(65, 105, 225, 0.08)'
  },
  {
    id: 'retrospective',
    name: 'Retrospective',
    category: 'Agile',
    icon: MessageSquare,
    desc: 'Sprint recap with What Went Well, To Improve & Action Items.',
    accentColor: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.08)'
  },
  {
    id: 'user-journey',
    name: 'User Journey',
    category: 'UX Design',
    icon: Compass,
    desc: 'Map persona touchpoints, user pain points & solution paths.',
    accentColor: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.08)'
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    category: 'Freeform',
    icon: LayoutGrid,
    desc: 'Clean infinite canvas for custom sketching and notes.',
    accentColor: '#6B7280',
    bgColor: 'rgba(107, 114, 128, 0.08)'
  }
];

// Time formatter helper
function formatRelativeTime(dateString) {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Custom Visual Canvas Thumbnail Renderers
function VisualCanvasThumbnail({ board, templateId }) {
  if (board?.snapshotDataUrl || board?.snapshot || board?.thumbnailUrl) {
    return (
      <img 
        src={board.snapshotDataUrl || board.snapshot || board.thumbnailUrl} 
        alt={board.title} 
        className="w-full h-full object-cover" 
      />
    );
  }

  const effectiveTemplate = templateId || board?.template || 'blank';

  return (
    <div className="relative w-full h-full bg-[var(--bg-subtle)] overflow-hidden select-none">
      {/* Canvas Grid Background */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(var(--border-strong) 1px, transparent 1px)', 
          backgroundSize: '14px 14px' 
        }}
      />

      {/* Dynamic Graphic Preview by Template */}
      {effectiveTemplate === 'brainstorming' && (
        <svg className="w-full h-full p-3 opacity-90" viewBox="0 0 200 120" fill="none">
          <path d="M40 40 Q 90 20 140 35" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M40 40 Q 60 90 130 85" stroke="var(--warning)" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Sticky Notes */}
          <rect x="25" y="25" width="35" height="30" rx="3" fill="#FEF08A" stroke="#EAB308" strokeWidth="1" />
          <line x1="30" y1="33" x2="52" y2="33" stroke="#A16207" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="30" y1="41" x2="47" y2="41" stroke="#A16207" strokeWidth="1.5" strokeLinecap="round" />

          <rect x="125" y="20" width="38" height="32" rx="3" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1" />
          <line x1="130" y1="29" x2="155" y2="29" stroke="#0369A1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="130" y1="37" x2="150" y2="37" stroke="#0369A1" strokeWidth="1.5" strokeLinecap="round" />

          <rect x="115" y="70" width="40" height="32" rx="3" fill="#FBCFE8" stroke="#DB2777" strokeWidth="1" />
          <line x1="120" y1="79" x2="148" y2="79" stroke="#BE185D" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="120" y1="87" x2="142" y2="87" stroke="#BE185D" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}

      {effectiveTemplate === 'architecture' && (
        <svg className="w-full h-full p-3 opacity-90" viewBox="0 0 200 120" fill="none">
          <path d="M55 40 H100 V65 H145" stroke="var(--accent)" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <path d="M100 65 V90 H145" stroke="var(--accent)" strokeWidth="1.5" />
          {/* Nodes */}
          <rect x="15" y="25" width="40" height="30" rx="4" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5" />
          <rect x="20" y="32" width="20" height="4" rx="1" fill="var(--accent)" />
          <rect x="20" y="40" width="30" height="3" rx="1" fill="var(--text-tertiary)" />

          <rect x="80" y="50" width="40" height="30" rx="4" fill="var(--bg-card)" stroke="var(--success)" strokeWidth="1.5" />
          <rect x="85" y="57" width="22" height="4" rx="1" fill="var(--success)" />
          <rect x="85" y="65" width="28" height="3" rx="1" fill="var(--text-tertiary)" />

          <rect x="145" y="25" width="42" height="30" rx="4" fill="var(--bg-card)" stroke="var(--warning)" strokeWidth="1.5" />
          <rect x="150" y="32" width="24" height="4" rx="1" fill="var(--warning)" />

          <rect x="145" y="75" width="42" height="30" rx="4" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5" />
          <rect x="150" y="82" width="20" height="4" rx="1" fill="var(--accent)" />
        </svg>
      )}

      {effectiveTemplate === 'retrospective' && (
        <svg className="w-full h-full p-2.5 opacity-90" viewBox="0 0 200 120" fill="none">
          {/* 3 Columns */}
          <rect x="15" y="15" width="50" height="90" rx="4" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
          <rect x="20" y="20" width="40" height="8" rx="2" fill="var(--success)" opacity="0.8" />
          <rect x="20" y="34" width="40" height="22" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1" />
          <rect x="20" y="60" width="40" height="22" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1" />

          <rect x="75" y="15" width="50" height="90" rx="4" fill="rgba(245, 158, 11, 0.08)" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1" />
          <rect x="80" y="20" width="40" height="8" rx="2" fill="var(--warning)" opacity="0.8" />
          <rect x="80" y="34" width="40" height="22" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1" />

          <rect x="135" y="15" width="50" height="90" rx="4" fill="rgba(65, 105, 225, 0.08)" stroke="rgba(65, 105, 225, 0.2)" strokeWidth="1" />
          <rect x="140" y="20" width="40" height="8" rx="2" fill="var(--accent)" opacity="0.8" />
          <rect x="140" y="34" width="40" height="22" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1" />
          <rect x="140" y="60" width="40" height="22" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1" />
        </svg>
      )}

      {effectiveTemplate === 'user-journey' && (
        <svg className="w-full h-full p-3 opacity-90" viewBox="0 0 200 120" fill="none">
          <path d="M25 60 C 60 20, 100 90, 175 40" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 2" />
          {/* Step circles */}
          <circle cx="25" cy="60" r="8" fill="var(--accent)" />
          <circle cx="75" cy="38" r="8" fill="var(--success)" />
          <circle cx="125" cy="72" r="8" fill="var(--warning)" />
          <circle cx="175" cy="40" r="8" fill="#8B5CF6" />

          <rect x="15" y="75" width="20" height="12" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" />
          <rect x="65" y="52" width="20" height="12" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" />
          <rect x="115" y="86" width="20" height="12" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" />
          <rect x="165" y="54" width="20" height="12" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" />
        </svg>
      )}

      {effectiveTemplate === 'blank' && (
        <svg className="w-full h-full p-4 opacity-75" viewBox="0 0 200 120" fill="none">
          <path d="M30 40 Q 60 10 90 40 T 150 40" stroke="var(--text-tertiary)" strokeWidth="1.5" fill="none" />
          <rect x="40" y="60" width="45" height="35" rx="3" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          <circle cx="140" cy="75" r="16" stroke="var(--success)" strokeWidth="1.5" fill="none" />
        </svg>
      )}
    </div>
  );
}

// Starter Gallery Template Item Component
function StarterTemplateCard({ template, onSelect }) {
  const IconComponent = template.icon;
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(template.id)}
      className="group relative text-left bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-border)] rounded-xl p-3.5 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105" 
          style={{ backgroundColor: template.bgColor, color: template.accentColor }}
        >
          <IconComponent className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
          {template.category}
        </span>
      </div>

      <div>
        <Heading level={4} className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-1">
          {template.name}
        </Heading>
        <Text variant="muted" className="text-[11px] line-clamp-2 text-[var(--text-secondary)] leading-relaxed">
          {template.desc}
        </Text>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center text-[11px] font-medium text-[var(--accent)] group-hover:translate-x-0.5 transition-transform">
        <span>Use Template</span>
        <ArrowRight className="w-3 h-3 ml-1" />
      </div>
    </motion.button>
  );
}

// Individual Whiteboard Card Component
function WhiteboardCard({ board, crewId, isCreator, onDelete, isFavorite, onToggleFavorite, index, viewMode = 'grid' }) {
  const recentEditors = board.editors || board.collaborators || board.activeUsers || [];
  const isLive = board.isLive || (recentEditors.length > 0);
  const boardTemplate = TEMPLATES.find(t => t.id === board.template) || TEMPLATES[4];

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="group relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3.5 hover:border-[var(--accent-border)] hover:shadow-xs transition-all duration-200 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-14 h-11 rounded-lg overflow-hidden border border-[var(--border-subtle)] shrink-0 relative bg-[var(--bg-subtle)]">
            <VisualCanvasThumbnail board={board} templateId={board.template} />
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link 
                to={`/app/crews/${crewId}/whiteboards/${board.id}`}
                className="font-semibold text-[13px] text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors truncate"
              >
                {board.title}
              </Link>
              {isLive && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[var(--success-soft)] text-[var(--success)] text-[9px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                  Live
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(board.updatedAt || board.createdAt)}
              </span>
              <span>•</span>
              <span className="capitalize">{boardTemplate.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Collaborator Avatars */}
          <div className="flex items-center -space-x-1.5">
            {recentEditors.slice(0, 3).map((editor, i) => (
              <div 
                key={i} 
                className="w-6 h-6 rounded-full bg-[var(--accent)] border-2 border-[var(--bg-card)] flex items-center justify-center text-[9px] font-bold text-white shadow-xs" 
                title={editor.username || editor.name || `User ${i + 1}`}
              >
                {(editor.username || editor.name || 'U').charAt(0).toUpperCase()}
              </div>
            ))}
            {recentEditors.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-[var(--bg-hover)] border-2 border-[var(--bg-card)] flex items-center justify-center text-[9px] font-bold text-[var(--text-secondary)]">
                +{recentEditors.length - 3}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.preventDefault(); onToggleFavorite(board.id); }}
              className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-amber-500 transition-colors"
              title={isFavorite ? "Unstar" : "Star"}
            >
              <Star className={cn("w-4 h-4", isFavorite && "fill-amber-500 text-amber-500")} />
            </button>
            
            {isCreator && (
              <button
                onClick={(e) => onDelete(e, board.id)}
                className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
                title="Delete Whiteboard"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <Link
              to={`/app/crews/${crewId}/whiteboards/${board.id}`}
              className="p-1.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors ml-1"
              title="Open Whiteboard"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
      className="group relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden hover:border-[var(--accent-border)] hover:shadow-md transition-all duration-200 flex flex-col"
    >
      {/* Thumbnail Header */}
      <div className="relative h-32 bg-[var(--bg-subtle)] overflow-hidden border-b border-[var(--border-subtle)]">
        <VisualCanvasThumbnail board={board} templateId={board.template} />

        {/* Live Badge */}
        {isLive && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--bg-card)]/90 text-[var(--success)] border border-[var(--success)]/30 backdrop-blur-md shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Live</span>
          </div>
        )}

        {/* Quick Action Overlay */}
        <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.preventDefault(); onToggleFavorite(board.id); }} 
            className="p-1.5 rounded-lg bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[var(--accent-border)] text-[var(--text-muted)] hover:text-amber-500 transition-colors shadow-xs"
            title={isFavorite ? "Unstar" : "Star"}
          >
            <Star className={cn("w-3.5 h-3.5", isFavorite && "fill-amber-500 text-amber-500")} />
          </button>

          {isCreator && (
            <button 
              onClick={(e) => onDelete(e, board.id)} 
              className="p-1.5 rounded-lg bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[var(--danger-border)] text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors shadow-xs"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Card Content & Launcher */}
      <Link to={`/app/crews/${crewId}/whiteboards/${board.id}`} className="flex-1 flex flex-col p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <Heading level={4} className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
            {board.title}
          </Heading>
          <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:text-[var(--accent)] transition-all shrink-0 translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
        </div>
        
        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mb-3">
          <Clock className="w-3 h-3" />
          <span>Edited {formatRelativeTime(board.updatedAt || board.createdAt)}</span>
        </div>

        {/* Card Footer with Collaborator Avatars */}
        <div className="mt-auto pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {recentEditors.length > 0 ? (
                recentEditors.slice(0, 3).map((editor, i) => (
                  <div 
                    key={i} 
                    className="w-5 h-5 rounded-full bg-[var(--accent)] border-2 border-[var(--bg-card)] flex items-center justify-center text-[8px] font-bold text-white shadow-xs" 
                    title={editor.username || editor.name || `User ${i + 1}`}
                  >
                    {(editor.username || editor.name || 'U').charAt(0).toUpperCase()}
                  </div>
                ))
              ) : (
                <div className="w-5 h-5 rounded-full bg-[var(--bg-hover)] border-2 border-[var(--bg-card)] flex items-center justify-center text-[8px] font-bold text-[var(--text-muted)]">
                  <UsersIcon className="w-2.5 h-2.5" />
                </div>
              )}
              {recentEditors.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-[var(--bg-hover)] border-2 border-[var(--bg-card)] flex items-center justify-center text-[8px] font-bold text-[var(--text-secondary)]">
                  +{recentEditors.length - 3}
                </div>
              )}
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">
              {recentEditors.length > 0 ? `${recentEditors.length} Editor${recentEditors.length > 1 ? 's' : ''}` : 'Solo Canvas'}
            </span>
          </div>

          <span className="text-[10px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider">
            {boardTemplate.name}
          </span>
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
  const [activeFilter, setActiveFilter] = useState('all'); // all | starred | live
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(`ryokai_fav_whiteboards_${crewId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const { data: whiteboards = [], isLoading, isError, error, refetch } = useWhiteboards(crewId);
  const createBoardMutation = useCreateWhiteboard(crewId);
  const deleteBoardMutation = useDeleteWhiteboard(crewId);
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`ryokai_fav_whiteboards_${crewId}`, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save whiteboard favorites to localStorage', e);
    }
  }, [favorites, crewId]);

  const handleOpenCreateModal = (templateId = 'blank') => {
    setSelectedTemplate(templateId);
    setBoardTitle('');
    setIsCreateOpen(true);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!boardTitle.trim()) return;
    createBoardMutation.mutate(
      boardTitle,
      { 
        onSuccess: () => { 
          setIsCreateOpen(false); 
          setBoardTitle(''); 
          setSelectedTemplate('blank'); 
        } 
      }
    );
  };

  const handleDelete = async (e, boardId) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (await confirm({ title: 'Delete whiteboard?', message: 'This canvas action cannot be undone.', danger: true })) {
      deleteBoardMutation.mutate(boardId);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  // Filter and Sort Pipeline
  const filteredAndSortedBoards = useMemo(() => {
    let result = [...whiteboards];
    
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => b.title.toLowerCase().includes(q));
    }

    // Active Category Filter
    if (activeFilter === 'starred') {
      result = result.filter(b => favorites.includes(b.id));
    } else if (activeFilter === 'live') {
      result = result.filter(b => b.isLive || (b.editors && b.editors.length > 0));
    }
    
    // Sort logic
    if (sortBy === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt || a.updatedAt).getTime() - new Date(b.createdAt || b.updatedAt).getTime());
    } else {
      // Recent (default)
      result.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
    }
    
    return result;
  }, [whiteboards, searchQuery, sortBy, activeFilter, favorites]);

  const liveCount = useMemo(() => {
    return whiteboards.filter(b => b.isLive || (b.editors && b.editors.length > 0)).length;
  }, [whiteboards]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto text-[var(--text-primary)]">
      {/* Header Hub Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <Heading level={3} className="text-[16px] font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] flex items-center justify-center">
              <Pencil className="w-4 h-4" />
            </div>
            Visual Collaboration Hub
          </Heading>
          <Text className="text-[12px] text-[var(--text-secondary)] mt-1">
            Real-time canvas for brainstorming, architecture diagrams, retrospectives, and user journeys.
          </Text>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            size="sm" 
            className="gap-2 h-9 text-[12px] font-semibold shadow-xs" 
            onClick={() => handleOpenCreateModal('blank')}
          >
            <Plus className="w-4 h-4" /> New Whiteboard
          </Button>
        </div>
      </div>

      {/* Template Starter Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <Heading level={4} className="text-[13px] font-semibold tracking-tight text-[var(--text-primary)]">
              Template Starter Gallery
            </Heading>
          </div>
          <Text variant="muted" className="text-[11px] text-[var(--text-tertiary)]">
            Click to launch pre-built framework
          </Text>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {TEMPLATES.slice(0, 4).map((tmpl) => (
            <StarterTemplateCard 
              key={tmpl.id} 
              template={tmpl} 
              onSelect={(tId) => handleOpenCreateModal(tId)} 
            />
          ))}
        </div>
      </div>

      {/* Search, Filter & Control Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-lg text-[12px] font-medium overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={cn(
              "px-3 py-1 rounded-md transition-all whitespace-nowrap",
              activeFilter === 'all' 
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs font-semibold" 
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            All Boards ({whiteboards.length})
          </button>

          <button
            onClick={() => setActiveFilter('starred')}
            className={cn(
              "px-3 py-1 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeFilter === 'starred' 
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs font-semibold" 
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <Star className={cn("w-3 h-3", favorites.length > 0 && "text-amber-500 fill-amber-500")} />
            Starred ({favorites.length})
          </button>

          <button
            onClick={() => setActiveFilter('live')}
            className={cn(
              "px-3 py-1 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeFilter === 'live' 
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs font-semibold" 
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            Live Now ({liveCount})
          </button>
        </div>

        {/* Search & Sort & View Mode */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search whiteboards..."
              className="w-full pl-9 pr-3 py-1.5 text-[12px] font-medium bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)]"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-8 px-2.5 text-[12px] font-medium bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="recent">Recently Edited</option>
            <option value="name">Title (A-Z)</option>
            <option value="oldest">Date Created</option>
          </select>

          <div className="flex items-center p-0.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === 'grid' ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === 'list' ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* UX STATE HANDLERS (7 UX STATES) */}
      {/* State 1: Loading Skeleton */}
      {isLoading ? (
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
        )}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden animate-pulse h-[200px]"
            >
              <div className="h-32 bg-[var(--bg-subtle)]" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-[var(--bg-hover)] rounded-md" />
                <div className="h-3 w-1/2 bg-[var(--bg-hover)] rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        /* State 4: Error State */
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-[var(--danger-border)]/40 rounded-xl bg-[var(--danger-soft)]/20">
          <AlertTriangle className="w-8 h-8 text-[var(--danger)] mb-2.5" />
          <Heading level={4} className="text-[14px] font-bold text-[var(--text-primary)] mb-1">
            Failed to Load Whiteboards
          </Heading>
          <Text className="text-[12px] text-[var(--text-secondary)] max-w-md mb-4">
            {error?.message || 'An error occurred while communicating with the canvas server.'}
          </Text>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-2 text-[12px] h-8 font-medium">
            <RefreshCw className="w-3.5 h-3.5" /> Retry Fetch
          </Button>
        </div>
      ) : whiteboards.length === 0 ? (
        /* State 2: Empty State (No Whiteboards in Crew) */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)]">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-3 border border-[var(--accent-border)]">
            <Pencil className="w-6 h-6" />
          </div>
          <Heading level={4} className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">
            Start Visualizing Ideas Together
          </Heading>
          <Text variant="muted" className="text-[12px] max-w-md mb-6 text-[var(--text-secondary)]">
            Create your crew's first interactive whiteboard to sketch diagrams, map user flows, or conduct sprint retrospectives in real-time.
          </Text>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => handleOpenCreateModal('blank')} className="gap-2 h-9 text-[12px] font-semibold">
              <Plus className="w-4 h-4" /> Create Blank Canvas
            </Button>
          </div>
        </div>
      ) : filteredAndSortedBoards.length === 0 ? (
        /* State 3 & 7: No Search / Filter Match State */
        <div className="flex flex-col items-center justify-center py-14 px-4 text-center border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)]">
          <Search className="w-7 h-7 text-[var(--text-tertiary)] mb-2.5" />
          <Heading level={4} className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">
            No Whiteboards Found
          </Heading>
          <Text variant="muted" className="text-[12px] max-w-sm mb-4 text-[var(--text-secondary)]">
            {searchQuery 
              ? `No whiteboards match "${searchQuery}". Try a different keyword.` 
              : activeFilter === 'starred' 
                ? 'You have not favorited any whiteboards yet. Click the star icon on any board to keep it handy.' 
                : 'No active live whiteboard sessions at the moment.'}
          </Text>
          {(searchQuery || activeFilter !== 'all') && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => { setSearchQuery(''); setActiveFilter('all'); }} 
              className="text-[12px] h-8 font-medium"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        /* State 5: Default Content Grid/List View */
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
        )}>
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
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* State 6: Create Board Modal with Template Selection */}
      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ModalContent className="sm:max-w-xl !bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl rounded-2xl p-6">
          <div className="flex flex-col space-y-1 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-2 border border-[var(--accent-border)]">
              <Pencil className="w-5 h-5" />
            </div>
            <Heading level={3} className="text-[16px] font-bold tracking-tight text-[var(--text-primary)]">
              Create New Whiteboard
            </Heading>
            <Text variant="muted" className="text-[12px] text-[var(--text-secondary)]">
              Select a starter template and name your interactive canvas.
            </Text>
          </div>
          
          <form onSubmit={handleCreate} className="space-y-5">
            {/* Template Selector Grid */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Starter Framework
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TEMPLATES.map((template) => {
                  const IconComp = template.icon;
                  const isSelected = selectedTemplate === template.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedTemplate(template.id)}
                      className={cn(
                        "flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                        isSelected 
                          ? "bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent)] font-semibold shadow-xs" 
                          : "bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" 
                        style={{ backgroundColor: template.bgColor, color: template.accentColor }}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] block truncate font-medium">{template.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Board Title Field */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Board Title
              </Label>
              <Input 
                value={boardTitle} 
                onChange={(e) => setBoardTitle(e.target.value)} 
                placeholder="e.g. Sprint 4 Architecture, Q3 Strategy Mindmap..." 
                required 
                className="h-9 text-[13px] rounded-lg font-medium bg-[var(--bg-base)]" 
                autoFocus
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-[var(--border-subtle)]">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="h-8 px-4 text-[12px] font-medium" 
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm" 
                className="h-8 px-4 text-[12px] font-semibold gap-1.5" 
                isLoading={createBoardMutation.isPending}
              >
                <Sparkles className="w-3.5 h-3.5" /> Create Board
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      {/* Confirmation Dialog Component */}
      {confirmDialog}
    </div>
  );
}

