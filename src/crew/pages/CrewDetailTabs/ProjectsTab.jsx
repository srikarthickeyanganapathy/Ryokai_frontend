import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/Select';
import { useShareProjectWithCrew, useUnshareProjectFromCrew } from '@/crew/features/hooks/useCrews';
import { Link } from 'react-router-dom';
import { FolderKanban, Star, ArrowUpRight, Unlink, Activity, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

// Custom SVG Progress Ring
function ProgressRing({ progress, size = 44, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const getColor = (p) => {
    if (p >= 75) return 'var(--success)';
    if (p >= 40) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--bg-subtle)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(progress)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-semibold text-[var(--text-primary)] font-mono">{progress}%</span>
      </div>
    </div>
  );
}

function SharedProjectCard({ project, index, onUnshare }) {
  const [isFavorite, setIsFavorite] = useState(false);

  // UI derived fallbacks for demonstration (since we can't touch backend/models)
  const completion = project.completion || project.progress || 0;
  const health = project.health || (completion > 70 ? 'On Track' : completion > 0 ? 'At Risk' : 'Planning');
  const riskLevel = project.risk || (completion < 30 && project.dueDate ? 'High' : 'Low');
  const sharedUsers = project.members || project.sharedUsers || [];
  const recentActivity = project.lastUpdated || project.updatedAt || 'Recently';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden hover:border-[var(--accent-border)] hover:shadow-sm transition-all duration-200 flex flex-col"
    >
      {/* Banner / Decorative top */}
      <div className="h-16 bg-[var(--bg-subtle)] relative overflow-hidden border-b border-[var(--border-subtle)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-soft)] via-transparent to-transparent opacity-40"></div>
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-[var(--bg-card)]/80 backdrop-blur-sm border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-amber-500 transition-colors z-10"
        >
          <Star className={cn("w-3.5 h-3.5", isFavorite && "fill-amber-500 text-amber-500")} />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start gap-3.5 mb-4 -mt-10">
          <div className="w-10 h-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm flex items-center justify-center text-[var(--accent)] shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div className="flex-1 pt-6 min-w-0">
            <Heading level={4} className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
              {project.name}
            </Heading>
            <Text variant="muted" className="text-[11px] font-medium mt-0.5">
              Updated {recentActivity}
            </Text>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="flex items-center justify-between gap-4 mb-4 p-3 bg-[var(--bg-subtle)]/50 rounded-lg border border-[var(--border-subtle)]">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border flex items-center gap-1",
                health === 'On Track' ? "bg-[var(--success-soft)] text-[var(--success)] border-[var(--success)]/20" :
                  health === 'At Risk' ? "bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/20" :
                    "bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--border-subtle)]"
              )}>
                <Activity className="w-2.5 h-2.5" /> {health}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium">
              {riskLevel === 'High' ? <AlertTriangle className="w-3 h-3 text-[var(--danger)]" /> : <CheckCircle2 className="w-3 h-3 text-[var(--success)]" />}
              <span>{riskLevel} Risk</span>
            </div>
          </div>
          <ProgressRing progress={completion} />
        </div>

        {/* Shared Users & Quick Actions */}
        <div className="mt-auto pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex -space-x-1.5">
              {sharedUsers.slice(0, 3).map((user, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-[var(--accent)] border-2 border-[var(--bg-card)] flex items-center justify-center text-[9px] font-bold text-white shadow-sm" title={user.username || `User ${i}`}>
                  {(user.username || 'U').charAt(0).toUpperCase()}
                </div>
              ))}
              {sharedUsers.length === 0 && (
                <div className="w-6 h-6 rounded-full bg-[var(--bg-hover)] border-2 border-[var(--bg-card)] flex items-center justify-center text-[9px] font-bold text-[var(--text-muted)]">
                  ?
                </div>
              )}
            </div>
            <span className="ml-2.5 text-[11px] text-[var(--text-muted)] font-medium">
              {sharedUsers.length > 0 ? `${sharedUsers.length} Collaborators` : 'Solo Project'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Link to={`/app/projects/${project.id}`} className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors" title="Open Project">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => onUnshare(project.id)}
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors"
              title="Unshare from Crew"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ProjectsTab({ crewId, sharedProjects, allProjects }) {
  const [selectedProjId, setSelectedProjId] = useState('');
  const shareMutation = useShareProjectWithCrew(crewId);
  const unshareMutation = useUnshareProjectFromCrew(crewId);

  const handleShare = () => {
    if (!selectedProjId) return;
    shareMutation.mutate(selectedProjId, { onSuccess: () => setSelectedProjId('') });
  };

  const shareableProjects = allProjects.filter(proj =>
    !sharedProjects.some(sp => String(sp.id) === String(proj.id)) && !proj.organizationId && !proj.teamId
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <Heading level={3} className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-[var(--accent)]" />
            Shared Projects
          </Heading>
          <Text className="text-[12px] text-[var(--text-muted)] mt-0.5">
            Centralized execution boards whose tasks are visible to all crew members.
          </Text>
        </div>

        {/* Quick Share Component */}
        <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-1 shadow-sm">
          <Select value={selectedProjId} onValueChange={setSelectedProjId}>
            <SelectTrigger className="h-8 min-w-[200px] text-[12px] border-none shadow-none focus:ring-0 bg-transparent font-medium">
              <SelectValue placeholder="Select project to share..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {shareableProjects.length === 0 ? (
                <SelectItem value="none" disabled>No projects available to share</SelectItem>
              ) : (
                shareableProjects.map(proj => (
                  <SelectItem key={proj.id} value={proj.id.toString()}>{proj.name}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="h-8 text-[12px] font-semibold gap-1.5 shadow-sm"
            onClick={handleShare}
            disabled={!selectedProjId || shareMutation.isPending}
          >
            <Plus className="w-3.5 h-3.5" /> Share Now
          </Button>
        </div>
      </div>

      {sharedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)]">
          <FolderKanban className="w-8 h-8 text-[var(--text-muted)] mb-3" />
          <Heading level={4} className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">No projects shared yet</Heading>
          <Text variant="muted" className="text-[13px] max-w-sm mb-5">
            Share a project with this crew to let members view tasks, track progress, and collaborate on execution together.
          </Text>
          {shareableProjects.length > 0 && (
            <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-1 shadow-sm">
              <Select value={selectedProjId} onValueChange={setSelectedProjId}>
                <SelectTrigger className="h-8 min-w-[200px] text-[12px] border-none shadow-none focus:ring-0 bg-transparent font-medium">
                  <SelectValue placeholder="Choose a project..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {shareableProjects.map(proj => (
                    <SelectItem key={proj.id} value={proj.id.toString()}>{proj.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="h-8 text-[12px] font-semibold gap-1.5" onClick={handleShare} disabled={!selectedProjId}>
                <Plus className="w-3.5 h-3.5" /> Share Now
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharedProjects.map((proj, index) => (
            <SharedProjectCard
              key={proj.id}
              project={proj}
              index={index}
              onUnshare={(id) => unshareMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
