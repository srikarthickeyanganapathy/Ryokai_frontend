import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text, Label } from '@/shared/ui/Typography';
import { Button, IconButton } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/Select';
import { toast } from 'sonner';
import { Icons } from '@/shared/ui/Icons';
import { StatPill } from '@/shared/ui/StatPill';
import { PageShell, PageHero, PageContent } from '@/shared/ui/PageShell';
import { PageState } from '@/shared/ui/PageState';
import { EntityCard, EntityStatStrip, EntityFilterBar } from '@/shared/ui/entity-card';
import {
  Compass, Users, MoreVertical, MessageSquare, CheckSquare, Layout, Settings,
  Plus, X, Search, Sparkles, RefreshCw, Folder, Shield, UserPlus, ArrowRight, Check, Globe
} from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';
import { useCrews, useCreateCrew } from '../features/hooks/useCrews';

const PRESET_COLORS = [
  { id: 'indigo', label: 'Indigo', hex: 'var(--accent)', hue: 239, sat: 84, light: 67 },
  { id: 'cyan', label: 'Cyan', hex: 'var(--accent)', hue: 189, sat: 94, light: 43 },
  { id: 'emerald', label: 'Emerald', hex: 'var(--success)', hue: 160, sat: 84, light: 39 },
  { id: 'amber', label: 'Amber', hex: 'var(--warning)', hue: 38, sat: 92, light: 50 },
  { id: 'rose', label: 'Rose', hex: 'var(--danger)', hue: 349, sat: 89, light: 60 },
  { id: 'violet', label: 'Violet', hex: 'var(--accent)', hue: 263, sat: 90, light: 66 },
  { id: 'azure', label: 'Azure', hex: 'var(--accent)', hue: 217, sat: 91, light: 60 },
  { id: 'teal', label: 'Teal', hex: 'var(--success)', hue: 173, sat: 80, light: 40 },
];

function hashHue(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

function getCrewColorMeta(crew) {
  if (crew.avatarUrl && crew.avatarUrl.startsWith('color:')) {
    const colorId = crew.avatarUrl.replace('color:', '');
    const found = PRESET_COLORS.find(c => c.id === colorId || c.hex === colorId);
    if (found) return found;
  }
  const hue = hashHue(crew.name || '?');
  return { id: 'custom', label: 'Custom', hex: `hsl(${hue}, 70%, 55%)`, hue, sat: 70, light: 55 };
}

function TeamAvatar({ name, colorMeta, size = 'md' }) {
  const hue = colorMeta?.hue ?? hashHue(name || '?');
  const sizes = { sm: 'w-8 h-8 text-[12px]', md: 'w-11 h-11 text-base', lg: 'w-14 h-14 text-xl' };
  return (
    <div className={cn('rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-md transition-transform duration-300 group-hover:scale-105', sizes[size])}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 75% 55%), hsl(${(hue + 35) % 360} 70% 40%))`, boxShadow: `0 4px 14px -2px hsl(${hue} 75% 50% / 0.35)` }}
      aria-hidden="true">
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

function MemberAvatarStack({ members = [], max = 4 }) {
  const visible = members.slice(0, max);
  const overflow = members.length - visible.length;
  if (members.length === 0) return <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] italic"><Users className="w-3.5 h-3.5 opacity-60" /><span>No active members</span></div>;
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2.5 overflow-hidden p-0.5">
        {visible.map((m, i) => {
          const hue = hashHue(m.username || m.name || String(i));
          return (
            <div key={m.id ?? m.userId ?? i} title={m.username || m.name || 'Member'} className="relative group/avatar cursor-pointer" style={{ zIndex: visible.length - i }}>
              <div className="w-7 h-7 rounded-full ring-2 ring-[var(--bg-card)] flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm transition-transform group-hover/avatar:scale-110 group-hover/avatar:z-30"
                style={{ background: `linear-gradient(135deg, hsl(${hue} 65% 50%), hsl(${(hue + 30) % 360} 60% 40%))` }}>
                {(m.username || m.name || '?').charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--success)] ring-1 ring-[var(--bg-card)]" />
            </div>
          );
        })}
        {overflow > 0 && <div title={`${overflow} more`} className="w-7 h-7 rounded-full ring-2 ring-[var(--bg-card)] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-semibold text-[var(--text-secondary)] shadow-sm shrink-0" style={{ zIndex: 0 }}>+{overflow}</div>}
      </div>
    </div>
  );
}

function RadialProgressRing({ progress = 0, size = 46, strokeWidth = 4, hue = 230 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.min(100, Math.max(0, progress));
  const offset = circumference - (normalized / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center shrink-0 group/ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-sm">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--border-subtle)" strokeWidth={strokeWidth} fill="transparent" className="opacity-40" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={`hsl(${hue} 80% 55%)`} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-mono text-[10px] font-bold text-[var(--text-primary)] tabular-nums leading-none">{Math.round(normalized)}%</span>
      </div>
    </div>
  );
}

/* ─── KPI / Category / Compare (Teams-module design language) ─── */

function AnimatedCounter({ value, duration = 0.8 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let raf
    const start = performance.now()
    const from = display
    const tick = (now) => {
      const p = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])
  return <>{display.toLocaleString()}</>
}

function StatKPI({ icon: Icon, label, value, sublabel, hue = 220 }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-xs)] transition-all duration-300 hover:border-[var(--border-default)] hover:shadow-[var(--shadow-sm)]">
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ background: `radial-gradient(circle at 90% -20%, hsl(${hue} 70% 55% / 0.4), transparent 60%)` }}
        aria-hidden="true"
      />
      <div className="relative flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">{label}</div>
          <div className="text-[24px] font-bold text-[var(--text-primary)] leading-none mt-2 tabular-nums">
            <AnimatedCounter value={value} />
          </div>
          {sublabel && <div className="text-[11px] text-[var(--text-secondary)] mt-1.5 truncate">{sublabel}</div>}
        </div>
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
          style={{ background: `hsl(${hue} 60% 50% / 0.12)`, color: `hsl(${hue} 70% 60%)`, borderColor: `hsl(${hue} 60% 50% / 0.2)` }}
        >
          <Icon className="w-4 h-4" />
        </span>
      </div>
    </div>
  )
}

function CategoryChip({ label, count, isActive, onClick, hue = 230 }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        'relative px-4 py-2 rounded-xl text-[13px] font-medium transition-colors duration-200 whitespace-nowrap',
        isActive
          ? 'text-[var(--text-primary)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full tabular-nums',
          isActive ? 'bg-[var(--accent)]/12 text-[var(--accent)]' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
        )}
      >
        {count}
      </span>
      {isActive && (
        <motion.div
          layoutId="crew-category-indicator"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
          style={{ background: `hsl(${hue} 70% 50%)` }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </motion.button>
  )
}

function CompareBar({ label, values, max, hues }) {
  return (
    <div className="space-y-1">
      <Text size="xs" className="text-[var(--text-muted)] font-medium">{label}</Text>
      <div className="space-y-1">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: `hsl(${hues[i]} 65% 50%)` }} />
            <div className="flex-1 h-6 bg-[var(--bg-subtle)] rounded-lg overflow-hidden">
              <motion.div
                className="h-full rounded-lg"
                style={{ background: `linear-gradient(90deg, hsl(${hues[i]} 65% 50%), hsl(${(hues[i] + 20) % 360} 55% 55%))` }}
                initial={{ width: 0 }}
                animate={{ width: `${max > 0 ? (v / max) * 100 : 0}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.1 }}
              />
            </div>
            <Text size="xs" className="text-[var(--text-primary)] tabular-nums w-8 text-right font-semibold">{v}</Text>
          </div>
        ))}
      </div>
    </div>
  )
}

function crewStats(crew) {
  const memberCount = crew.memberCount ?? crew.activeMembers?.length ?? 0
  const completed = crew.completedTasksCount ?? crew.completedTasks ?? 0
  const total = crew.totalTasksCount ?? crew.totalTasks ?? (crew.activeTasks ? crew.activeTasks + completed : 0)
  const progress = total > 0 ? (completed / total) * 100 : (crew.progress ?? 0)
  return {
    memberCount,
    completed,
    total,
    progress: Math.round(progress),
    projectCount: crew.projectCount ?? 0,
  }
}

function ComparePanel({ crews, statsMap, onClose }) {
  if (crews.length === 0) return null
  const hues = crews.map(c => getCrewColorMeta(c).hue)

  const memberCounts = crews.map(c => statsMap[c.id]?.memberCount ?? 0)
  const taskCounts = crews.map(c => statsMap[c.id]?.total ?? 0)
  const projectCounts = crews.map(c => statsMap[c.id]?.projectCount ?? 0)
  const completionRates = crews.map(c => statsMap[c.id]?.progress ?? 0)
  const maxMembers = Math.max(...memberCounts, 1)
  const maxTasks = Math.max(...taskCounts, 1)
  const maxProjects = Math.max(...projectCounts, 1)

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-card)] border-t border-[var(--border-subtle)] rounded-t-2xl shadow-2xl max-h-[55vh] overflow-y-auto"
    >
      <div className="sticky top-0 bg-[var(--bg-card)] z-10 px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between rounded-t-2xl">
        <div className="flex items-center gap-3">
          <Icons.scale className="w-5 h-5 text-[var(--accent)]" />
          <Heading level={4} className="text-[14px] font-bold tracking-tight mb-0">Crew Comparison</Heading>
          <span className="text-[11px] text-[var(--text-muted)]">{crews.length} selected · click a crew's scale icon to add/remove</span>
        </div>
        <IconButton variant="ghost" size="sm" onClick={onClose} title="Close comparison">
          <X className="w-4 h-4" />
        </IconButton>
      </div>
      <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CompareBar label="Members" values={memberCounts} max={maxMembers} hues={hues} />
        <CompareBar label="Tasks" values={taskCounts} max={maxTasks} hues={hues} />
        <CompareBar label="Projects" values={projectCounts} max={maxProjects} hues={hues} />
        <CompareBar label="Completion %" values={completionRates} max={100} hues={hues} />
      </div>
      <div className="px-6 pb-5 flex flex-wrap gap-2">
        {crews.map((c, i) => (
          <span key={c.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{ background: `hsl(${hues[i]} 60% 50% / 0.12)`, color: `hsl(${hues[i]} 70% 55%)` }}>
            <span className="w-2 h-2 rounded-full" style={{ background: `hsl(${hues[i]} 70% 55%)` }} />
            {c.name}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   CrewsPage - Crew Mission Control
   ══════════════════════════════════════════════════════════════════════ */
export function CrewsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [crewName, setCrewName] = useState('');
  const [crewDesc, setCrewDesc] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [memberCap, setMemberCap] = useState(10);
  const [visibility, setVisibility] = useState('PUBLIC_LINK');
  const [inviteInput, setInviteInput] = useState('');
  const [inviteEmails, setInviteEmails] = useState([]);

  const { data: crews = [], isLoading, isError, error, refetch } = useCrews();
  const createCrewMutation = useCreateCrew();

  const handleAddInviteEmail = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = inviteInput.trim().toLowerCase();
      if (val && val.includes('@') && !inviteEmails.includes(val)) { setInviteEmails([...inviteEmails, val]); setInviteInput(''); }
      else if (val && !val.includes('@')) toast.error('Please enter a valid email address');
    }
  };

  const handleCreateCrew = (e) => {
    e.preventDefault();
    if (!crewName.trim()) return toast.error('Crew name is required');
    createCrewMutation.mutate({
      name: crewName.trim(), description: crewDesc.trim(), visibility,
      memberCap: Number(memberCap), avatarUrl: `color:${selectedColor.id}`,
    }, { onSuccess: () => { setIsCreateOpen(false); setCrewName(''); setCrewDesc(''); setSelectedColor(PRESET_COLORS[0]); setMemberCap(10); setVisibility('PUBLIC_LINK'); setInviteEmails([]); setInviteInput(''); } });
  };

  const ownedCount = useMemo(() => crews.filter(c => c.myRole === 'CREATOR' || c.myRole === 'OWNER').length, [crews]);
  const joinedCount = useMemo(() => crews.filter(c => c.myRole === 'MEMBER').length, [crews]);

  // Compare drawer state (teams-module design language)
  const [compareIds, setCompareIds] = useState([]);
  const compareCrews = useMemo(() => crews.filter(c => compareIds.includes(c.id)), [crews, compareIds]);
  const statsMap = useMemo(() => {
    const map = {};
    crews.forEach(c => { map[c.id] = crewStats(c); });
    return map;
  }, [crews]);
  const roster = useMemo(() => crews.reduce((sum, c) => sum + (c.memberCount ?? c.activeMembers?.length ?? 0), 0), [crews]);
  const toggleCompare = useCallback((id) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : (prev.length >= 4 ? prev : [...prev, id]));
  }, []);

  const filteredCrews = useMemo(() => crews.filter(crew => {
    const matchesSearch = crew.name.toLowerCase().includes(searchQuery.toLowerCase()) || crew.description?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'OWNED') return crew.myRole === 'CREATOR' || crew.myRole === 'OWNER';
    if (activeTab === 'JOINED') return crew.myRole === 'MEMBER';
    return true;
  }), [crews, searchQuery, activeTab]);

  const pageState = isLoading ? 'loading' : isError ? 'error' : crews.length === 0 ? 'empty' : 'ready';

  return (
    <PageShell maxWidth="default">
      <PageHero
        title="Crews Workspace"
        subtitle="Cross-functional squad hubs equipped with real-time text channels, interactive STOMP canvas whiteboards, shared project boards, and task conversion workflows."
        eyebrow="Mission Control"
      >
        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="outline" size="sm" onClick={() => navigate('/app/crews/discover')} className="h-9 text-[12px] gap-1.5 shadow-sm hover:border-[var(--accent)]">
            <Compass className="w-3.5 h-3.5 text-[var(--accent)]" /> Discover Crews
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)} className="shadow-sm h-9 text-[12px] gap-1.5">
            <Plus className="w-4 h-4" /> Create Crew
          </Button>
        </div>
      </PageHero>

      {crews.length > 0 && (
        <>
          {/* KPI Strip — matches teams module design language */}
          <EntityStatStrip
            stats={[
              { key: 'total', label: 'Total Crews', value: crews.length, sublabel: 'Squads in your orbit', icon: Users, tone: 'cyan' },
              { key: 'owned', label: 'Owned', value: ownedCount, sublabel: ownedCount > 0 ? 'Crews you own' : 'No crews owned yet', icon: Shield, tone: 'amber' },
              { key: 'joined', label: 'Joined', value: joinedCount, sublabel: 'Crews you belong to', icon: UserPlus, tone: 'emerald' },
              { key: 'roster', label: 'Roster', value: roster, sublabel: 'Members across all crews', icon: MessageSquare, tone: 'accent' },
            ]}
          />

          <EntityFilterBar
            search={searchQuery}
            onSearch={setSearchQuery}
            searchPlaceholder="Search crews..."
            chips={[
              { id: 'ALL', label: 'All Squads', count: crews.length },
              { id: 'OWNED', label: 'Owned', count: ownedCount },
              { id: 'JOINED', label: 'Joined', count: joinedCount },
            ]}
            activeChip={activeTab}
            onChip={setActiveTab}
          />
        </>
      )}


{isCreateOpen ? (
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="shrink-0 px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-base)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Create Mission Crew</h2>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Establish a collaborative mission team</p>
          </div>
          <button onClick={() => setIsCreateOpen(false)} className="text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Cancel</button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-2xl mx-auto">
            
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-5">
            <div>
              <Heading level={3} className="text-[17px] font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2"><Sparkles className="w-4 h-4 text-[var(--accent)]" /> Create Mission Crew</Heading>
              <Text variant="muted" className="text-[12px] mt-0.5">Establish a collaborative mission team with real-time text channels, whiteboards, and shared projects.</Text>
            </div>
            <IconButton variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)} title="Close"><X className="w-4 h-4" /></IconButton>
          </div>
          <form onSubmit={handleCreateCrew} className="space-y-5">
            <div className="relative p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/40 overflow-hidden transition-all duration-300"
              style={{ background: `radial-gradient(circle at 90% 10%, hsl(${selectedColor.hue} ${selectedColor.sat}% ${selectedColor.light}% / 0.12) 0%, transparent 60%)` }}>
              <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] font-bold mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3 text-[var(--accent)]" /> Live Card Preview</div>
              <div className="flex items-start gap-3">
                <TeamAvatar name={crewName || 'Crew Name'} colorMeta={selectedColor} size="md" />
                <div className="min-w-0 flex-1"><div className="font-bold text-[14px] text-[var(--text-primary)] truncate">{crewName || 'New Squad Hub'}</div><div className="text-[12px] text-[var(--text-muted)] line-clamp-1 mt-0.5">{crewDesc || 'Mission objective will be displayed here...'}</div></div>
                <Badge variant="outline" className="text-[10px] shrink-0 font-mono">{visibility.replace('_', ' ')}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[12px] font-semibold text-[var(--text-secondary)] flex items-center justify-between"><span>Brand Accent Theme</span><span className="text-[11px] font-mono text-[var(--text-muted)]">{selectedColor.label}</span></Label>
              <div className="grid grid-cols-8 gap-2">
                {PRESET_COLORS.map((c) => {
                  const isSelected = selectedColor.id === c.id;
                  return <button key={c.id} type="button" onClick={() => setSelectedColor(c)} title={c.label}
                    className={cn("h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer relative", isSelected ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-card)] scale-105" : "hover:scale-105 opacity-80 hover:opacity-100")}
                    style={{ background: c.hex }}>{isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}</button>;
                })}
              </div>
            </div>
            <div className="space-y-1.5"><Label className="text-[12px] font-semibold text-[var(--text-secondary)]">Crew Name <span className="text-[var(--danger)]">*</span></Label><Input value={crewName} onChange={(e) => setCrewName(e.target.value)} placeholder="e.g. Core Engineering, Product Guild, Apollo 11..." required className="h-10 text-[13px] rounded-lg bg-[var(--bg-card)]" /></div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between"><Label className="text-[12px] font-semibold text-[var(--text-secondary)]">Mission Objective</Label><span className={cn("text-[10px] font-mono", crewDesc.length > 250 ? "text-[var(--warning)]" : "text-[var(--text-muted)]")}>{crewDesc.length}/280</span></div>
              <Textarea value={crewDesc} onChange={(e) => setCrewDesc(e.target.value.slice(0, 280))} placeholder="What is the primary objective of this crew?" className="min-h-[85px] text-[13px] rounded-lg resize-none bg-[var(--bg-card)]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-[var(--text-secondary)] flex items-center gap-1.5"><UserPlus className="w-3.5 h-3.5 text-[var(--accent)]" /> Initial Member Invites</Label>
              <div className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] focus-within:ring-2 focus-within:ring-[var(--accent)]/30 focus-within:border-[var(--accent)] transition-all space-y-2">
                <div className="flex flex-wrap gap-1.5">{inviteEmails.map((email) => <span key={email} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] text-[11px] font-medium">{email}<button type="button" onClick={() => setInviteEmails(inviteEmails.filter(e => e !== email))} className="hover:text-[var(--danger)] transition-colors p-0.5"><X className="w-3 h-3" /></button></span>)}</div>
                <input type="email" value={inviteInput} onChange={(e) => setInviteInput(e.target.value)} onKeyDown={handleAddInviteEmail} placeholder={inviteEmails.length === 0 ? "Type member email & press Enter or comma..." : "Add another email..."} className="w-full text-[12px] bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-[12px] font-semibold text-[var(--text-secondary)] flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Access Visibility</Label><Select value={visibility} onValueChange={setVisibility}><SelectTrigger className="h-10 text-[13px] rounded-lg bg-[var(--bg-card)]"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl border-[var(--border-subtle)]"><SelectItem value="PUBLIC">Public Workspace</SelectItem><SelectItem value="PUBLIC_LINK">Public Link Access</SelectItem><SelectItem value="INVITE_ONLY">Invite Only (Private)</SelectItem></SelectContent></Select></div>
              <div className="space-y-1.5"><Label className="text-[12px] font-semibold text-[var(--text-secondary)] flex items-center gap-1"><Users className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Member Limit Cap</Label><Input type="number" value={memberCap} onChange={(e) => setMemberCap(e.target.value)} min={2} max={100} className="h-10 text-[13px] rounded-lg bg-[var(--bg-card)]" /></div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border-subtle)] mt-6">
              <Button type="button" variant="outline" size="sm" className="h-9 text-[12px] px-4 rounded-lg" onClick={() => setIsCreateOpen(false)} disabled={createCrewMutation.isPending}>Cancel</Button>
              <Button type="submit" size="sm" variant="primary" className="h-9 text-[12px] px-5 rounded-lg shadow-sm gap-1.5 font-semibold" isLoading={createCrewMutation.isPending}><Sparkles className="w-3.5 h-3.5" /> Initialize Crew</Button>
            </div>
          </form>
        
          </div>
        </div>
      </div>
    ) : (
      <PageContent>
        <PageState state={pageState} moduleId="crews" stateProps={{skeleton: (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">{Array.from({ length: 6 }).map((_, i) => <CrewCardSkeleton key={i} />)}</div>),  loadingVariant: 'cards' }}>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {Array.from({ length: 6 }).map((_, i) => <CrewCardSkeleton key={i} />)}
            </div>
          ) : filteredCrews.length === 0 && crews.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-card)] p-8">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mb-3 text-[var(--text-muted)]"><Search className="w-6 h-6" /></div>
              <Heading level={3} className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)] mb-1">No crews match your filter</Heading>
              <Text variant="muted" className="text-[13px] max-w-sm mb-4">We couldn't find any crew matching "{searchQuery}". Try searching for another term or reset filters.</Text>
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setActiveTab('ALL'); }} className="h-8 text-[12px] gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Reset Filters</Button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className="ec-grid">
              {filteredCrews.map((crew) => <CrewCard key={crew.id} crew={crew} navigate={navigate} isCompareSelected={compareIds.includes(crew.id)} onToggleCompare={toggleCompare} />)}
            </motion.div>
          )}
        </PageState>
      </PageContent>
    )}


      <AnimatePresence>
        {compareCrews.length > 0 && (
          <ComparePanel crews={compareCrews} statsMap={statsMap} onClose={() => setCompareIds([])} />
        )}
      </AnimatePresence>
    </PageShell>
  );
}

function CrewCard({ crew, navigate, isCompareSelected = false, onToggleCompare }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isOwner = crew.myRole === 'CREATOR' || crew.myRole === 'OWNER';
  const isMember = isOwner || crew.myRole === 'MEMBER';
  const memberCount = crew.memberCount ?? (crew.activeMembers?.length || 0);
  const colorMeta = useMemo(() => getCrewColorMeta(crew), [crew]);
  const completedTasks = crew.completedTasksCount ?? crew.completedTasks ?? 0;
  const totalTasks = crew.totalTasksCount ?? crew.totalTasks ?? (crew.activeTasks ? crew.activeTasks + completedTasks : 0);
  const progressPct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : (crew.progress ?? (crew.activeMembers?.length ? 75 : 0));

  const handleCardClick = () => navigate(`/app/crews/${crew.id}`);
  const handleQuickJump = (e, tabKey) => { e.stopPropagation(); setIsMenuOpen(false); navigate(`/app/crews/${crew.id}?tab=${tabKey}`); };

  useEffect(() => {
    function handleClickOutside(event) { if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false); }
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const roleBadge = isOwner ? (
    <span key="role" className="ec-badge ec-badge--amber"><span className="ec-dot" /> Owner</span>
  ) : isMember ? (
    <span key="role" className="ec-badge ec-badge--accent"><span className="ec-dot" /> Member</span>
  ) : (
    <span key="role" className="ec-badge ec-badge--ghost"><Globe className="w-3 h-3" style={{ width: 10, height: 10 }} /> {crew.visibility?.replace('_', ' ') || 'Public'}</span>
  );

  const memberAvatars = (crew.activeMembers || []).slice(0, 4).map(m => ({
    initials: (m.username || m.name || '?').charAt(0).toUpperCase(),
    color: `hsl(${hashHue(m.username || m.name || '')} 65% 50%)`,
    title: m.username || m.name || 'Member',
  }));

  return (
    <EntityCard
      type="crew"
      glyph={<TeamAvatar name={crew.name} colorMeta={colorMeta} size="md" />}
      name={crew.name}
      tagline={crew.description || 'No mission objective defined for this squad.'}
      onClick={handleCardClick}
      selected={isCompareSelected}
      badges={[roleBadge]}
      avatars={memberAvatars}
      avatarOverflow={Math.max(0, (crew.activeMembers?.length || 0) - 4)}
      meta={[
        { icon: <Users style={{ width: 11, height: 11 }} />, text: `${memberCount}/${crew.memberCap || '∞'} members` },
        { icon: <Folder style={{ width: 11, height: 11 }} />, text: `${crew.projectCount ?? 0} projects` },
        { icon: <MessageSquare style={{ width: 11, height: 11 }} />, text: `${crew.channelCount ?? 1} channels` },
      ]}
      progress={progressPct}
      progressLabel={`${Math.round(progressPct)}%`}
      actions={
        <div className="ec-actions" style={{ position: 'relative' }} ref={menuRef}>
          <button
            type="button"
            className={cn('ec-kebab', isCompareSelected && 'text-[var(--accent)]')}
            onClick={(e) => { e.stopPropagation(); onToggleCompare?.(crew.id); }}
            aria-label={isCompareSelected ? 'Remove from comparison' : 'Add to comparison'}
            title={isCompareSelected ? 'Remove from comparison' : 'Add to comparison'}
          >
            <Icons.scale className="w-4 h-4" />
          </button>
          <button type="button" className="ec-kebab" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} aria-label="Quick jump context menu">
            <MoreVertical className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.15 }}
                className="absolute right-0 top-9 z-50 w-48 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-xl backdrop-blur-md">
                <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold border-b border-[var(--border-subtle)] mb-1">Quick Jump</div>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={(e) => handleQuickJump(e, 'channels')}><MessageSquare className="w-3.5 h-3.5 text-[var(--accent)]" /> Text Channels</Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={(e) => handleQuickJump(e, 'tasks')}><CheckSquare className="w-3.5 h-3.5 text-[var(--accent)]" /> Task Board</Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={(e) => handleQuickJump(e, 'whiteboards')}><Layout className="w-3.5 h-3.5 text-[var(--accent)]" /> Whiteboards</Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={(e) => handleQuickJump(e, 'projects')}><Folder className="w-3.5 h-3.5 text-[var(--accent)]" /> Shared Projects</Button>
                <div className="border-t border-[var(--border-subtle)] my-1" />
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={(e) => handleQuickJump(e, 'overview')}><Settings className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Crew Settings</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      }
      footer={
        <div className="ec-card-foot">
          <Button variant="default" size="sm" className="flex-1 h-9 text-[12px] font-semibold shadow-xs gap-1.5 group/btn" onClick={(e) => { e.stopPropagation(); handleCardClick(); }}>
            <span>Enter Mission Portal</span><ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
          </Button>
          <Button variant="outline" size="sm" className="h-9 w-9 p-0 text-[12px] shrink-0 rounded-lg hover:border-[var(--accent)]" title="Crew Settings" onClick={(e) => handleQuickJump(e, 'overview')}>
            <Settings className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </Button>
        </div>
      }
    />
  );
}

function CrewCardSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 flex flex-col space-y-4 animate-pulse">
      <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-[var(--bg-subtle)]" /><div className="flex-1 space-y-2"><div className="h-4 w-32 rounded bg-[var(--bg-subtle)]" /><div className="h-3 w-16 rounded bg-[var(--bg-subtle)]" /></div><div className="w-6 h-6 rounded bg-[var(--bg-subtle)]" /></div>
      <div className="space-y-1.5"><div className="h-3 w-full rounded bg-[var(--bg-subtle)]" /><div className="h-3 w-3/4 rounded bg-[var(--bg-subtle)]" /></div>
      <div className="h-14 rounded-xl bg-[var(--bg-subtle)]/60" />
      <div className="flex gap-2"><div className="h-6 w-20 rounded bg-[var(--bg-subtle)]" /><div className="h-6 w-20 rounded bg-[var(--bg-subtle)]" /></div>
      <div className="pt-3 border-t border-[var(--border-subtle)] flex gap-2"><div className="h-9 flex-1 rounded-lg bg-[var(--bg-subtle)]" /><div className="h-9 w-9 rounded-lg bg-[var(--bg-subtle)]" /></div>
    </div>
  );
}
