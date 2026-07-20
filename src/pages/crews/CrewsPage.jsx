import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Input } from '@/shared/ui/Input';
import { useCrews, useCreateCrew } from '@/features/crews/hooks/useCrews';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar';
import { toast } from 'sonner';
import { Label } from '@/shared/ui/Typography/Label';

export function CrewsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [crewName, setCrewName] = useState('');
  const [crewDesc, setCrewDesc] = useState('');
  const [memberCap, setMemberCap] = useState(10);
  const [visibility, setVisibility] = useState('PUBLIC_LINK');

  const { data: crews = [], isLoading, isError, error } = useCrews();
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

  return (
    <div className="flex flex-col min-h-full">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <Heading level={2} className="tracking-tight text-[20px] font-semibold mb-0.5">Crews</Heading>
          <Text variant="muted" className="text-[13px]">Collaborate in lightweight flat-structured spaces.</Text>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Icons.search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crews..."
              className="pl-8"
            />
          </div>
          <Button size="sm" className="shrink-0 gap-1.5" onClick={() => setIsCreateOpen(true)}>
            <Icons.plus className="w-3.5 h-3.5" />
            Create Crew
          </Button>
        </div>
      </div>

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
                  <option value="PUBLIC_LINK">Public Link</option>
                  <option value="INVITE_ONLY">Invite Only</option>
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

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-[var(--radius-lg)] bg-[var(--bg-subtle)] animate-pulse" />
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div className="text-center py-16 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] border-dashed">
          <div className="w-11 h-11 rounded-full bg-[var(--danger-soft)] flex items-center justify-center mx-auto mb-4 text-[var(--danger)]">
            <Icons.x className="w-5 h-5" />
          </div>
          <Heading level={3} className="text-[15px] font-semibold">Failed to load crews</Heading>
          <Text variant="muted" className="mt-2 mb-6 max-w-md mx-auto">
            {error?.message || 'An unexpected error occurred.'}
          </Text>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredCrews.length === 0 && (
        <div className="text-center py-16 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] border-dashed">
          <div className="w-11 h-11 rounded-full bg-[var(--accent-soft)] flex items-center justify-center mx-auto mb-4 text-[var(--accent)]">
            <Icons.users className="w-5 h-5" />
          </div>
          <Heading level={3} className="text-[15px] font-semibold">No crews found</Heading>
          <Text variant="muted" className="mt-2 mb-6 max-w-md mx-auto">
            Create a crew to collaborate on flat tasks, chat, and share projects.
          </Text>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>Create Crew</Button>
        </div>
      )}

      {/* Crews Grid */}
      {!isLoading && !isError && filteredCrews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrews.map((crew) => (
            <motion.div
              key={crew.id}
              whileHover={{ y: -2 }}
              onClick={() => navigate(`/app/crews/${crew.id}`)}
              className="flex flex-col p-4 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[var(--accent-soft)] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <Avatar size="md" className="bg-[var(--accent-violet)] text-white">
                    <AvatarImage src={crew.avatarUrl} />
                    <AvatarFallback className="bg-[var(--accent-violet)] text-white text-[14px] font-semibold">
                      {crew.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Heading level={4} className="text-[15px] font-semibold leading-snug line-clamp-1">{crew.name}</Heading>
                    <span className="text-[11px] text-[var(--text-tertiary)] uppercase font-mono tracking-wider">
                      {crew.visibility}
                    </span>
                  </div>
                </div>
              </div>

              <Text className="text-[13px] text-[var(--text-secondary)] line-clamp-2 mb-4 h-10">
                {crew.description || 'No description provided.'}
              </Text>

              <div className="mt-auto flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 text-[12px] text-[var(--text-tertiary)]">
                <span className="flex items-center gap-1.5">
                  <Icons.users className="w-3.5 h-3.5" />
                  Cap: {crew.memberCap}
                </span>
                <span className="text-[var(--accent)] font-medium group-hover:underline flex items-center gap-1">
                  View Crew
                  <Icons.chevronRight className="w-3 h-3" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
