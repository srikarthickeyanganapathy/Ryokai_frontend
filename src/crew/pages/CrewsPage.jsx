import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text, Label } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/Select';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { toast } from 'sonner';
import { WorkspaceShell, ManagementLayout, PageStateContainer } from '@/shared/workspace-framework';
import { PageHeader } from '@/shared/ui/PageHeader';
import { FilterTabs } from '@/shared/ui/FilterTabs';
import { StatPill } from '@/shared/ui/StatPill';
import {
  Compass,
  Users,
  MoreVertical,
  MessageSquare,
  CheckSquare,
  Layout,
  Settings,
  Plus,
  X,
  Search,
  Sparkles,
  RefreshCw,
  Folder,
  Shield,
  UserPlus,
  ArrowRight,
  Check,
  Globe
} from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';
import { useCrews, useCreateCrew } from '../features/hooks/useCrews';

// Preset Brand Color Palette Swatches for Mission Command Cards
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
  const sizes = {
    sm: 'w-8 h-8 text-[12px]',
    md: 'w-11 h-11 text-base',
    lg: 'w-14 h-14 text-xl',
  };
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-md transition-transform duration-300 group-hover:scale-105',
        sizes[size]
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 75% 55%), hsl(${(hue + 35) % 360} 70% 40%))`,
        boxShadow: `0 4px 14px -2px hsl(${hue} 75% 50% / 0.35)`,
      }}
      aria-hidden="true"
    >
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

function MemberAvatarStack({ members = [], max = 4 }) {
  const visible = members.slice(0, max);
  const overflow = members.length - visible.length;

  if (members.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] italic">
        <Users className="w-3.5 h-3.5 opacity-60" />
        <span>No active members</span>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2.5 overflow-hidden p-0.5">
        {visible.map((m, i) => {
          const hue = hashHue(m.username || m.name || String(i));
          const nameStr = m.username || m.name || 'Member';
          return (
            <div
              key={m.id ?? m.userId ?? i}
              title={nameStr}
              className="relative group/avatar cursor-pointer"
              style={{ zIndex: visible.length - i }}
            >
              <div
                className="w-7 h-7 rounded-full ring-2 ring-[var(--bg-card)] flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm transition-transform group-hover/avatar:scale-110 group-hover/avatar:z-30"
                style={{ background: `linear-gradient(135deg, hsl(${hue} 65% 50%), hsl(${(hue + 30) % 360} 60% 40%))` }}
              >
                {nameStr.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-[var(--bg-card)]" />
            </div>
          );
        })}
        {overflow > 0 && (
          <div
            title={`${overflow} more members`}
            className="w-7 h-7 rounded-full ring-2 ring-[var(--bg-card)] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-semibold text-[var(--text-secondary)] shadow-sm shrink-0"
            style={{ zIndex: 0 }}
          >
            +{overflow}
          </div>
        )}
      </div>
    </div>
  );
}

function RadialProgressRing({ progress = 0, size = 46, strokeWidth = 4, hue = 230 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0 group/ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-sm">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border-subtle)"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`hsl(${hue} 80% 55%)`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-mono text-[10px] font-bold text-[var(--text-primary)] tabular-nums leading-none">
          {Math.round(normalizedProgress)}%
        </span>
      </div>
    </div>
  );
}
export function CrewsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State for Create Crew
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
      if (val && val.includes('@') && !inviteEmails.includes(val)) {
        setInviteEmails([...inviteEmails, val]);
        setInviteInput('');
      } else if (val && !val.includes('@')) {
        toast.error('Please enter a valid email address');
      }
    }
  };

  const handleRemoveInviteEmail = (emailToRemove) => {
    setInviteEmails(inviteEmails.filter(e => e !== emailToRemove));
  };

  const handleCreateCrew = (e) => {
    e.preventDefault();
    if (!crewName.trim()) return toast.error('Crew name is required');
    
    const payload = {
      name: crewName.trim(),
      description: crewDesc.trim(),
      visibility,
      memberCap: Number(memberCap),
      avatarUrl: `color:${selectedColor.id}`,
    };

    createCrewMutation.mutate(payload, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setCrewName('');
        setCrewDesc('');
        setSelectedColor(PRESET_COLORS[0]);
        setMemberCap(10);
        setVisibility('PUBLIC_LINK');
        setInviteEmails([]);
        setInviteInput('');
      }
    });
  };

  const ownedCount = useMemo(() => crews.filter(c => c.myRole === 'CREATOR' || c.myRole === 'OWNER').length, [crews]);
  const joinedCount = useMemo(() => crews.filter(c => c.myRole === 'MEMBER').length, [crews]);

  const filteredCrews = useMemo(() => crews.filter(crew => {
    const matchesSearch = crew.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crew.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'OWNED') return crew.myRole === 'CREATOR' || crew.myRole === 'OWNER';
    if (activeTab === 'JOINED') return crew.myRole === 'MEMBER';
    return true;
  }), [crews, searchQuery, activeTab]);

  const pageState = isLoading ? 'loading' : isError ? 'error' : crews.length === 0 ? 'empty' : 'ready';

  return (
    <WorkspaceShell maxWidth="default">
      <ManagementLayout
        header={
          <div className="space-y-5">
            <PageHeader
              eyebrow="Mission Control"
              icon={Users}
              title="Crews Workspace"
              subtitle="Cross-functional squad hubs equipped with real-time text channels, interactive STOMP canvas whiteboards, shared project boards, and task conversion workflows."
              actions={
                <div className="flex items-center gap-2.5 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => navigate('/app/crews/discover')} className="h-9 text-[12px] gap-1.5 shadow-sm hover:border-[var(--accent)]">
                    <Compass className="w-3.5 h-3.5 text-[var(--accent)]" /> Discover Crews
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)} className="shadow-sm h-9 text-[12px] gap-1.5">
                    <Plus className="w-4 h-4" /> Create Crew
                  </Button>
                </div>
              }
            />

            {crews.length > 0 && (
              <>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <StatPill icon={Users} label="Total Crews" value={crews.length} highlight />
                  <StatPill icon={Shield} label="Owned" value={ownedCount} />
                  <StatPill icon={Users} label="Joined" value={joinedCount} />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  <FilterTabs
                    filters={[
                      { value: 'ALL', label: 'All Squads' },
                      { value: 'OWNED', label: 'Owned' },
                      { value: 'JOINED', label: 'Joined' },
                    ]}
                    value={activeTab}
                    onChange={setActiveTab}
                    counts={{ ALL: crews.length, OWNED: ownedCount, JOINED: joinedCount }}
                  />

                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search crews by name or mission..."
                      aria-label="Search crews"
                      className="w-full pl-9 pr-8 py-2 text-[13px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all text-[var(--text-primary)] placeholder:text-[var(--text-muted)] shadow-xs"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        }
      >
        <PageStateContainer
          state={pageState}
          loadingConfig={{ variant: 'cards' }}
          errorConfig={{
            title: 'Failed to load Crews workspace',
            description: error?.message || 'There was a network or server issue retrieving your crews. Please try again.',
            onRetry: refetch,
          }}
          emptyConfig={{
            icon: Users,
            title: 'No crews created yet',
            description: 'Crews are flat, collaborative spaces for working on projects, sharing channels, and tackling tasks together.',
            actionLabel: 'Create Your First Crew',
            onAction: () => setIsCreateOpen(true),
          }}
        >
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <CrewCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredCrews.length === 0 && crews.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-card)] p-8">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mb-3 text-[var(--text-muted)]">
                <Search className="w-6 h-6" />
              </div>
              <Heading level={3} className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)] mb-1">
                No crews match your filter
              </Heading>
              <Text variant="muted" className="text-[13px] max-w-sm mb-4">
                We couldn't find any crew matching "{searchQuery}". Try searching for another term or reset filters.
              </Text>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearchQuery(''); setActiveTab('ALL'); }}
                className="h-8 text-[12px] gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2"
            >
              {filteredCrews.map((crew) => (
                <CrewCard key={crew.id} crew={crew} navigate={navigate} />
              ))}
            </motion.div>
          )}
        </PageStateContainer>
      </ManagementLayout>

      {/* Redesigned Create Crew Modal */}
      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ModalContent className="sm:max-w-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl rounded-2xl p-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-5">
            <div>
              <Heading level={3} className="text-[17px] font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" /> Create Mission Crew
              </Heading>
              <Text variant="muted" className="text-[12px] mt-0.5">
                Establish a collaborative mission team with real-time text channels, whiteboards, and shared projects.
              </Text>
            </div>
            <button
              onClick={() => setIsCreateOpen(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateCrew} className="space-y-5">
            {/* Live Theme Preview Card */}
            <div
              className="relative p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/40 overflow-hidden transition-all duration-300"
              style={{
                background: `radial-gradient(circle at 90% 10%, hsl(${selectedColor.hue} ${selectedColor.sat}% ${selectedColor.light}% / 0.12) 0%, transparent 60%)`
              }}
            >
              <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] font-bold mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[var(--accent)]" /> Live Card Preview
              </div>
              <div className="flex items-start gap-3">
                <TeamAvatar name={crewName || 'Crew Name'} colorMeta={selectedColor} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[14px] text-[var(--text-primary)] truncate">
                    {crewName || 'New Squad Hub'}
                  </div>
                  <div className="text-[12px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                    {crewDesc || 'Mission objective will be displayed here...'}
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                  {visibility.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* Brand Color Selector */}
            <div className="space-y-2">
              <Label className="text-[12px] font-semibold text-[var(--text-secondary)] flex items-center justify-between">
                <span>Brand Accent Theme</span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">{selectedColor.label}</span>
              </Label>
              <div className="grid grid-cols-8 gap-2">
                {PRESET_COLORS.map((c) => {
                  const isSelected = selectedColor.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      title={c.label}
                      className={cn(
                        "h-8 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer relative",
                        isSelected ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-card)] scale-105" : "hover:scale-105 opacity-80 hover:opacity-100"
                      )}
                      style={{ background: c.hex }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Crew Name */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-[var(--text-secondary)]">
                Crew Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={crewName}
                onChange={(e) => setCrewName(e.target.value)}
                placeholder="e.g. Core Engineering, Product Guild, Apollo 11..."
                required
                className="h-10 text-[13px] rounded-lg bg-[var(--bg-card)]"
              />
            </div>

            {/* Mission Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[12px] font-semibold text-[var(--text-secondary)]">Mission Objective</Label>
                <span className={cn("text-[10px] font-mono", crewDesc.length > 250 ? "text-amber-500" : "text-[var(--text-muted)]")}>
                  {crewDesc.length}/280
                </span>
              </div>
              <Textarea
                value={crewDesc}
                onChange={(e) => setCrewDesc(e.target.value.slice(0, 280))}
                placeholder="What is the primary objective, deliverables, or operational scope of this crew?"
                className="min-h-[85px] text-[13px] rounded-lg resize-none bg-[var(--bg-card)]"
              />
            </div>

            {/* Initial Invites Tag Field */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-[var(--accent)]" /> Initial Member Invites
              </Label>
              <div className="p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] focus-within:ring-2 focus-within:ring-[var(--accent)]/30 focus-within:border-[var(--accent)] transition-all space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {inviteEmails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] text-[11px] font-medium"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveInviteEmail(email)}
                        className="hover:text-red-500 transition-colors p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="email"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  onKeyDown={handleAddInviteEmail}
                  placeholder={inviteEmails.length === 0 ? "Type member email & press Enter or comma..." : "Add another email..."}
                  className="w-full text-[12px] bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
              </div>
            </div>

            {/* Visibility & Member Cap */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Access Visibility
                </Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger className="h-10 text-[13px] rounded-lg bg-[var(--bg-card)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[var(--border-subtle)]">
                    <SelectItem value="PUBLIC">Public Workspace</SelectItem>
                    <SelectItem value="PUBLIC_LINK">Public Link Access</SelectItem>
                    <SelectItem value="INVITE_ONLY">Invite Only (Private)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Member Limit Cap
                </Label>
                <Input
                  type="number"
                  value={memberCap}
                  onChange={(e) => setMemberCap(e.target.value)}
                  min={2}
                  max={100}
                  className="h-10 text-[13px] rounded-lg bg-[var(--bg-card)]"
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border-subtle)] mt-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 text-[12px] px-4 rounded-lg"
                onClick={() => setIsCreateOpen(false)}
                disabled={createCrewMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                variant="primary"
                className="h-9 text-[12px] px-5 rounded-lg shadow-sm gap-1.5 font-semibold"
                isLoading={createCrewMutation.isPending}
              >
                <Sparkles className="w-3.5 h-3.5" /> Initialize Crew
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </WorkspaceShell>
  );
}

/**
 * Mission Command Card Component
 */
function CrewCard({ crew, navigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isOwner = crew.myRole === 'CREATOR' || crew.myRole === 'OWNER';
  const isMember = isOwner || crew.myRole === 'MEMBER';
  const memberCount = crew.memberCount ?? (crew.activeMembers?.length || 0);

  const colorMeta = useMemo(() => getCrewColorMeta(crew), [crew]);

  // Derived task completion metrics for radial progress ring
  const completedTasks = crew.completedTasksCount ?? crew.completedTasks ?? 0;
  const totalTasks = crew.totalTasksCount ?? crew.totalTasks ?? (crew.activeTasks ? crew.activeTasks + completedTasks : 0);
  const progressPct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : (crew.progress ?? (crew.activeMembers?.length ? 75 : 0));

  const handleCardClick = () => {
    navigate(`/app/crews/${crew.id}`);
  };

  const handleQuickJump = (e, tabKey) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    navigate(`/app/crews/${crew.id}?tab=${tabKey}`);
  };

  // Close context menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(); } }}
      className={cn(
        "group relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 flex flex-col transition-all duration-300 overflow-hidden cursor-pointer outline-none",
        "hover:border-[var(--accent-border)] hover:shadow-lg hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
      )}
      style={{
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
      }}
    >
      {/* Ambient Brand HSL Glow Background Overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-30 group-hover:opacity-70"
        style={{
          background: `radial-gradient(circle at 90% 10%, hsl(${colorMeta.hue} ${colorMeta.sat}% ${colorMeta.light}% / 0.15) 0%, transparent 65%)`
        }}
      />

      {/* Header Row: Avatar, Info & Quick-Jump Context Menu */}
      <div className="flex items-start justify-between gap-3 mb-3.5 relative z-10">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <TeamAvatar name={crew.name} colorMeta={colorMeta} size="md" />
          <div className="min-w-0 flex-1">
            <Heading
              level={4}
              className="text-[15px] font-bold leading-tight truncate tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors"
              title={crew.name}
            >
              {crew.name}
            </Heading>
            <div className="flex items-center gap-2 mt-1">
              {isOwner ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Owner
                </span>
              ) : isMember ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" /> Member
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--text-muted)]">
                  <Globe className="w-3 h-3" /> {crew.visibility?.replace('_', ' ') || 'Public'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick-Jump Context Menu Button */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            aria-label="Quick jump context menu"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors border border-transparent hover:border-[var(--border-subtle)]"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-9 z-50 w-48 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-xl backdrop-blur-md"
              >
                <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold border-b border-[var(--border-subtle)] mb-1">
                  Quick Jump
                </div>
                <button
                  onClick={(e) => handleQuickJump(e, 'channels')}
                  className="w-full px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[var(--accent)]" /> Text Channels
                </button>
                <button
                  onClick={(e) => handleQuickJump(e, 'tasks')}
                  className="w-full px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-[var(--accent)]" /> Task Board
                </button>
                <button
                  onClick={(e) => handleQuickJump(e, 'whiteboards')}
                  className="w-full px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Layout className="w-3.5 h-3.5 text-[var(--accent)]" /> Whiteboards
                </button>
                <button
                  onClick={(e) => handleQuickJump(e, 'projects')}
                  className="w-full px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Folder className="w-3.5 h-3.5 text-[var(--accent)]" /> Shared Projects
                </button>
                <div className="border-t border-[var(--border-subtle)] my-1" />
                <button
                  onClick={(e) => handleQuickJump(e, 'overview')}
                  className="w-full px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Crew Settings
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mission Description */}
      <Text variant="muted" size="sm" className="line-clamp-2 mb-4 min-h-[2.4em] text-[12.5px] leading-relaxed relative z-10">
        {crew.description || 'No mission objective defined for this squad.'}
      </Text>

      {/* Radial Completion Ring & Member Avatars Row */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)] mb-4 relative z-10">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-1">
            Active Roster
          </div>
          <MemberAvatarStack members={crew.activeMembers || []} max={4} />
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-0.5">
              Completion
            </div>
            <div className="text-[11px] font-bold text-[var(--text-primary)]">
              {completedTasks}/{totalTasks || 1} tasks
            </div>
          </div>
          <RadialProgressRing progress={progressPct} hue={colorMeta.hue} />
        </div>
      </div>

      {/* Metric Pills Row */}
      <div className="flex flex-wrap items-center gap-2 mb-4 relative z-10">
        <StatPill icon={Users} label="members" value={`${memberCount}/${crew.memberCap || '∞'}`} className="bg-[var(--bg-subtle)]/70 py-1 px-2.5 gap-1.5 [&_span:first-of-type]:text-[11px] [&_span:last-of-type]:text-[10px]" />
        <StatPill icon={Folder} label="projects" value={crew.projectCount ?? 0} className="bg-[var(--bg-subtle)]/70 py-1 px-2.5 gap-1.5 [&_span:first-of-type]:text-[11px] [&_span:last-of-type]:text-[10px]" />
        <StatPill icon={MessageSquare} label="channels" value={crew.channelCount ?? 1} className="bg-[var(--bg-subtle)]/70 py-1 px-2.5 gap-1.5 [&_span:first-of-type]:text-[11px] [&_span:last-of-type]:text-[10px]" />
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-auto pt-3.5 border-t border-[var(--border-subtle)] flex items-center gap-2 relative z-10">
        <Button
          variant="default"
          size="sm"
          className="flex-1 h-9 text-[12px] font-semibold shadow-xs gap-1.5 group/btn"
          onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
        >
          <span>Enter Mission Portal</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0 text-[12px] shrink-0 rounded-lg hover:border-[var(--accent)]"
          title="Crew Settings"
          onClick={(e) => handleQuickJump(e, 'overview')}
        >
          <Settings className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Shimmer Loading Card Skeleton
 */
function CrewCardSkeleton() {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 flex flex-col space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[var(--bg-subtle)]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-[var(--bg-subtle)]" />
          <div className="h-3 w-16 rounded bg-[var(--bg-subtle)]" />
        </div>
        <div className="w-6 h-6 rounded bg-[var(--bg-subtle)]" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-[var(--bg-subtle)]" />
        <div className="h-3 w-3/4 rounded bg-[var(--bg-subtle)]" />
      </div>
      <div className="h-14 rounded-xl bg-[var(--bg-subtle)]/60" />
      <div className="flex gap-2">
        <div className="h-6 w-20 rounded bg-[var(--bg-subtle)]" />
        <div className="h-6 w-20 rounded bg-[var(--bg-subtle)]" />
      </div>
      <div className="pt-3 border-t border-[var(--border-subtle)] flex gap-2">
        <div className="h-9 flex-1 rounded-lg bg-[var(--bg-subtle)]" />
        <div className="h-9 w-9 rounded-lg bg-[var(--bg-subtle)]" />
      </div>
    </div>
  );
}
