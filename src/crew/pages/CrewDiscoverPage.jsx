import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { Heading, Text } from '@/shared/ui/Typography';
import { Badge } from '@/shared/ui/Badge';
import { ErrorState } from '@/shared/ui/ErrorState';
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter
} from '@/shared/ui/Modal';
import { PageShell, PageHero, PageToolbar, PageContent } from '@/shared/ui/PageShell';
import { PageState } from '@/shared/ui/PageState';
import { useDiscoverCrews, useJoinPublicCrew } from '../features/hooks/useCrews';
import { 
  Search, Users, Compass, Flame, Sparkles, TrendingUp, CheckCircle2, Loader2, Hash,
  ArrowUpRight, Lock, Globe, Link2, Activity, Eye, RefreshCw, WifiOff, Layers, Rocket, Filter, X, Target
} from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';

const categories = ['All Missions', 'Engineering', 'Design', 'Product', 'Marketing', 'Operations', 'Growth', 'Research'];

function DiscoverCrewCard({ crew, navigate, onJoin, isJoining, joined, onPreview }) {
  const isMember = !!crew.myRole || joined;
  const isFull = (crew.memberCount ?? 0) >= (crew.memberCap ?? 50);
  const isInviteOnly = crew.visibility === 'INVITE_ONLY';
  const visibilityConfig = {
    PUBLIC: { icon: Globe, label: 'Public Squad' },
    PUBLIC_LINK: { icon: Link2, label: 'Public Link' },
    INVITE_ONLY: { icon: Lock, label: 'Invite Only' },
  };
  const VisIcon = visibilityConfig[crew.visibility]?.icon || Globe;
  const activityScore = useMemo(() => Math.min(100, Math.round(((crew.memberCount || 1) / (crew.memberCap || 50)) * 100 + 15)), [crew]);
  const onlineMembers = useMemo(() => Math.max(1, Math.round((crew.memberCount || 1) * 0.35)), [crew]);
  const categoryTag = useMemo(() => {
    if (crew.category) return crew.category;
    const lowerName = (crew.name + ' ' + (crew.description || '')).toLowerCase();
    if (lowerName.includes('design') || lowerName.includes('ui') || lowerName.includes('ux')) return 'Design';
    if (lowerName.includes('dev') || lowerName.includes('eng') || lowerName.includes('code') || lowerName.includes('api')) return 'Engineering';
    if (lowerName.includes('market') || lowerName.includes('growth') || lowerName.includes('seo')) return 'Marketing';
    if (lowerName.includes('prod') || lowerName.includes('roadmap')) return 'Product';
    return 'Engineering';
  }, [crew]);

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}
      className="group relative bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-border)] rounded-xl p-5 flex flex-col justify-between gap-4 hover:shadow-lg transition-all duration-200 overflow-hidden"
      whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--accent-soft)] to-[var(--bg-subtle)] text-[var(--accent)] font-bold text-[14px] flex items-center justify-center border border-[var(--accent-border)] font-mono shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-200">
            {crew.name.slice(0, 2).toUpperCase()}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Heading level={4} className="text-[15px] font-semibold tracking-tight truncate text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{crew.name}</Heading>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider font-medium flex items-center gap-1"><VisIcon className="w-3 h-3 text-[var(--accent)]" /> {visibilityConfig[crew.visibility]?.label || 'Public Squad'}</span>
              <span className="w-1 h-1 rounded-full bg-[var(--border-subtle)]"></span>
              <span className="text-[10px] text-[var(--success)] font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse"></span>{onlineMembers} Active</span>
            </div>
          </div>
        </div>
        <Badge variant="primary" size="xs" className="shrink-0 font-mono text-[10px]">{categoryTag}</Badge>
      </div>
      <Text variant="muted" className="text-[13px] line-clamp-2 min-h-[2.8em] leading-relaxed relative z-10">{crew.description || 'No detailed mission description provided for this crew.'}</Text>
      <div className="grid grid-cols-2 gap-2 relative z-10 pt-1">
        <div className="flex items-center gap-2.5 p-2.5 bg-[var(--bg-subtle)]/60 rounded-lg border border-[var(--border-subtle)]">
          <Users className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <div className="flex flex-col min-w-0"><span className="block text-[12px] font-bold text-[var(--text-primary)] leading-none tabular-nums">{crew.memberCount ?? 0}/{crew.memberCap ?? 50}</span><span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-1 font-semibold truncate">Members</span></div>
        </div>
        <div className="flex items-center gap-2.5 p-2.5 bg-[var(--bg-subtle)]/60 rounded-lg border border-[var(--border-subtle)]">
          <Flame className={cn("w-4 h-4 shrink-0", activityScore > 75 ? "text-[var(--danger)]" : "text-[var(--warning)]")} />
          <div className="flex flex-col min-w-0"><span className="block text-[12px] font-bold text-[var(--text-primary)] leading-none tabular-nums">{activityScore}%</span><span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-1 font-semibold truncate">Activity Score</span></div>
        </div>
      </div>
      <div className="mt-auto pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 relative z-10">
        <Button size="sm" variant="outline" onClick={() => onPreview(crew)} className="h-8 px-2.5 text-[12px] gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-subtle)]"><Eye className="w-3.5 h-3.5" /> Preview</Button>
        <AnimatePresence mode="wait">
          {isMember ? (
            <motion.button key="joined" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={() => navigate(`/app/crews/${crew.id}`)} className="flex items-center gap-1.5 px-3 h-8 text-[12px] font-semibold rounded-md bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/30 hover:bg-[var(--success)] hover:text-white transition-colors cursor-pointer"><CheckCircle2 className="w-3.5 h-3.5" /> Joined</motion.button>
          ) : isInviteOnly ? (
            <div className="flex items-center gap-1.5 px-3 h-8 text-[12px] font-semibold rounded-md bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)] cursor-not-allowed"><Lock className="w-3.5 h-3.5" /> Private</div>
          ) : (
            <Button key="join" size="sm" variant="primary" onClick={() => onJoin(crew.id)} disabled={isJoining || isFull} className={cn("h-8 text-[12px] gap-1.5 shadow-xs font-semibold", isFull && "opacity-60 cursor-not-allowed")}>
              {isJoining ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Joining...</> : isFull ? "Squad Full" : <><Rocket className="w-3 h-3" /> Join Crew</>}
            </Button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function CrewQuickPreviewModal({ crew, isOpen, onClose, onJoin, isJoining, isMember, navigate }) {
  if (!crew) return null;
  const isFull = (crew.memberCount ?? 0) >= (crew.memberCap ?? 50);
  const fillPct = Math.min(100, Math.round(((crew.memberCount || 0) / (crew.memberCap || 50)) * 100));
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-lg bg-[var(--bg-card)] border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl">
        <ModalHeader className="space-y-2">
          <div className="flex items-center gap-2"><span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase font-bold tracking-wider">{crew.visibility || 'PUBLIC'}</span><span className="text-[11px] text-[var(--text-muted)] font-mono font-medium">Crew ID: {crew.id?.slice(0, 8)}</span></div>
          <ModalTitle className="text-[20px] font-bold text-[var(--text-primary)] flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-[14px] flex items-center justify-center border border-[var(--accent-border)] font-mono shrink-0">{crew.name.slice(0, 2).toUpperCase()}</div>{crew.name}</ModalTitle>
          <ModalDescription className="text-[13px] text-[var(--text-secondary)] leading-relaxed pt-1">{crew.description || 'No detailed mission description available for this public crew.'}</ModalDescription>
        </ModalHeader>
        <div className="space-y-4 py-4">
          <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between text-[12px]"><span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[var(--accent)]" /> Squad Capacity</span><span className="font-mono text-[11px] font-bold text-[var(--text-secondary)]">{crew.memberCount ?? 0} / {crew.memberCap ?? 50} Members ({fillPct}%)</span></div>
            <div className="h-2 w-full bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-subtle)]"><div className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--info)] transition-all duration-500 rounded-full" style={{ width: `${fillPct}%` }} /></div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-[var(--bg-subtle)]/50 rounded-lg border border-[var(--border-subtle)]"><span className="block text-[14px] font-bold text-[var(--text-primary)] font-mono">{crew.projectCount ?? 0}</span><span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Projects</span></div>
            <div className="p-2.5 bg-[var(--bg-subtle)]/50 rounded-lg border border-[var(--border-subtle)]"><span className="block text-[14px] font-bold text-[var(--text-primary)] font-mono">{crew.channelCount ?? 3}</span><span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Channels</span></div>
            <div className="p-2.5 bg-[var(--bg-subtle)]/50 rounded-lg border border-[var(--border-subtle)]"><span className="block text-[14px] font-bold text-[var(--success)] font-mono">Active</span><span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Status</span></div>
          </div>
          <div className="space-y-1.5"><span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Mission Tags</span><div className="flex flex-wrap gap-1.5">{['Engineering', 'Agile', 'Product Delivery', 'Open Squad'].map(t => <Badge key={t} variant="secondary" size="xs" className="font-mono text-[10px]">#{t}</Badge>)}</div></div>
        </div>
        <ModalFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} className="h-9 text-[12px]">Close</Button>
          {isMember ? <Button variant="primary" onClick={() => { onClose(); navigate(`/app/crews/${crew.id}`); }} className="h-9 text-[12px] gap-1.5 bg-[var(--success)] hover:bg-[var(--success)]/90"><CheckCircle2 className="w-4 h-4" /> Open Crew Workspace</Button>
          : <Button variant="primary" onClick={() => { onJoin(crew.id); onClose(); }} disabled={isJoining || isFull} className="h-9 text-[12px] gap-1.5">{isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}{isFull ? 'Squad Full' : 'Join Squad Now'}</Button>}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function CrewDiscoverPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [filterTab, setFilterTab] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('All Missions');
  const [previewCrew, setPreviewCrew] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const { data: allCrews = [], isLoading, isFetching, isError, refetch } = useDiscoverCrews();
  const joinMutation = useJoinPublicCrew();

  const categoryCounts = useMemo(() => {
    if (!Array.isArray(allCrews)) return {};
    const counts = { 'All Missions': allCrews.length };
    allCrews.forEach(c => {
      const lower = (c.name + ' ' + (c.description || '')).toLowerCase();
      if (lower.includes('design') || lower.includes('ui') || lower.includes('ux')) counts['Design'] = (counts['Design'] || 0) + 1;
      else if (lower.includes('market') || lower.includes('growth') || lower.includes('seo')) counts['Marketing'] = (counts['Marketing'] || 0) + 1;
      else if (lower.includes('prod') || lower.includes('roadmap')) counts['Product'] = (counts['Product'] || 0) + 1;
      else if (lower.includes('ops') || lower.includes('operation')) counts['Operations'] = (counts['Operations'] || 0) + 1;
      else if (lower.includes('growth')) counts['Growth'] = (counts['Growth'] || 0) + 1;
      else if (lower.includes('research') || lower.includes('r&d')) counts['Research'] = (counts['Research'] || 0) + 1;
      else counts['Engineering'] = (counts['Engineering'] || 0) + 1;
    });
    return counts;
  }, [allCrews]);

  const crews = useMemo(() => {
    if (!Array.isArray(allCrews)) return [];
    return allCrews.filter(c => {
      const q = keyword.toLowerCase().trim();
      const matchesSearch = !q || c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      const isMember = !!c.myRole;
      const isFull = (c.memberCount ?? 0) >= (c.memberCap ?? 50);
      if (filterTab === 'OPEN' && (isMember || isFull)) return false;
      if (filterTab === 'JOINED' && !isMember) return false;
      if (selectedCategory !== 'All Missions') {
        const lower = (c.name + ' ' + (c.description || '')).toLowerCase();
        if (selectedCategory === 'Design' && !(lower.includes('design') || lower.includes('ui') || lower.includes('ux'))) return false;
        if (selectedCategory === 'Marketing' && !(lower.includes('market') || lower.includes('growth') || lower.includes('seo'))) return false;
        if (selectedCategory === 'Product' && !(lower.includes('prod') || lower.includes('roadmap'))) return false;
        if (selectedCategory === 'Engineering' && (lower.includes('design') || lower.includes('market') || lower.includes('prod'))) return false;
      }
      return true;
    });
  }, [allCrews, keyword, filterTab, selectedCategory]);

  const trendingCrews = useMemo(() => {
    if (!Array.isArray(allCrews)) return [];
    return [...allCrews].sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0)).slice(0, 4);
  }, [allCrews]);

  const featuredCrew = useMemo(() => (!Array.isArray(allCrews) || allCrews.length === 0) ? null : allCrews[0], [allCrews]);

  const totalSeatsOpen = useMemo(() => {
    if (!Array.isArray(allCrews)) return 0;
    return allCrews.reduce((acc, c) => acc + Math.max(0, (c.memberCap || 50) - (c.memberCount || 0)), 0);
  }, [allCrews]);

  const pageState = isLoading ? 'loading' : isError ? 'error' : crews.length === 0 ? 'empty' : 'ready';

  return (
    <PageShell maxWidth="default">
      {isFetching && !isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[var(--bg-subtle)] overflow-hidden"><div className="h-full bg-[var(--accent)] animate-pulse w-full" /></div>
      )}
      {!isOnline && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning)]/30 text-[12px] font-medium mx-auto max-w-3xl">
          <WifiOff className="w-4 h-4 shrink-0" /><span>Real-time connectivity lost. Showing cached public squad catalog.</span>
        </div>
      )}

      <PageHero title="Explore & Join Squads" subtitle="Connect with mission-driven teams across engineering, design, marketing, and product." eyebrow="Community Mission Hub">
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="h-8 text-[12px] gap-1.5 border-[var(--border-subtle)] text-[var(--text-secondary)]">
          <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} /> Refresh
        </Button>
      </PageHero>

      {featuredCrew && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl bg-gradient-to-r from-[var(--accent-soft)] via-[var(--bg-card)] to-[var(--bg-subtle)] border border-[var(--accent-border)] p-6 overflow-hidden shadow-xs mx-auto max-w-5xl mb-4">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[var(--accent-soft)] rounded-full blur-3xl opacity-40 pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--accent)] border border-[var(--accent-border)] text-[10px] font-bold uppercase tracking-wider font-mono"><Sparkles className="w-3 h-3" /> Spotlight Mission</div>
              <Heading level={2} className="text-[18px] font-bold tracking-tight text-[var(--text-primary)]">{featuredCrew.name}</Heading>
              <Text variant="muted" className="text-[13px] line-clamp-2 leading-relaxed max-w-2xl">{featuredCrew.description || 'Join this high-impact squad and help drive collaborative projects forward.'}</Text>
              <div className="flex items-center gap-4 pt-1 flex-wrap text-[12px] font-medium text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[var(--accent)]" /> {featuredCrew.memberCount ?? 0}/{featuredCrew.memberCap ?? 50} Members</span>
                <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-[var(--info)]" /> {featuredCrew.projectCount ?? 0} Shared Projects</span>
                <span className="flex items-center gap-1.5 text-[var(--success)] font-semibold"><Flame className="w-4 h-4" fill="currentColor" /> Trending Squad</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2">
              <Button variant="primary" size="md" onClick={() => setPreviewCrew(featuredCrew)} className="h-10 text-[13px] font-bold gap-2 shadow-xs"><Eye className="w-4 h-4" /> Quick Mission Spotlight</Button>
            </div>
          </div>
        </motion.div>
      )}

      <PageToolbar>
        <div className="space-y-3 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-lg border border-[var(--border-subtle)] w-full sm:w-fit">
              {[{ id: 'ALL', label: 'All Public' }, { id: 'OPEN', label: 'Open Seats' }, { id: 'JOINED', label: 'My Squads' }].map((tab) => (
                <button key={tab.id} onClick={() => setFilterTab(tab.id)}
                  className={cn("px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors whitespace-nowrap w-full sm:w-auto cursor-pointer", filterTab === tab.id ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]")}>{tab.label}</button>
              ))}
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search squads by name or mission..."
                className="w-full pl-9 pr-8 py-1.5 text-[13px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-colors text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" />
              {keyword && <button onClick={() => setKeyword('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 cursor-pointer"><X className="w-3.5 h-3.5" /></button>}
            </div>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
            <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1"><Filter className="w-3 h-3 text-[var(--accent)]" /> Categories:</span>
            {categories.map((cat) => {
              const count = categoryCounts[cat] ?? 0;
              const isSelected = selectedCategory === cat;
              return (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={cn("px-2.5 py-1 text-[11px] font-medium rounded-full border transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0",
                    isSelected ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)] font-semibold shadow-xs" : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]")}>
                  <span>{cat}</span><span className={cn("px-1.5 py-0.2 text-[9px] font-mono rounded-full", isSelected ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-subtle)] text-[var(--text-muted)]")}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </PageToolbar>

      <PageContent>
        <PageState state={pageState} moduleId="discover" stateProps={{ loadingVariant: 'cards' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {isError ? (
                <ErrorState title="Unable to load discoverable squads" description="We encountered an issue connecting to the crew service. Please verify your connection."
                  action={<Button variant="outline" size="sm" onClick={() => refetch()} className="h-8 text-[12px] gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Try Again</Button>} />
              ) : isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 h-[230px] flex flex-col justify-between animate-pulse">
                      <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)]" /><div className="space-y-2"><div className="w-32 h-4 bg-[var(--bg-subtle)] rounded-md" /><div className="w-20 h-3 bg-[var(--bg-subtle)] rounded-md" /></div></div><div className="w-14 h-5 bg-[var(--bg-subtle)] rounded-full" /></div>
                      <div className="space-y-2"><div className="w-full h-3 bg-[var(--bg-subtle)] rounded-md" /><div className="w-3/4 h-3 bg-[var(--bg-subtle)] rounded-md" /></div>
                      <div className="grid grid-cols-2 gap-2"><div className="h-10 bg-[var(--bg-subtle)] rounded-lg" /><div className="h-10 bg-[var(--bg-subtle)] rounded-lg" /></div>
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]"><div className="w-16 h-7 bg-[var(--bg-subtle)] rounded-md" /><div className="w-20 h-7 bg-[var(--bg-subtle)] rounded-md" /></div>
                    </div>
                  ))}
                </div>
              ) : crews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-card)] p-8">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)] flex items-center justify-center mb-3 border border-[var(--border-subtle)]"><Search className="w-6 h-6" /></div>
                  <Heading level={3} className="text-[16px] font-bold tracking-tight mb-1 text-[var(--text-primary)]">No public squads found</Heading>
                  <Text variant="muted" className="text-[13px] max-w-sm mb-6 leading-relaxed">{keyword || selectedCategory !== 'All Missions' || filterTab !== 'ALL' ? 'No squads match your current filter selection or search terms.' : 'There are currently no public crews available to join.'}</Text>
                  {(keyword || selectedCategory !== 'All Missions' || filterTab !== 'ALL') && <Button variant="outline" size="sm" onClick={() => { setKeyword(''); setFilterTab('ALL'); setSelectedCategory('All Missions'); }} className="h-8 text-[12px] gap-1.5"><X className="w-3.5 h-3.5" /> Clear All Filters</Button>}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {crews.map(crew => <DiscoverCrewCard key={crew.id} crew={crew} navigate={navigate} onJoin={(id) => joinMutation.mutate(id)} isJoining={joinMutation.isPending && joinMutation.variables === crew.id} joined={joinMutation.isSuccess && joinMutation.variables === crew.id} onPreview={(c) => setPreviewCrew(c)} />)}
                </div>
              )}
            </div>
            <div className="hidden lg:flex lg:flex-col gap-5">
              <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-xs">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 bg-[var(--bg-subtle)]/60 rounded-lg border border-[var(--border-subtle)]"><span className="block text-[18px] font-bold text-[var(--text-primary)] font-mono">{allCrews.length}</span><span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">Public Squads</span></div>
                  <div className="p-3 bg-[var(--bg-subtle)]/60 rounded-lg border border-[var(--border-subtle)]"><span className="block text-[18px] font-bold text-[var(--accent)] font-mono">{totalSeatsOpen}</span><span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">Seats Open</span></div>
                </div>
              </div>
              <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-xs sticky top-36">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[var(--accent)]" /><Heading level={4} className="text-[14px] font-bold tracking-tight text-[var(--text-primary)]">Trending Squads</Heading></div>
                  <Badge variant="primary" size="xs" className="font-mono text-[9px]">LIVE RANK</Badge>
                </div>
                <div className="space-y-2.5">
                  {trendingCrews.map((crew, index) => (
                    <div key={crew.id} onClick={() => setPreviewCrew(crew)} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-subtle)] cursor-pointer transition-colors group border border-transparent hover:border-[var(--border-subtle)]">
                      <span className={cn("w-5 h-5 rounded-full font-mono text-[10px] font-bold flex items-center justify-center shrink-0", index === 0 ? "bg-[var(--warning-soft)] text-[#B45309] border border-[var(--warning)]/30" : index === 1 ? "bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)]" : "text-[var(--text-muted)]")}>#{index + 1}</span>
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-[11px] flex items-center justify-center border border-[var(--accent-border)] font-mono shrink-0">{crew.name.slice(0, 2).toUpperCase()}</div>
                      <div className="flex-1 min-w-0"><div className="text-[13px] font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">{crew.name}</div><div className="text-[11px] text-[var(--text-muted)] flex items-center gap-2 mt-0.5"><span className="flex items-center gap-1"><Users className="w-3 h-3" /> {crew.memberCount ?? 0}</span><span>•</span><span className="text-[var(--success)] font-medium">Active</span></div></div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                  {trendingCrews.length === 0 && <Text variant="muted" size="xs" className="text-center py-4 italic text-[12px]">No trending squads to rank yet.</Text>}
                </div>
              </div>
            </div>
          </div>
        </PageState>
      </PageContent>

      <CrewQuickPreviewModal crew={previewCrew} isOpen={!!previewCrew} onClose={() => setPreviewCrew(null)} onJoin={(id) => joinMutation.mutate(id)} isJoining={joinMutation.isPending && joinMutation.variables === previewCrew?.id} isMember={!!previewCrew?.myRole} navigate={navigate} />
    </PageShell>
  );
}
export default CrewDiscoverPage;
