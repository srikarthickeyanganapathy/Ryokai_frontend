import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button, IconButton } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Avatar, AvatarFallback } from '@/shared/ui/Avatar';
import { Progress } from '@/shared/ui/Progress';
import { Input } from '@/shared/ui/Input';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/shared/ui/Modal';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/Select';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { useShareProjectWithCrew, useUnshareProjectFromCrew } from '@/crew/features/hooks/useCrews';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Star,
  ArrowUpRight,
  Unlink,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Plus,
  LayoutGrid,
  GanttChart,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Users,
  ShieldAlert,
  Sparkles,
  Clock,
  Check,
  Loader2,
  Crown,
} from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';

// Radial Progress Ring Component
function ProgressRing({ progress = 0, size = 48, strokeWidth = 4 }) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedProgress / 100) * circumference;

  const getColor = (p) => {
    if (p >= 75) return 'var(--success)';
    if (p >= 40) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
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
          stroke={getColor(normalizedProgress)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-[var(--text-primary)] font-mono">
          {Math.round(normalizedProgress)}%
        </span>
      </div>
    </div>
  );
}

// Date formatter helper
function formatDate(dateStr) {
  if (!dateStr) return 'Active';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return String(dateStr);
  }
}

// Health Radar derivation logic
function getHealthInfo(project) {
  const completion = project.completion ?? project.progress ?? 0;
  const isOverdue = project.dueDate && new Date(project.dueDate) < new Date() && completion < 100;
  
  if (project.health === 'Delayed' || project.health === 'Critical' || isOverdue) {
    return {
      status: 'Delayed',
      label: 'Delayed',
      badgeVariant: 'danger',
      indicatorBg: 'bg-[var(--danger-soft)]',
      indicatorText: 'text-[var(--danger)]',
      dotColor: 'bg-[var(--danger)]',
      Icon: ShieldAlert,
    };
  }
  
  if (project.health === 'At Risk' || (completion > 0 && completion < 40)) {
    return {
      status: 'At Risk',
      label: 'At Risk',
      badgeVariant: 'warning',
      indicatorBg: 'bg-[var(--warning-soft)]',
      indicatorText: 'text-[#B45309] dark:text-[var(--warning)]',
      dotColor: 'bg-amber-500',
      Icon: AlertTriangle,
    };
  }

  if (project.health === 'Planning' || (completion === 0 && !project.status)) {
    return {
      status: 'Planning',
      label: 'Planning',
      badgeVariant: 'outline',
      indicatorBg: 'bg-[var(--bg-subtle)]',
      indicatorText: 'text-[var(--text-muted)]',
      dotColor: 'bg-[var(--text-muted)]',
      Icon: Clock,
    };
  }

  return {
    status: 'On Track',
    label: 'On Track',
    badgeVariant: 'success',
    indicatorBg: 'bg-[var(--success-soft)]',
    indicatorText: 'text-[var(--success)]',
    dotColor: 'bg-emerald-500',
    Icon: CheckCircle2,
  };
}

// Shimmer Skeleton Loader for State 1
function ProjectsTabSkeleton({ viewMode }) {
  if (viewMode === 'timeline') {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-4 animate-pulse">
        <div className="h-8 bg-[var(--bg-subtle)] rounded-lg w-1/4 mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-[var(--border-subtle)]/50">
            <div className="w-40 space-y-2">
              <div className="h-4 bg-[var(--bg-subtle)] rounded w-3/4" />
              <div className="h-3 bg-[var(--bg-subtle)] rounded w-1/2" />
            </div>
            <div className="flex-1 h-8 bg-[var(--bg-subtle)] rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-[var(--bg-subtle)] rounded w-1/3" />
            <div className="h-5 bg-[var(--bg-subtle)] rounded-full w-20" />
          </div>
          <div className="h-6 bg-[var(--bg-subtle)] rounded w-2/3" />
          <div className="h-12 bg-[var(--bg-subtle)] rounded-lg" />
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
            <div className="h-6 w-6 bg-[var(--bg-subtle)] rounded-full" />
            <div className="h-4 bg-[var(--bg-subtle)] rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Project Card Component for Grid View
function SharedProjectCard({ project, index, isFavorite, onToggleFavorite, onRequestUnshare }) {
  const completion = project.completion ?? project.progress ?? 0;
  const healthInfo = getHealthInfo(project);
  const category = project.category || project.department || 'Mission';
  const ownerName = project.createdBy || project.ownerName || project.owner?.username || 'Lead';
  const members = project.members || project.sharedUsers || [];

  // Derive task metrics
  const totalTasks = project.totalTasks ?? project.tasksCount ?? (project.tasks ? project.tasks.length : 10);
  const completedTasks = project.completedTasks ?? Math.round((completion / 100) * totalTasks);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="group relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden hover:border-[var(--accent-border)] hover:shadow-md transition-all duration-200 flex flex-col"
    >
      {/* Top Banner Accent */}
      <div className="h-2 bg-gradient-to-r from-[var(--accent)] via-indigo-500 to-sky-400 opacity-80 group-hover:opacity-100 transition-opacity" />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="primary" size="xs" className="font-semibold uppercase tracking-wider">
              {category}
            </Badge>
            <span className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border",
              healthInfo.indicatorBg,
              healthInfo.indicatorText,
              "border-current/20"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", healthInfo.dotColor)} />
              {healthInfo.label}
            </span>
          </div>

          <IconButton
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onToggleFavorite(project.id)}
            className="text-[var(--text-muted)] hover:text-amber-500 transition-colors"
            title={isFavorite ? 'Remove favorite' : 'Mark favorite'}
          >
            <Star className={cn("w-4 h-4", isFavorite && "fill-amber-500 text-amber-500")} />
          </IconButton>
        </div>

        {/* Project Title & Info */}
        <div className="mb-4">
          <Heading level={4} className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
            {project.name}
          </Heading>
          {project.description && (
            <Text variant="muted" className="text-[12px] line-clamp-2 mt-1 leading-relaxed">
              {project.description}
            </Text>
          )}
        </div>

        {/* Radar & Task Metrics Box */}
        <div className="p-3.5 bg-[var(--bg-subtle)]/60 rounded-xl border border-[var(--border-subtle)] mb-4 flex items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-[var(--text-secondary)]">Task Execution</span>
              <span className="font-mono text-[var(--text-muted)] font-semibold">
                {completedTasks}/{totalTasks}
              </span>
            </div>
            <Progress value={(completedTasks / Math.max(totalTasks, 1)) * 100} className="h-1.5" />
            <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-0.5">
              <span>Updated {formatDate(project.lastUpdated || project.updatedAt)}</span>
            </div>
          </div>
          <ProgressRing progress={completion} size={46} strokeWidth={4} />
        </div>

        {/* Footer: Lead Avatar & Actions */}
        <div className="mt-auto pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
          {/* Squad Avatars */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative shrink-0" title={`Project Lead: ${ownerName}`}>
              <Avatar size="xs">
                <AvatarFallback className="bg-[var(--accent)] text-white font-bold text-[10px]">
                  {ownerName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Crown className="w-2.5 h-2.5 text-amber-500 absolute -top-1 -right-1 drop-shadow" />
            </div>

            <div className="flex -space-x-1.5 overflow-hidden shrink-0">
              {members.slice(0, 3).map((u, i) => (
                <Avatar key={i} size="xs" className="border border-[var(--bg-card)]">
                  <AvatarFallback className="bg-[var(--bg-subtle)] text-[var(--text-secondary)] text-[9px] font-semibold">
                    {(u.username || 'M').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>

            <span className="text-[11px] text-[var(--text-muted)] truncate font-medium">
              {ownerName}
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-1 shrink-0">
            <Link
              to={`/app/projects/${project.id}`}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
              title="Open Project Workspace"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <IconButton
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onRequestUnshare(project)}
              className="text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors"
              title="Unshare from Crew"
            >
              <Unlink className="w-4 h-4" />
            </IconButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Mini-Gantt Timeline View
function MiniGanttTimelineView({ projects, isFavorite, onToggleFavorite, onRequestUnshare }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  const visibleMonths = [
    months[(currentMonthIdx) % 12],
    months[(currentMonthIdx + 1) % 12],
    months[(currentMonthIdx + 2) % 12],
    months[(currentMonthIdx + 3) % 12],
  ];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
      {/* Timeline Header */}
      <div className="grid grid-cols-12 gap-2 p-4 bg-[var(--bg-subtle)]/70 border-b border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
        <div className="col-span-5 md:col-span-4">Project & Health Radar</div>
        <div className="col-span-7 md:col-span-8 grid grid-cols-4 gap-2 text-center border-l border-[var(--border-subtle)] pl-4">
          {visibleMonths.map((m, idx) => (
            <div key={idx} className="truncate">
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[var(--border-subtle)]">
        {projects.map((project, index) => {
          const completion = project.completion ?? project.progress ?? 0;
          const healthInfo = getHealthInfo(project);
          const ownerName = project.createdBy || project.ownerName || project.owner?.username || 'Lead';

          // Gantt bar math based on completion or dates
          const barStartPercent = Math.min(index * 15, 40);
          const barWidthPercent = Math.max(30, Math.min(80 - barStartPercent, 60));

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15, delay: index * 0.03 }}
              className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-[var(--bg-subtle)]/40 transition-colors"
            >
              {/* Project Metadata Column */}
              <div className="col-span-5 md:col-span-4 pr-2 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn("w-2 h-2 rounded-full shrink-0", healthInfo.dotColor)} />
                    <Link
                      to={`/app/projects/${project.id}`}
                      className="font-semibold text-[13px] text-[var(--text-primary)] hover:text-[var(--accent)] truncate transition-colors"
                    >
                      {project.name}
                    </Link>
                  </div>
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => onToggleFavorite(project.id)}
                    className="text-[var(--text-muted)] hover:text-amber-500 transition-colors shrink-0"
                  >
                    <Star className={cn("w-3.5 h-3.5", isFavorite(project.id) && "fill-amber-500 text-amber-500")} />
                  </IconButton>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                  <Badge variant="outline" size="xs" className="text-[10px]">
                    {project.category || 'Mission'}
                  </Badge>
                  <span className="truncate">Lead: @{ownerName}</span>
                </div>
              </div>

              {/* Gantt Timeline Bar Column */}
              <div className="col-span-7 md:col-span-8 border-l border-[var(--border-subtle)] pl-4 relative py-2">
                <div className="w-full bg-[var(--bg-subtle)] h-7 rounded-lg relative overflow-hidden border border-[var(--border-subtle)]">
                  <div
                    className="absolute top-0 bottom-0 bg-[var(--accent-soft)] rounded-md border border-[var(--accent-border)] flex items-center px-2 text-[10px] font-semibold text-[var(--accent)] transition-all duration-500"
                    style={{ left: `${barStartPercent}%`, width: `${barWidthPercent}%` }}
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-[var(--accent)] opacity-30 rounded-l-md"
                      style={{ width: `${completion}%` }}
                    />
                    <span className="relative z-10 font-mono truncate">
                      {completion}% ({healthInfo.label})
                    </span>
                  </div>
                </div>

                {/* Direct Action Overlay */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-[var(--bg-card)]/90 backdrop-blur-xs p-0.5 rounded-md border border-[var(--border-subtle)]">
                  <Link
                    to={`/app/projects/${project.id}`}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--accent)]"
                    title="Open Workspace"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => onRequestUnshare(project)}
                    className="text-[var(--text-muted)] hover:text-[var(--danger)] h-6 w-6"
                    title="Unshare Project"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                  </IconButton>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Main ProjectsTab Mission Execution Board Component
export function ProjectsTab({
  crewId,
  sharedProjects = [],
  allProjects = [],
  isLoading = false,
  isError = false,
  refetch,
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'timeline'
  const [searchQuery, setSearchQuery] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');
  const [favorites, setFavorites] = useState(new Set());
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedProjId, setSelectedProjId] = useState('');
  const [unshareTarget, setUnshareTarget] = useState(null);

  const shareMutation = useShareProjectWithCrew(crewId);
  const unshareMutation = useUnshareProjectFromCrew(crewId);

  // Toggle Favorites
  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter projects ready to share (not already shared)
  const shareableProjects = useMemo(() => {
    return allProjects.filter(
      (proj) => !sharedProjects.some((sp) => String(sp.id) === String(proj.id))
    );
  }, [allProjects, sharedProjects]);

  // Filter shared projects based on search & health radar filter
  const filteredProjects = useMemo(() => {
    return sharedProjects.filter((project) => {
      const matchesSearch =
        !searchQuery.trim() ||
        project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.createdBy?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (healthFilter === 'all') return true;
      const healthInfo = getHealthInfo(project);
      if (healthFilter === 'on_track') return healthInfo.status === 'On Track';
      if (healthFilter === 'at_risk') return healthInfo.status === 'At Risk';
      if (healthFilter === 'delayed') return healthInfo.status === 'Delayed';
      if (healthFilter === 'planning') return healthInfo.status === 'Planning';
      return true;
    });
  }, [sharedProjects, searchQuery, healthFilter]);

  // Handle Share Submission
  const handleShareSubmit = () => {
    if (!selectedProjId) return;
    shareMutation.mutate(selectedProjId, {
      onSuccess: () => {
        setSelectedProjId('');
        setIsShareModalOpen(false);
      },
    });
  };

  // Handle Unshare Confirmation
  const handleConfirmUnshare = () => {
    if (!unshareTarget) return;
    unshareMutation.mutate(unshareTarget.id, {
      onSuccess: () => {
        setUnshareTarget(null);
      },
    });
  };

  // UX State 3: Error State
  if (isError) {
    return (
      <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
        <ErrorState
          title="Failed to Load Shared Projects"
          description="We encountered an issue fetching the mission board for this crew. Please verify network connectivity."
          action={
            refetch && (
              <Button size="sm" variant="outline" onClick={refetch} className="gap-2">
                <RefreshCw className="w-3.5 h-3.5" /> Retry Load
              </Button>
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Board Header & Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] shrink-0">
              <FolderKanban className="w-4.5 h-4.5" />
            </div>
            <div>
              <Heading level={3} className="text-[16px] font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                Mission Execution Board
                <Badge variant="primary" size="xs" className="font-mono">
                  {sharedProjects.length}
                </Badge>
              </Heading>
              <Text variant="muted" className="text-[12px] mt-0.5">
                Centralized squad projects with real-time health radar, task linkage, and Gantt tracking.
              </Text>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-[12px] bg-[var(--bg-card)] border-[var(--border-subtle)]"
            />
          </div>

          {/* Health Radar Filter Dropdown */}
          <Select value={healthFilter} onValueChange={setHealthFilter}>
            <SelectTrigger className="h-8 w-[140px] text-[12px] bg-[var(--bg-card)] border-[var(--border-subtle)] font-medium">
              <SelectValue placeholder="Health Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="on_track">🟢 On Track</SelectItem>
              <SelectItem value="at_risk">🟡 At Risk</SelectItem>
              <SelectItem value="delayed">🔴 Delayed</SelectItem>
              <SelectItem value="planning">⚪ Planning</SelectItem>
            </SelectContent>
          </Select>

          {/* View Switcher (Grid vs Mini-Gantt) */}
          <div className="flex items-center bg-[var(--bg-subtle)] p-0.5 rounded-lg border border-[var(--border-subtle)]">
            <IconButton
              type="button"
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="xs"
              onClick={() => setViewMode('grid')}
              className={cn("h-7 px-2 gap-1.5 text-[11px] font-semibold", viewMode === 'grid' && "bg-[var(--bg-card)] shadow-xs")}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </IconButton>
            <IconButton
              type="button"
              variant={viewMode === 'timeline' ? 'secondary' : 'ghost'}
              size="xs"
              onClick={() => setViewMode('timeline')}
              className={cn("h-7 px-2 gap-1.5 text-[11px] font-semibold", viewMode === 'timeline' && "bg-[var(--bg-card)] shadow-xs")}
              title="Mini-Gantt Timeline View"
            >
              <GanttChart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Timeline</span>
            </IconButton>
          </div>

          {/* Share Project Modal Trigger */}
          <Button
            size="sm"
            className="h-8 text-[12px] font-semibold gap-1.5 shadow-sm"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" /> Share Project
          </Button>
        </div>
      </div>

      {/* UX State 1: Loading Skeleton */}
      {isLoading ? (
        <ProjectsTabSkeleton viewMode={viewMode} />
      ) : sharedProjects.length === 0 ? (
        /* UX State 2: Empty State */
        <EmptyState
          icon={FolderKanban}
          title="No Shared Projects Yet"
          description="Link execution projects to this crew workspace to track mission objectives, health radar badges, and task deliverables together."
          actionLabel="Share First Project"
          onAction={() => setIsShareModalOpen(true)}
          className="bg-[var(--bg-card)]"
        />
      ) : filteredProjects.length === 0 ? (
        /* UX State 6: Filtered Empty State */
        <div className="flex flex-col items-center justify-center py-12 text-center bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] rounded-xl p-6">
          <Filter className="w-8 h-8 text-[var(--text-muted)] mb-2.5 opacity-60" />
          <Heading level={4} className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">
            No projects match your filter
          </Heading>
          <Text variant="muted" className="text-[12px] max-w-sm mb-4">
            Try adjusting your search keywords or health status filter to display active mission boards.
          </Text>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setHealthFilter('all');
            }}
            className="text-[12px] gap-1.5"
          >
            <RefreshCw className="w-3 h-3" /> Clear Filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* UX State 4: Active Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <SharedProjectCard
                key={project.id}
                project={project}
                index={index}
                isFavorite={favorites.has(project.id)}
                onToggleFavorite={toggleFavorite}
                onRequestUnshare={(proj) => setUnshareTarget(proj)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* UX State 5: Mini-Gantt Timeline View */
        <MiniGanttTimelineView
          projects={filteredProjects}
          isFavorite={(id) => favorites.has(id)}
          onToggleFavorite={toggleFavorite}
          onRequestUnshare={(proj) => setUnshareTarget(proj)}
        />
      )}

      {/* Share Project Modal */}
      <Modal open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <ModalContent className="sm:max-w-md">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2 text-[16px]">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              Share Project with Crew
            </ModalTitle>
            <ModalDescription className="text-[13px]">
              Choose an existing workspace project to share with this crew. Squad members will gain full task linkage and timeline monitoring.
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4 py-2">
            {shareableProjects.length === 0 ? (
              <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-center text-[12px] text-[var(--text-muted)]">
                All of your available workspace projects are already shared with this crew.
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)]">
                  Select Project
                </label>
                <Select value={selectedProjId} onValueChange={setSelectedProjId}>
                  <SelectTrigger className="w-full h-10 text-[13px] bg-[var(--bg-card)] border-[var(--border-default)]">
                    <SelectValue placeholder="Choose a project to link..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-60">
                    {shareableProjects.map((proj) => (
                      <SelectItem key={proj.id} value={String(proj.id)}>
                        <div className="flex items-center justify-between gap-4 w-full">
                          <span className="font-semibold">{proj.name}</span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            {proj.category || 'Project'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <ModalFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsShareModalOpen(false)}
              className="text-[12px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleShareSubmit}
              disabled={!selectedProjId || shareMutation.isPending || shareableProjects.length === 0}
              className="text-[12px] gap-1.5"
            >
              {shareMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sharing...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" /> Confirm Share
                </>
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Unshare Confirmation Modal */}
      <Modal open={!!unshareTarget} onOpenChange={(open) => !open && setUnshareTarget(null)}>
        <ModalContent className="sm:max-w-md">
          <ModalHeader>
            <ModalTitle className="text-[16px] text-[var(--danger)] flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
              Unshare Project from Crew?
            </ModalTitle>
            <ModalDescription className="text-[13px]">
              Are you sure you want to unshare <strong className="text-[var(--text-primary)]">{unshareTarget?.name}</strong>?
              Crew members will lose execution access to this board in their crew view.
            </ModalDescription>
          </ModalHeader>

          <ModalFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUnshareTarget(null)}
              className="text-[12px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmUnshare}
              disabled={unshareMutation.isPending}
              className="text-[12px] gap-1.5"
            >
              {unshareMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Unsharing...
                </>
              ) : (
                <>
                  <Unlink className="w-3.5 h-3.5" /> Unshare Project
                </>
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

