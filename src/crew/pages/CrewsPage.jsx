import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Input } from '@/shared/ui/Input';
import { useCrews, useCreateCrew } from '../features/hooks/useCrews';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar';
import { toast } from 'sonner';
import { Label } from '@/shared/ui/Typography/Label';
import { PageHeader } from '@/shared/ui/PageHeader';
import {
  WorkspaceShell,
  ManagementLayout,
  PageStateContainer,
} from '@/shared/workspace-framework';
import { SearchPlugin } from '@/shared/workspace-framework/toolbar/plugins/SearchPlugin';

export function CrewsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [crewName, setCrewName] = useState('');
  const [crewDesc, setCrewDesc] = useState('');
  const [memberCap, setMemberCap] = useState(10);
  const [visibility, setVisibility] = useState('PUBLIC_LINK');

  const { data: crews = [], isLoading, isError, error, refetch } = useCrews();
  const createCrewMutation = useCreateCrew();

  const handleCreateCrew = (e) => {
    e.preventDefault();
    if (!crewName.trim()) {
      toast.error('Crew name is required');
      return;
    }

    createCrewMutation.mutate({
      name: crewName,
      description: crewDesc,
      visibility,
      memberCap: Number(memberCap),
      avatarUrl: ''
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setCrewName('');
        setCrewDesc('');
        setMemberCap(10);
        setVisibility('PUBLIC_LINK');
      }
    });
  };

  const filteredCrews = crews.filter(crew =>
    crew.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crew.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pageState = isLoading ? 'loading' : isError ? 'error' : filteredCrews.length === 0 ? 'empty' : 'ready';

  return (
    <WorkspaceShell maxWidth="default">
      <ManagementLayout
        header={
          <PageHeader
            eyebrow="Collaborate"
            meta={`• ${crews.length} Active Crews`}
            title="Crews Hub"
            subtitle="Lightweight flat-structured spaces for mission teams & whiteboards."
            actions={
              <>
                <SearchPlugin
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search crews..."
                  className="w-full sm:w-64"
                />
                <Button size="sm" variant="outline" className="shrink-0 gap-1.5" onClick={() => navigate('/app/crews/discover')}>
                  <Icons.users className="w-3.5 h-3.5" />
                  Discover Crews
                </Button>
                <Button size="sm" className="shrink-0 gap-1.5" onClick={() => setIsCreateOpen(true)}>
                  <Icons.plus className="w-3.5 h-3.5" />
                  Create Crew
                </Button>
              </>
            }
          />
        }
      >
        <PageStateContainer
          state={pageState}
          loadingConfig={{ variant: 'cards' }}
          errorConfig={{
            title: 'Failed to load crews',
            description: error?.message || 'An unexpected error occurred.',
            onRetry: refetch,
          }}
          emptyConfig={{
            icon: Icons.users,
            title: 'No crews found',
            description: 'Create a crew to collaborate on flat tasks, chat, and share projects.',
            actionLabel: 'Create Crew',
            onAction: () => setIsCreateOpen(true),
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCrews.map((crew) => (
              <motion.div
                key={crew.id}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                onClick={() => navigate(`/app/crews/${crew.id}`)}
                className="group relative flex flex-col p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--accent-border)] hover:shadow-xl hover:shadow-[var(--accent)]/5 transition-all duration-300 cursor-pointer overflow-hidden justify-between"
              >
                <div className="space-y-3 relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar size="md" className="bg-[var(--accent)] text-white shadow-inner font-bold text-sm">
                        <AvatarImage src={crew.avatarUrl} />
                        <AvatarFallback className="bg-[var(--accent)] text-white text-sm font-bold">
                          {crew.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <Heading level={4} className="text-base font-bold tracking-tight group-hover:text-[var(--accent)] transition-colors truncate">
                          {crew.name}
                        </Heading>
                        <span className="text-[10px] text-[var(--text-muted)] uppercase font-mono tracking-wider font-semibold">
                          {crew.visibility}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Text className="text-xs text-[var(--text-muted)] line-clamp-2 min-h-[36px]">
                    {crew.description || 'No mission objective defined.'}
                  </Text>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-3 text-[11px] font-mono text-[var(--text-muted)] relative z-10">
                  <span className="flex items-center gap-1.5">
                    <Icons.users className="w-3.5 h-3.5 text-[var(--accent)]" />
                    Capacity: {crew.memberCap}
                  </span>
                  <span className="text-[var(--accent)] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Launch Mission
                    <Icons.chevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </PageStateContainer>
      </ManagementLayout>

      {/* Create Crew Modal */}
      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ModalContent className="sm:max-w-md">
          <Heading level={3} className="mb-4">Create Crew</Heading>
          <form onSubmit={handleCreateCrew} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-[12px] font-medium text-[var(--text-secondary)]">Name</Label>
              <Input
                value={crewName}
                onChange={(e) => setCrewName(e.target.value)}
                placeholder="Marketing crew, Dev squad..."
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[12px] font-medium text-[var(--text-secondary)]">Description</Label>
              <textarea
                value={crewDesc}
                onChange={(e) => setCrewDesc(e.target.value)}
                placeholder="What this crew is about..."
                className="w-full min-h-[80px] rounded-md border border-[var(--border-default)] bg-transparent p-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[12px] font-medium text-[var(--text-secondary)]">Visibility</Label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full h-9 rounded-md border border-[var(--border-default)] bg-[var(--bg-sidebar)] p-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                >
                  <option value="PUBLIC">Public (Discoverable by everyone)</option>
                  <option value="PUBLIC_LINK">Public Link (Joinable via link, unlisted)</option>
                  <option value="INVITE_ONLY">Invite Only (Private, invite link required)</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-[12px] font-medium text-[var(--text-secondary)]">Member Cap</Label>
                <Input
                  type="number"
                  value={memberCap}
                  onChange={(e) => setMemberCap(e.target.value)}
                  min={2}
                  max={100}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={createCrewMutation.isPending}>Create</Button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </WorkspaceShell>
  );
}
