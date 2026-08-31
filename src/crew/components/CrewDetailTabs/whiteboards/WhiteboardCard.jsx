import { motion } from 'framer-motion';
import { Heading } from '@/shared/ui/Typography';
import { IconButton } from '@/shared/ui/Button';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Trash2, 
  ArrowUpRight, 
  Users as UsersIcon, 
  Clock 
} from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';
import { TEMPLATES } from './templates';
import { formatRelativeTime, getAvatarGradient } from './utils';
import { VisualCanvasThumbnail } from './VisualCanvasThumbnail';

// Individual Whiteboard Card Component
export function WhiteboardCard({ board, crewId, isCreator, onDelete, isFavorite, onToggleFavorite, index, viewMode = 'grid' }) {
  const recentEditors = board.editors || board.collaborators || board.activeUsers || [];
  const isLive = board.isLive || (recentEditors.length > 0);
  const boardTemplate = TEMPLATES.find(t => t.id === board.template) || TEMPLATES[4];

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="group relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3.5 hover:border-[var(--accent-border)] hover:shadow-sm transition-all duration-200 flex items-center justify-between gap-4"
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
              <span>*</span>
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
                className="w-6 h-6 rounded-full border-2 border-[var(--bg-card)] flex items-center justify-center text-[9px] font-bold text-white shadow-xs" 
                style={{ background: getAvatarGradient(editor.username || editor.name) }}
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
            <IconButton
              variant="ghost"
              size="sm"
              onClick={(e) => { e.preventDefault(); onToggleFavorite(board.id); }}
              title={isFavorite ? "Unstar" : "Star"}
              aria-label={isFavorite ? "Unstar whiteboard" : "Star whiteboard"}
            >
              <Star className={cn("w-4 h-4", isFavorite && "fill-amber-500 text-amber-500")} />
            </IconButton>
            
            {isCreator && (
              <IconButton
                variant="ghost"
                size="sm"
                onClick={(e) => onDelete(e, board.id)}
                title="Delete Whiteboard"
                aria-label="Delete whiteboard"
              >
                <Trash2 className="w-4 h-4" />
              </IconButton>
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
      className="group relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden hover:border-[var(--accent-border)] hover:shadow-sm transition-all duration-200 flex flex-col"
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
          <IconButton 
            variant="ghost"
            size="sm"
            className="bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[var(--accent-border)]"
            onClick={(e) => { e.preventDefault(); onToggleFavorite(board.id); }}
            title={isFavorite ? "Unstar" : "Star"}
            aria-label={isFavorite ? "Unstar whiteboard" : "Star whiteboard"}
          >
            <Star className={cn("w-3.5 h-3.5", isFavorite && "fill-amber-500 text-amber-500")} />
          </IconButton>

          {isCreator && (
            <IconButton 
              variant="ghost"
              size="sm"
              className="bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-subtle)] hover:border-[var(--danger-border)]"
              onClick={(e) => onDelete(e, board.id)}
              title="Delete"
              aria-label="Delete whiteboard"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </IconButton>
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
                    className="w-5 h-5 rounded-full border-2 border-[var(--bg-card)] flex items-center justify-center text-[8px] font-bold text-white shadow-xs" 
                    style={{ background: getAvatarGradient(editor.username || editor.name) }}
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
