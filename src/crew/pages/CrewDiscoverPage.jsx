import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { Heading, Text } from '@/shared/ui/Typography';
import { ErrorState } from '@/shared/ui/ErrorState';
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter
} from '@/shared/ui/Modal';
import { PageShell, PageHero, PageContent } from '@/shared/ui/PageShell';
import { PageState } from '@/shared/ui/PageState';
import { EntityCard, EntityStatStrip, EntityFilterBar } from '@/shared/ui/entity-card';
import { useDiscoverCrews, useJoinPublicCrew } from '../features/hooks/useCrews';
import {
  Search, Users, Flame, CheckCircle2, Loader2,
  ArrowUpRight, Lock, Globe, Eye, RefreshCw, WifiOff, X, TrendingUp
} from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';
import { Skeleton } from '@/shared/ui/Skeleton';

const categories = ['All', 'Engineering', 'Design', 'Product', 'Marketing', 'Operations', 'Growth', 'Research'];

function DiscoverCrewCard({ crew, navigate, onJoin, isJoining, joined, onPreview }) {
  const isMember = !!crew.myRole || joined;
  const isFull = (crew.memberCount ?? 0) >= (crew.memberCap ?? 50);
  const isInviteOnly = crew.visibility === 'INVITE_ONLY';
  const fillPct = Math.min(100, Math.round(((crew.memberCount || 0) / (crew.memberCap || 50)) * 100));
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
    <EntityCard
      type="discover"
      glyph={<span className="text-sm font-medium">{crew.name.slice(0, 2).toUpperCase()}</span>}
      name={crew.name}
      tagline={crew.description || 'No description provided.'}
      onClick={() => onPreview(crew)}
      showArrow
      badges={[<span key="cat" className="ec-badge ec-badge--ghost">{categoryTag}</span>]}
      meta={[
        { icon: <Users style={{ width: 12, height: 12 }} />, text: `${crew.memberCount ?? 0}/${crew.memberCap ?? 50} members` },
      ]}
      progress={fillPct}
      footer={
        <div className="ec-card-foot">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onPreview(crew); }} className="h-8 px-2 text-xs gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <Eye className="w-3.5 h-3.5" /> Preview
          </Button>
          <AnimatePresence mode="wait">
            {isMember ? (
              <motion.button key="joined" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={(e) => { e.stopPropagation(); navigate(`/app/crews/${crew.id}`); }} className="flex items-center gap-1.5 px-3 h-8 text-xs font-medium text-[var(--success)] hover:opacity-80 transition-opacity">
                <CheckCircle2 className="w-3.5 h-3.5" /> Open
              </motion.button>
            ) : isInviteOnly ? (
              <span className="flex items-center gap-1.5 px-3 h-8 text-xs text-[var(--text-muted)]"><Lock className="w-3.5 h-3.5" /> Invite only</span>
            ) : (
              <Button key="join" size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); onJoin(crew.id); }} disabled={isJoining || isFull} className={cn('h-8 text-xs font-medium', isFull && 'opacity-60 cursor-not-allowed')}>
                {isJoining ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Joining</> : isFull ? 'Full' : 'Join'}
              </Button>
            )}
          </AnimatePresence>
        </div>
      }
    />
  );
}

function CrewQuickPreviewModal({ crew, isOpen, onClose, onJoin, isJoining, isMember, navigate }) {
  if (!crew) return null;
  const isFull = (crew.memberCount ?? 0) >= (crew.memberCap ?? 50);
  const fillPct = Math.min(100, Math.round(((crew.memberCount || 0) / (crew.memberCap || 50)) * 100));
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg p-6">
        <ModalHeader>
          <ModalTitle className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-medium text-sm flex items-center justify-center shrink-0">
              {crew.name.slice(0, 2).toUpperCase()}
            </div>
            {crew.name}
          </ModalTitle>
          <ModalDescription className="text-sm text-[var(--text-secondary)] leading-relaxed pt-1">
            {crew.description || 'No description available for this crew.'}
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>{crew.memberCount ?? 0} of {crew.memberCap ?? 50} members</span>
              <span>{fillPct}%</span>
            </div>
            <div className="h-1 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${fillPct}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div>
              <div className="font-medium text-[var(--text-primary)]">{crew.projectCount ?? 0}</div>
              <Text variant="muted" size="xs">Projects</Text>
            </div>
            <div>
              <div className="font-medium text-[var(--text-primary)]">{crew.channelCount ?? 3}</div>
              <Text variant="muted" size="xs">Channels</Text>
            </div>
            <div>
              <div className="font-medium text-[var(--text-primary)]">
                {crew.visibility === 'INVITE_ONLY' ? 'Invite only' : 'Public'}
              </div>
              <Text variant="muted" size="xs">Visibility</Text>
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={onClose} className="h-9 text-sm">Close</Button>
          {isMember ? (
            <Button variant="primary" onClick={() => { onClose(); navigate(`/app/crews/${crew.id}`); }} className="h-9 text-sm gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Open crew
            </Button>
          ) : (
            <Button variant="primary" onClick={() => { onJoin(crew.id); onClose(); }} disabled={isJoining || isFull} className="h-9 text-sm gap-1.5">
              {isJoining && <Loader2 className="w-4 h-4 animate-spin" />}
              {isFull ? 'Crew full' : 'Join crew'}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function CrewDiscoverPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [filterTab, setFilterTab] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('All');
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
    const counts = { All: allCrews.length };
    allCrews.forEach(c => {
      const lower = (c.name + ' ' + (c.description || '')).toLowerCase();
      if (lower.includes('design') || lower.includes('ui') || lower.includes('ux')) counts['Design'] = (counts['Design'] || 0) + 1;
      else if (lower.includes('market') || lower.includes('growth') || lower.includes('seo')) counts['Marketing'] = (counts['Marketing'] || 0) + 1;
      else if (lower.includes('prod') || lower.includes('roadmap')) counts['Product'] = (counts['Product'] || 0) + 1;
      else if (lower.includes('ops') || lower.includes('operation')) counts['Operations'] = (counts['Operations'] || 0) + 1;
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
      if (selectedCategory !== 'All') {
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
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-[var(--accent)]/40 overflow-hidden"><div className="h-full bg-[var(--accent)] animate-pulse w-full" /></div>
      )}
      {!isOnline && (
        <div className="flex items-center gap-2 py-2.5 px-3 text-sm text-[var(--warning)] mx-auto max-w-3xl">
          <WifiOff className="w-4 h-4 shrink-0" /><span>You're offline. Showing the last cached list of crews.</span>
        </div>
      )}

      <PageHero title="Discover crews" subtitle="Find teams across engineering, design, marketing, and product." eyebrow="">
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="h-8 text-xs gap-1.5">
          <RefreshCw className={cn('w-3.5 h-3.5', isFetching && 'animate-spin')} /> Refresh
        </Button>
      </PageHero>

      <EntityStatStrip
        stats={[
          { key: 'crews', label: 'Public crews', value: Array.isArray(allCrews) ? allCrews.length : 0, icon: Globe },
          { key: 'seats', label: 'Seats open', value: totalSeatsOpen, icon: Users },
          { key: 'members', label: 'Members', value: (Array.isArray(allCrews) ? allCrews.reduce((a, c) => a + (c.memberCount || 0), 0) : 0).toLocaleString(), icon: Users },
        ]}
      />

      {featuredCrew && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="border border-[var(--border-subtle)] rounded-lg p-6 mx-auto max-w-5xl mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-2">
              <Text variant="muted" size="xs">Featured</Text>
              <Heading level={2} className="text-base font-medium text-[var(--text-primary)]">{featuredCrew.name}</Heading>
              <Text variant="muted" className="text-sm line-clamp-2 leading-relaxed max-w-2xl">
                {featuredCrew.description || 'Join this crew and help drive its projects forward.'}
              </Text>
              <div className="flex items-center gap-4 pt-1 flex-wrap text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {featuredCrew.memberCount ?? 0}/{featuredCrew.memberCap ?? 50} members</span>
                <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> Trending</span>
              </div>
            </div>
            <div className="flex lg:justify-end">
              <Button variant="outline" size="sm" onClick={() => setPreviewCrew(featuredCrew)} className="h-9 text-sm gap-1.5">
                <Eye className="w-4 h-4" /> Preview
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="w-full space-y-3">
        <EntityFilterBar
          search={keyword}
          onSearch={setKeyword}
          searchPlaceholder="Search crews by name or description"
          chips={[
            { id: 'ALL', label: 'All', count: Array.isArray(allCrews) ? allCrews.length : 0 },
            { id: 'OPEN', label: 'Open seats', count: (Array.isArray(allCrews) ? allCrews : []).filter(c => !c.myRole && ((c.memberCount ?? 0) < (c.memberCap ?? 50))).length },
            { id: 'JOINED', label: 'My crews', count: (Array.isArray(allCrews) ? allCrews : []).filter(c => !!c.myRole).length },
          ]}
          activeChip={filterTab}
          onChip={setFilterTab}
        />
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const count = categoryCounts[cat] ?? 0;
            const isSelected = selectedCategory === cat;
            return (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={cn('px-2.5 py-1 text-xs rounded-full border transition-colors whitespace-nowrap shrink-0',
                  isSelected ? 'text-[var(--accent)] border-[var(--accent-border)]' : 'text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]')}>
                {cat}{count > 0 && ` (${count})`}
              </button>
            );
          })}
        </div>
      </div>

      <PageContent>
        <PageState state={pageState} moduleId="discover" stateProps={{ skeleton: <CrewDiscoverSkeleton />, loadingVariant: 'cards' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {isError ? (
                <ErrorState title="Unable to load crews" description="There was a problem connecting to the crew service. Check your connection and try again."
                  action={<Button variant="outline" size="sm" onClick={() => refetch()} className="h-8 text-xs gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Try again</Button>} />
              ) : isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border border-[var(--border-subtle)] rounded-lg p-5 h-[190px] flex flex-col justify-between animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--bg-subtle)]" />
                        <div className="space-y-1.5 flex-1"><div className="w-28 h-3.5 bg-[var(--bg-subtle)] rounded" /><div className="w-20 h-3 bg-[var(--bg-subtle)] rounded" /></div>
                      </div>
                      <div className="space-y-2"><div className="w-full h-3 bg-[var(--bg-subtle)] rounded" /><div className="w-3/4 h-3 bg-[var(--bg-subtle)] rounded" /></div>
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]"><div className="w-14 h-6 bg-[var(--bg-subtle)] rounded" /><div className="w-16 h-6 bg-[var(--bg-subtle)] rounded" /></div>
                    </div>
                  ))}
                </div>
              ) : crews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--border-subtle)] rounded-lg">
                  <Search className="w-5 h-5 text-[var(--text-muted)] mb-3" />
                  <Heading level={3} className="text-sm font-medium text-[var(--text-primary)]">No crews found</Heading>
                  <Text variant="muted" className="text-sm max-w-sm mt-1 mb-4 leading-relaxed">
                    {keyword || selectedCategory !== 'All' || filterTab !== 'ALL' ? 'No crews match your search or filters.' : 'There are no public crews available yet.'}
                  </Text>
                  {(keyword || selectedCategory !== 'All' || filterTab !== 'ALL') && (
                    <Button variant="outline" size="sm" onClick={() => { setKeyword(''); setFilterTab('ALL'); setSelectedCategory('All'); }} className="h-8 text-xs gap-1.5">
                      <X className="w-3.5 h-3.5" /> Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="ec-grid">
                  {crews.map(crew => (
                    <DiscoverCrewCard
                      key={crew.id}
                      crew={crew}
                      navigate={navigate}
                      onJoin={(id) => joinMutation.mutate(id)}
                      isJoining={joinMutation.isPending && joinMutation.variables === crew.id}
                      joined={joinMutation.isSuccess && joinMutation.variables === crew.id}
                      onPreview={(c) => setPreviewCrew(c)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="hidden lg:flex lg:flex-col gap-5">
              <div className="border border-[var(--border-subtle)] rounded-lg p-5 sticky top-36">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-[var(--text-muted)]" />
                  <Heading level={4} className="text-sm font-medium text-[var(--text-primary)]">Trending</Heading>
                </div>
                <div className="space-y-1">
                  {trendingCrews.map((crew, index) => (
                    <div key={crew.id} onClick={() => setPreviewCrew(crew)} className="flex items-center gap-3 py-2 cursor-pointer group">
                      <span className="text-xs text-[var(--text-muted)] w-4 shrink-0">{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">{crew.name}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-0.5">{crew.memberCount ?? 0} members</div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                  {trendingCrews.length === 0 && <Text variant="muted" size="xs" className="py-4">No trending crews yet.</Text>}
                </div>
              </div>
            </div>
          </div>
        </PageState>
      </PageContent>

      <CrewQuickPreviewModal
        crew={previewCrew}
        isOpen={!!previewCrew}
        onClose={() => setPreviewCrew(null)}
        onJoin={(id) => joinMutation.mutate(id)}
        isJoining={joinMutation.isPending && joinMutation.variables === previewCrew?.id}
        isMember={!!previewCrew?.myRole}
        navigate={navigate}
      />
    </PageShell>
  );
}
export default CrewDiscoverPage;

function CrewDiscoverSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] px-4 py-3">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <div className="space-y-1.5"><Skeleton className="h-4 w-14" /><Skeleton className="h-3 w-20" /></div>
          </div>
        ))}
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-[var(--border-subtle)] p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20" /></div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-6 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}