import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/Select';
import { useCrews, useCreateCrew } from '../features/hooks/useCrews';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { toast } from 'sonner';
import { Label } from '@/shared/ui/Typography/Label';
import { WorkspaceShell, ManagementLayout, PageStateContainer } from '@/shared/workspace-framework';
import { Compass, Users, Activity } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

function hashHue(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

function TeamAvatar({ name, size = 'md' }) {
  const hue = hashHue(name || '?')
  const sizes = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  }
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white shrink-0 shadow-sm',
        sizes[size]
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 60% 50%), hsl(${(hue + 40) % 360} 60% 40%))`,
      }}
      aria-hidden="true"
    >
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

function MemberAvatarStack({ members = [], max = 4 }) {
  const visible = members.slice(0, max)
  const overflow = members.length - visible.length
  if (members.length === 0) return <Text size="xs" className="text-[var(--text-muted)] italic">No members</Text>
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visible.map((m, i) => {
          const hue = hashHue(m.username || String(i))
          return (
            <div
              key={m.id ?? m.userId ?? i}
              title={m.username}
              className="w-6 h-6 rounded-full ring-2 ring-[var(--bg-card)] flex items-center justify-center text-[10px] font-medium text-white shrink-0"
              style={{ background: `hsl(${hue} 50% 45%)`, zIndex: visible.length - i }}
            >
              {m.username?.charAt(0).toUpperCase()}
            </div>
          )
        })}
        {overflow > 0 && (
          <div className="w-6 h-6 rounded-full ring-2 ring-[var(--bg-card)] bg-[var(--bg-subtle)] flex items-center justify-center text-[9px] font-semibold text-[var(--text-secondary)]">
            +{overflow}
          </div>
        )}
      </div>
    </div>
  )
}

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)]">
      {Icon && <Icon className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />}
      <span className="text-[13px] font-semibold text-[var(--text-primary)] tabular-nums">{value}</span>
      <span className="text-[11px] text-[var(--text-muted)]">{label}</span>
    </div>
  )
}

export function CrewsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [crewName, setCrewName] = useState('');
  const [crewDesc, setCrewDesc] = useState('');
  const [memberCap, setMemberCap] = useState(10);
  const [visibility, setVisibility] = useState('PUBLIC_LINK');

  const { data: crews = [], isLoading, isError, error, refetch } = useCrews();
  const createCrewMutation = useCreateCrew();

  const handleCreateCrew = (e) => {
    e.preventDefault();
    if (!crewName.trim()) return toast.error('Crew name is required');
    createCrewMutation.mutate({ name: crewName, description: crewDesc, visibility, memberCap: Number(memberCap), avatarUrl: '' }, {
      onSuccess: () => { 
        setIsCreateOpen(false); 
        setCrewName(''); 
        setCrewDesc(''); 
        setMemberCap(10); 
        setVisibility('PUBLIC_LINK'); 
      }
    });
  };

  const ownedCount = useMemo(() => crews.filter(c => c.myRole === 'CREATOR').length, [crews]);
  const joinedCount = useMemo(() => crews.filter(c => c.myRole === 'MEMBER').length, [crews]);

  const filteredCrews = useMemo(() => crews.filter(crew => {
    const matchesSearch = crew.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      crew.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeTab === 'OWNED') return crew.myRole === 'CREATOR';
    if (activeTab === 'JOINED') return crew.myRole === 'MEMBER';
    return true;
  }), [crews, searchQuery, activeTab]);

  const pageState = isLoading ? 'loading' : crews.length === 0 ? 'empty' : 'ready';

  return (
    <WorkspaceShell maxWidth="default">
      <ManagementLayout
        header={
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
                    Crews
                  </span>
                </div>
                <Heading level={1} className="tracking-tight text-[18px] font-semibold mb-1 flex items-center gap-2 truncate">
                  <Icons.users className="w-4 h-4 text-[var(--accent)] shrink-0" aria-hidden="true" />
                  Crews workspace
                </Heading>
                <Text variant="muted" className="text-[13px] leading-relaxed">
                  Flat-structured spaces for mission teams, real-time chat, and shared projects.
                </Text>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => navigate('/app/crews/discover')} className="h-8 text-[12px] gap-1.5 shadow-sm">
                  <Compass className="w-3.5 h-3.5 text-[var(--accent)]" /> Discover
                </Button>
                <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)} className="shadow-sm h-8 text-[12px] gap-1.5">
                  <Icons.plus className="w-3.5 h-3.5" /> Create Crew
                </Button>
              </div>
            </div>

            {crews.length > 0 && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <StatPill icon={Icons.users} label="squads" value={crews.length} />
                  <StatPill icon={Icons.users} label="owned" value={ownedCount} />
                  <StatPill icon={Icons.users} label="joined" value={joinedCount} />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-lg border border-[var(--border-subtle)] w-full sm:w-auto overflow-x-auto no-scrollbar">
                    {[
                      { id: 'ALL', label: 'All Squads', count: crews.length },
                      { id: 'OWNED', label: 'Owned', count: ownedCount },
                      { id: 'JOINED', label: 'Joined', count: joinedCount },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "px-3 py-1 text-[12px] font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                          activeTab === tab.id
                            ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-semibold"
                            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        <span>{tab.label}</span>
                        <span className={cn(
                          "text-[10px] font-mono px-1.5 py-0.5 rounded-full",
                          activeTab === tab.id ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[var(--bg-hover)] text-[var(--text-muted)]"
                        )}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="relative flex-1 max-w-sm">
                    <Icons.search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search crews..."
                      aria-label="Search crews"
                      className="w-full pl-9 pr-3 py-2 text-[13px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-colors text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                    />
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
          emptyConfig={{
            icon: Icons.users,
            title: 'No crews created yet',
            description: 'Crews are flat, collaborative spaces for working on projects, sharing channels, and tackling tasks together.',
            actionLabel: 'Create Crew',
            onAction: () => setIsCreateOpen(true),
          }}
        >
          {isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)]">
              <Icons.alert className="w-8 h-8 text-[var(--danger)] mb-4" />
              <Heading level={3} className="text-[15px] font-semibold tracking-tight mb-2">Failed to load crews</Heading>
              <Text variant="muted" className="text-[13px] max-w-sm mb-4">{error?.message || "An unexpected error occurred."}</Text>
              <Button onClick={refetch} variant="outline" size="sm" className="h-8 text-[12px] gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Retry
              </Button>
            </div>
          ) : filteredCrews.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)]">
              <Icons.search className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-3" />
              <Text variant="muted" className="text-[13px]">No crews match your filter or search.</Text>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {filteredCrews.map((crew) => (
                <CrewCard key={crew.id} crew={crew} navigate={navigate} />
              ))}
            </div>
          )}
        </PageStateContainer>
      </ManagementLayout>

      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ModalContent className="sm:max-w-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl rounded-xl p-6">
          <div className="flex flex-col space-y-1.5 mb-5">
            <Heading level={3} className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Create a New Crew</Heading>
            <Text variant="muted" className="text-[13px]">Define a collaborative space for your mission team.</Text>
          </div>
          
          <form onSubmit={handleCreateCrew} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-[var(--text-secondary)]">Crew Name</Label>
              <Input 
                value={crewName} 
                onChange={(e) => setCrewName(e.target.value)} 
                placeholder="e.g. Core Engineering, Design Guild..." 
                required 
                className="h-9 text-[13px] rounded-md" 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-[var(--text-secondary)]">Mission Description</Label>
              <Textarea 
                value={crewDesc} 
                onChange={(e) => setCrewDesc(e.target.value)} 
                placeholder="What is the primary objective of this crew?" 
                className="min-h-[80px] text-[13px] rounded-md resize-none" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium text-[var(--text-secondary)]">Visibility</Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger className="h-9 text-[13px] rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-[var(--border-subtle)]">
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="PUBLIC_LINK">Public Link</SelectItem>
                    <SelectItem value="INVITE_ONLY">Invite Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium text-[var(--text-secondary)]">Member Cap</Label>
                <Input 
                  type="number" 
                  value={memberCap} 
                  onChange={(e) => setMemberCap(e.target.value)} 
                  min={2} 
                  max={100} 
                  className="h-9 text-[13px] rounded-md" 
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)] mt-4">
              <Button type="button" variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="primary" className="h-8 text-[12px] shadow-sm" isLoading={createCrewMutation.isPending}>
                Create Crew
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </WorkspaceShell>
  );
}

function CrewCard({ crew, navigate }) {
  const isOwner = crew.myRole === 'CREATOR' || crew.myRole === 'OWNER';
  const isMember = isOwner || crew.myRole === 'MEMBER';
  const memberCount = crew.memberCount ?? 0;

  const handleClick = () => {
    navigate(`/app/crews/${crew.id}`);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' ? handleClick() : null)}
      className="group relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col transition-all duration-200 overflow-hidden hover:border-[var(--accent-border)] hover:shadow-sm hover:-translate-y-0.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 outline-none"
    >
      <div className="flex items-start justify-between gap-2 mb-3 relative">
        <div className="flex items-center gap-3 min-w-0">
          <TeamAvatar name={crew.name} size="md" />
          <div className="min-w-0">
            <Heading level={4} className="text-[14px] font-semibold leading-tight truncate tracking-tight" title={crew.name}>{crew.name}</Heading>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isOwner ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-500">
                  <span className="w-1 h-1 rounded-full bg-amber-500" /> Owner
                </span>
              ) : isMember ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--accent)]">
                  <span className="w-1 h-1 rounded-full bg-[var(--accent)]" /> Member
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--text-muted)]">
                  {crew.visibility?.replace('_', ' ') || 'Public'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Text variant="muted" size="sm" className="line-clamp-2 mb-4 min-h-[2.5em] text-[12px] relative">
        {crew.description || 'No mission description provided.'}
      </Text>

      <div className="flex items-center justify-between mb-4 relative">
        <MemberAvatarStack members={crew.activeMembers || []} max={4} />
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className="text-[10px]">{memberCount}/{crew.memberCap || '∞'} members</Badge>
          {crew.projectCount > 0 && (
            <Badge variant="outline" className="text-[10px] bg-[var(--info-soft)] text-[var(--info)] border-transparent">{crew.projectCount} proj.</Badge>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-[var(--border-subtle)] flex gap-2 relative">
        <Button variant="default" size="sm" className="flex-1 h-8 text-[12px] shadow-sm" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
          Enter Portal <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-[12px] px-2.5" title="Settings" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
          <Icons.settings className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
