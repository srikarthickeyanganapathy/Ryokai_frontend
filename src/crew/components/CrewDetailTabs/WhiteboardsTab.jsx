import React, { useState, useMemo, useEffect } from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Pencil, Plus, Sparkles } from '@/shared/ui/Icons';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog';
import {
  useWhiteboards, useCreateWhiteboard, useDeleteWhiteboard,
  useTeamWhiteboards, useCreateTeamWhiteboard, useDeleteTeamWhiteboard,
} from '@/whiteboard';
import { TEMPLATES } from './whiteboards/templates';
import { StarterTemplateCard } from './whiteboards/StarterTemplateCard';
import { WhiteboardCard } from './whiteboards/WhiteboardCard';
import { WhiteboardToolbar } from './whiteboards/WhiteboardToolbar';
import { WhiteboardCollection } from './whiteboards/WhiteboardCollection';
import { CreateWhiteboardModal } from './whiteboards/CreateWhiteboardModal';

/**
 * The whiteboard hub for BOTH scopes:
 *  - crews:  <WhiteboardsTab crewId={id} isCreator={...} />
 *  - org teams: <WhiteboardsTab team={{ orgId, teamId }} isCreator={...} />
 * Identical UX; boards, links, and permissions stay isolated per scope.
 */
export function WhiteboardsTab({ crewId, isCreator, team }) {
  const isTeam = Boolean(team?.teamId);
  const orgId = team?.orgId;
  const teamId = team?.teamId;
  const scopeKey = isTeam ? `${orgId}-team-${teamId}` : crewId;
  const basePath = isTeam ? `/app/organizations/${orgId}/teams/${teamId}/whiteboards` : undefined;

  const crewQuery = useWhiteboards(isTeam ? undefined : crewId);
  const teamQuery = useTeamWhiteboards(orgId, teamId);
  const createCrew = useCreateWhiteboard(isTeam ? undefined : crewId);
  const createTeam = useCreateTeamWhiteboard(orgId, teamId);
  const deleteCrew = useDeleteWhiteboard(isTeam ? undefined : crewId);
  const deleteTeam = useDeleteTeamWhiteboard(orgId, teamId);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [activeFilter, setActiveFilter] = useState('all'); // all | starred | live
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(`ryokai_fav_whiteboards_${scopeKey}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const activeQuery = isTeam ? teamQuery : crewQuery;
  const { data: whiteboards = [], isLoading, isError, error, refetch } = activeQuery;
  const createBoardMutation = isTeam ? createTeam : createCrew;
  const deleteBoardMutation = isTeam ? deleteTeam : deleteCrew;
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`ryokai_fav_whiteboards_${crewId}`, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save whiteboard favorites to localStorage', e);
    }
  }, [favorites, scopeKey]);

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

  const boardCards = filteredAndSortedBoards.map((board, index) => (
    <WhiteboardCard 
      key={board.id} 
      board={board} 
      crewId={crewId} 
      basePath={basePath} 
      isCreator={isCreator} 
      onDelete={handleDelete} 
      isFavorite={favorites.includes(board.id)}
      onToggleFavorite={toggleFavorite}
      index={index}
      viewMode={viewMode}
    />
  ));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto text-[var(--text-primary)]">
      {/* Header Hub Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
            <Pencil className="w-4 h-4" />
          </div>
          <div>
            <Heading level={3} className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
              Visual Collaboration Hub
            </Heading>
            <Text className="text-[12px] text-[var(--text-secondary)] mt-0.5">
              Real-time canvas for brainstorming, architecture diagrams, retrospectives, and user journeys.
            </Text>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            size="sm" 
            className="gap-2 h-8 text-[12px] font-semibold shadow-xs" 
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
            <div className="w-6 h-6 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
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
      <WhiteboardToolbar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        totalBoards={whiteboards.length}
        favoritesCount={favorites.length}
        liveCount={liveCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Board Collection (7 UX States) */}
      <WhiteboardCollection
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        whiteboards={whiteboards}
        filteredBoards={filteredAndSortedBoards}
        viewMode={viewMode}
        onOpenCreate={handleOpenCreateModal}
        searchQuery={searchQuery}
        activeFilter={activeFilter}
        onResetFilters={() => { setSearchQuery(''); setActiveFilter('all'); }}
      >
        {boardCards}
      </WhiteboardCollection>

      {/* Create Board Modal with Template Selection */}
      <CreateWhiteboardModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={setSelectedTemplate}
        boardTitle={boardTitle}
        onTitleChange={setBoardTitle}
        onSubmit={handleCreate}
        isPending={createBoardMutation.isPending}
      />

      {/* Confirmation Dialog Component */}
      {confirmDialog}
    </div>
  );
}
