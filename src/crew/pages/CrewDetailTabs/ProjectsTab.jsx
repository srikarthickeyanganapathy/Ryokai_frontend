import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Input } from '@/shared/ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar';
import { cn } from '@/shared/lib/cn';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';



import { useCreateCrewTask, useShareProjectWithCrew, useUnshareProjectFromCrew } from '@/crew/features/hooks/useCrews'; import { useCompleteCrewTask } from '@/task';
import { useClaimTask } from '@/task/entities/hooks/useTasks';

/* ==================== PROJECTS TAB ==================== */
export function ProjectsTab({ crewId, sharedProjects, allProjects }) {
  const [selectedProjId, setSelectedProjId] = useState('');
  const shareMutation = useShareProjectWithCrew(crewId);
  const unshareMutation = useUnshareProjectFromCrew(crewId);

  const handleShare = () => {
    if (!selectedProjId) return;
    shareMutation.mutate(selectedProjId, {
      onSuccess: () => setSelectedProjId('')
    });
  };

  // Filter out projects that are already shared, and only allow personal projects (no org/team)
  const shareableProjects = allProjects.filter(
    proj => !sharedProjects.some(sp => sp.id === proj.id) && !proj.organizationId && !proj.teamId
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-[var(--border-subtle)] pb-4">
        <div>
          <Heading level={3} className="text-[15px] font-semibold mb-1">Shared Projects</Heading>
          <Text className="text-[12px] text-[var(--text-tertiary)]">Projects whose tasks are shared with all members of this crew.</Text>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedProjId}
            onChange={(e) => setSelectedProjId(e.target.value)}
            className="h-9 min-w-[200px] rounded-md border border-[var(--border-default)] bg-[var(--bg-sidebar)] p-2 text-sm text-[var(--text-primary)]"
          >
            <option value="">Select project to share...</option>
            {shareableProjects.map(proj => (
              <option key={proj.id} value={proj.id}>{proj.name}</option>
            ))}
          </select>
          <Button size="sm" onClick={handleShare} isLoading={shareMutation.isPending}>Share</Button>
        </div>
      </div>

      {sharedProjects.length === 0 ? (
        <div className="text-center py-12 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] border-dashed">
          <Icons.folderClosed className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-2" />
          <Heading level={4} className="text-[14px] font-medium text-[var(--text-secondary)]">No projects shared yet</Heading>
        </div>
      ) : (
        <div className="space-y-2">
          {sharedProjects.map((proj) => (
            <div key={proj.id} className="flex items-center justify-between p-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] transition-colors hover:bg-[var(--bg-hover)]">
              <Link to={`/app/projects/${proj.id}`} className="flex items-center gap-3 flex-1 min-w-0 group cursor-pointer">
                <div className="w-8 h-8 rounded-md bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] font-semibold shrink-0 transition-colors group-hover:bg-[var(--accent)] group-hover:text-white">
                  {proj.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <Heading level={4} className="text-[14px] font-semibold mb-0.5 group-hover:text-[var(--accent)] transition-colors truncate">{proj.name}</Heading>
                  <Text className="text-[12px] text-[var(--text-secondary)] truncate">{proj.description}</Text>
                </div>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20"
                onClick={() => unshareMutation.mutate(proj.id)}
                isLoading={unshareMutation.isPending}
              >
                Unshare
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
