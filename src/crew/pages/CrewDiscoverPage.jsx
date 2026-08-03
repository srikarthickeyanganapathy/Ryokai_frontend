import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Heading, Text } from '@/shared/ui/Typography';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useDiscoverCrews, useJoinPublicCrew } from '../features/hooks/useCrews';
import {
  WorkspaceShell,
  ManagementLayout,
} from '@/shared/workspace-framework';
import { 
  Search, 
  Users, 
  Compass, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Loader2, 
  Hash,
  ArrowUpRight,
  Lock,
  Globe,
  Link2,
  Activity
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const popularTags = ['Engineering', 'Design', 'Marketing', 'Operations', 'R&D', 'Growth'];

function DiscoverCrewCard({ crew, navigate, onJoin, isJoining, joined }) {
  const isMember = !!crew.myRole || joined;
  const isFull = (crew.memberCount ?? 0) >= crew.memberCap;
  const isInviteOnly = crew.visibility === 'INVITE_ONLY';

  const visibilityConfig = {
    PUBLIC: { icon: Globe, label: 'Public' },
    PUBLIC_LINK: { icon: Link2, label: 'Public Link' },
    INVITE_ONLY: { icon: Lock, label: 'Invite Only' },
  };
  const VisIcon = visibilityConfig[crew.visibility]?.icon || Globe;

  const activityScore = useMemo(() => Math.min(100, Math.round((crew.memberCount / (crew.memberCap || 1)) * 100 + 10)), [crew]);
  const onlineMembers = useMemo(() => Math.max(1, Math.round((crew.memberCount || 1) * 0.3)), [crew]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col gap-4 hover:border-[var(--accent-border)] hover:shadow-sm transition-all duration-200 overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-[13px] flex items-center justify-center border border-[var(--accent-border)] font-mono shadow-sm shrink-0">
            {crew.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <Heading level={4} className="text-[14px] font-semibold tracking-tight truncate text-[var(--text-primary)]">
              {crew.name}
            </Heading>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-mono tracking-wider font-semibold flex items-center gap-1">
                <VisIcon className="w-3 h-3" /> {visibilityConfig[crew.visibility]?.label || 'Public'}
              </span>
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]"></span>
              <span className="text-[10px] text-[var(--success)] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse"></span>
                {onlineMembers} Online
              </span>
            </div>
          </div>
        </div>

        {!isInviteOnly && (
          <div className="flex items-center gap-1 shrink-0 bg-[var(--bg-subtle)] px-2 py-1 rounded-md border border-[var(--border-subtle)]">
            <Flame className={cn("w-3 h-3", activityScore > 80 ? "text-[var(--danger)]" : "text-[var(--warning)]")} fill="currentColor" />
            <span className="text-[10px] font-mono font-semibold text-[var(--text-primary)]">{activityScore}</span>
          </div>
        )}
      </div>

      <Text variant="muted" className="text-[12px] line-clamp-2 min-h-[3em] leading-relaxed relative z-10">
        {crew.description || 'No mission description provided.'}
      </Text>

      <div className="grid grid-cols-2 gap-2 relative z-10">
        <div className="flex items-center gap-2 p-2.5 bg-[var(--bg-subtle)]/50 rounded-lg border border-[var(--border-subtle)]">
          <Users className="w-3.5 h-3.5 text-[var(--accent)]" />
          <div className="flex flex-col">
            <span className="block text-[12px] font-bold text-[var(--text-primary)] leading-none tabular-nums">{crew.memberCount ?? 0}/{crew.memberCap}</span>
            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-1 font-semibold">Members</span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 bg-[var(--bg-subtle)]/50 rounded-lg border border-[var(--border-subtle)]">
          <Activity className="w-3.5 h-3.5 text-[var(--info)]" />
          <div className="flex flex-col">
            <span className="block text-[12px] font-bold text-[var(--text-primary)] leading-none tabular-nums">{crew.projectCount ?? 0}</span>
            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mt-1 font-semibold">Projects</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between relative z-10">
        <Text size="xs" variant="muted" className="font-medium flex items-center gap-1.5 text-[11px]">
          <Sparkles className="w-3 h-3 text-[var(--warning)]" /> Active today
        </Text>
        
        <AnimatePresence mode="wait">
          {isMember ? (
            <motion.button
              key="joined"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => navigate(`/app/crews/${crew.id}`)}
              className="flex items-center gap-1.5 px-3 h-8 text-[12px] font-semibold rounded-md bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/20 hover:bg-[var(--success)] hover:text-white transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Joined
            </motion.button>
          ) : isInviteOnly ? (
            <div
              className="flex items-center gap-1.5 px-3 h-8 text-[12px] font-semibold rounded-md bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)] cursor-not-allowed"
            >
              <Lock className="w-3.5 h-3.5" /> Private
            </div>
          ) : (
            <Button
              key="join"
              size="sm"
              variant="primary"
              onClick={() => onJoin(crew.id)}
              disabled={isJoining || isFull}
              className={cn(
                "h-8 text-[12px] gap-1.5 shadow-sm",
                isFull && "opacity-60 cursor-not-allowed"
              )}
            >
              {isJoining ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Joining...</>
              ) : isFull ? (
                "Squad Full"
              ) : (
                "Join Crew"
              )}
            </Button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function CrewDiscoverPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [filterTab, setFilterTab] = useState('ALL');
  const [activeTag, setActiveTag] = useState(null);

  const { data: allCrews = [], isLoading } = useDiscoverCrews();
  const joinMutation = useJoinPublicCrew();

  const crews = useMemo(() => {
    if (!Array.isArray(allCrews)) return [];
    return allCrews.filter(c => {
      const q = keyword.toLowerCase().trim();
      const matchesSearch = !q || c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      const isMember = !c.myRole;
      const isFull = (c.memberCount ?? 0) >= c.memberCap;

      if (filterTab === 'OPEN') return !isMember && !isFull;
      if (filterTab === 'JOINED') return isMember;
      return true;
    });
  }, [allCrews, keyword, filterTab, activeTag]);

  const trendingCrews = useMemo(() => {
    return [...allCrews].sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0)).slice(0, 3);
  }, [allCrews]);

  const pageState = isLoading ? 'loading' : crews.length === 0 ? 'empty' : 'ready';

  return (
    <WorkspaceShell maxWidth="default">
      <ManagementLayout
        header={
          <div className="space-y-4 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
                Discover
              </span>
              <span className="text-[12px] text-[var(--text-muted)] font-medium flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-[var(--accent)]" /> Explore Public Crews
              </span>
            </div>
            <Heading level={1} className="tracking-tight text-[18px] font-semibold mb-1 text-[var(--text-primary)]">
              Find Your Squad
            </Heading>
            <Text variant="muted" className="text-[13px] leading-relaxed">
              Browse and join active, high-impact crews across your organization.
            </Text>
          </div>
        }
        toolbar={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 sticky top-0 z-10 bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-lg border border-[var(--border-subtle)] w-full sm:w-fit">
              {[
                { id: 'ALL', label: 'All Public' },
                { id: 'OPEN', label: 'Open Seats' },
                { id: 'JOINED', label: 'My Crews' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id)}
                  className={cn(
                    "px-3 py-1 text-[12px] font-medium rounded-md transition-colors whitespace-nowrap w-full sm:w-auto cursor-pointer",
                    filterTab === tab.id ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search by name or mission..."
                className="w-full pl-9 pr-3 py-2 text-[13px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-colors text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          <div className="lg:col-span-2">
            {pageState === 'loading' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 h-[220px] animate-pulse" />
                ))}
              </div>
            ) : pageState === 'empty' ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)]">
                <Search className="w-8 h-8 text-[var(--text-muted)] mb-3" />
                <Heading level={3} className="text-[15px] font-semibold tracking-tight mb-2 text-[var(--text-primary)]">
                  No crews found
                </Heading>
                <Text variant="muted" className="text-[13px] max-w-md mb-5">
                  {keyword ? 'Try adjusting your search or filters.' : 'Check back later for new squads to join.'}
                </Text>
                {keyword && (
                  <Button variant="outline" size="sm" onClick={() => { setKeyword(''); setFilterTab('ALL'); }} className="h-8 text-[12px] gap-1.5">
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {crews.map(crew => (
                  <DiscoverCrewCard 
                    key={crew.id} 
                    crew={crew} 
                    navigate={navigate}
                    onJoin={(id) => joinMutation.mutate(id)}
                    isJoining={joinMutation.isPending && joinMutation.variables === crew.id}
                    joined={joinMutation.isSuccess && joinMutation.variables === crew.id}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="hidden lg:flex lg:flex-col gap-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-[var(--text-muted)]" />
                <Heading level={4} className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)]">Trending Crews</Heading>
              </div>
              <div className="space-y-2">
                {trendingCrews.map((crew, index) => (
                  <div 
                    key={crew.id} 
                    onClick={() => navigate(`/app/crews/${crew.id}`)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-subtle)] cursor-pointer transition-colors group"
                  >
                    <span className="text-[12px] font-mono font-bold text-[var(--text-muted)] w-4">{index + 1}.</span>
                    <div className="w-7 h-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-[11px] flex items-center justify-center border border-[var(--accent-border)] shrink-0">
                      {crew.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">{crew.name}</div>
                      <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                        <Users className="w-3 h-3" /> {crew.memberCount} Members
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
                {trendingCrews.length === 0 && (
                  <Text variant="muted" size="xs" className="text-center py-4 italic text-[12px]">No trending crews yet.</Text>
                )}
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-4 h-4 text-[var(--text-muted)]" />
                <Heading level={4} className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)]">Popular Tags</Heading>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setKeyword(tag)}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-medium rounded-md border transition-colors cursor-pointer",
                      keyword.toLowerCase() === tag.toLowerCase()
                        ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)] font-semibold"
                        : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ManagementLayout>
    </WorkspaceShell>
  );
}
