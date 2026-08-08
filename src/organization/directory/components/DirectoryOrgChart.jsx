import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';
import { SPRINGS, TIMING, EASING } from '@/shared/lib/uxTokens';
import {
  Users,
  Users2,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Network,
  Building2,
} from '@/shared/ui/Icons';

const PRIORITY_LABELS = {
  0: 'Administrators',
  1: 'Directors',
  2: 'Managers',
  3: 'Members',
};

const getPriorityLabel = (priority) => PRIORITY_LABELS[priority] || `Tier ${priority}`;

// ─── Department Color Coding ─────────────────────────────────────────
const ROLE_HUE_MAP = [0, 35, 210, 260]; // Admin=red, Director=amber, Manager=blue, Member=purple-blue

function getNodeColor(rolePriority = 99) {
  const idx = Math.min(rolePriority, ROLE_HUE_MAP.length - 1);
  const hue = ROLE_HUE_MAP[idx] ?? 210;
  return {
    bg: `hsl(${hue} 20% 96%)`,
    border: `hsl(${hue} 70% 50%)`,
    text: `hsl(${hue} 70% 35%)`,
    bgSoft: `hsl(${hue} 70% 96% / 0.6)`,
    hue,
  };
}

// ─── Tree Builder ─────────────────────────────────────────────────────
function buildOrgTree(members) {
  const memberMap = new Map();
  const roots = [];

  members.forEach((m) => {
    memberMap.set(m.userId, { ...m, children: [] });
  });

  members.forEach((m) => {
    const parentId = m.reportsTo || m.managerId;
    if (parentId && memberMap.has(parentId) && parentId !== m.userId) {
      memberMap.get(parentId).children.push(memberMap.get(m.userId));
    } else {
      roots.push(memberMap.get(m.userId));
    }
  });

  // If no tree structure detected, return null to use fallback
  const hasRelationships = members.some(
    (m) => (m.reportsTo || m.managerId) && memberMap.has(m.reportsTo || m.managerId)
  );
  if (!hasRelationships || roots.length === 0) return null;

  return roots;
}

// ─── Empty State Illustration ─────────────────────────────────────────
function EmptyOrgIllustration() {
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" className="mb-4 opacity-40">
      {/* Node 1 (top) */}
      <rect x="60" y="4" width="40" height="20" rx="6" fill="var(--bg-subtle)" stroke="var(--border-subtle)" strokeWidth="1.5" />
      <circle cx="80" cy="14" r="6" fill="var(--text-muted)" opacity="0.3" />
      {/* Connector line */}
      <line x1="80" y1="24" x2="80" y2="40" stroke="var(--border-subtle)" strokeWidth="1.5" strokeDasharray="3 3" />
      {/* Horizontal line */}
      <line x1="20" y1="52" x2="140" y2="52" stroke="var(--border-subtle)" strokeWidth="1.5" strokeDasharray="3 3" />
      {/* Node 2 */}
      <rect x="4" y="58" width="40" height="20" rx="6" fill="var(--bg-subtle)" stroke="var(--border-subtle)" strokeWidth="1.5" />
      <circle cx="24" cy="68" r="6" fill="var(--text-muted)" opacity="0.3" />
      {/* Node 3 */}
      <rect x="60" y="58" width="40" height="20" rx="6" fill="var(--bg-subtle)" stroke="var(--border-subtle)" strokeWidth="1.5" />
      <circle cx="80" cy="68" r="6" fill="var(--text-muted)" opacity="0.3" />
      {/* Node 4 */}
      <rect x="116" y="58" width="40" height="20" rx="6" fill="var(--bg-subtle)" stroke="var(--border-subtle)" strokeWidth="1.5" />
      <circle cx="136" cy="68" r="6" fill="var(--text-muted)" opacity="0.3" />
      {/* More lines */}
      <line x1="24" y1="78" x2="24" y2="92" stroke="var(--border-subtle)" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="80" y1="78" x2="80" y2="92" stroke="var(--border-subtle)" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="136" y1="78" x2="136" y2="92" stroke="var(--border-subtle)" strokeWidth="1.5" strokeDasharray="3 3" />
      {/* Bottom nodes */}
      <rect x="4" y="96" width="40" height="20" rx="6" fill="var(--bg-subtle)" stroke="var(--border-subtle)" strokeWidth="1.5" />
      <rect x="60" y="96" width="40" height="20" rx="6" fill="var(--bg-subtle)" stroke="var(--border-subtle)" strokeWidth="1.5" />
      <rect x="116" y="96" width="40" height="20" rx="6" fill="var(--bg-subtle)" stroke="var(--border-subtle)" strokeWidth="1.5" />
    </svg>
  );
}

// ─── Zoom Controls ────────────────────────────────────────────────────
function ZoomControls({ scale, onZoomIn, onZoomOut, onFitToScreen, containerRef }) {
  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-0.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg p-1 shadow-lg z-20">
      <button
        onClick={onZoomOut}
        disabled={scale <= 0.3}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Zoom out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <span className="text-[11px] font-medium text-[var(--text-secondary)] min-w-[36px] text-center tabular-nums select-none">
        {Math.round(scale * 100)}%
      </span>
      <button
        onClick={onZoomIn}
        disabled={scale >= 2}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Zoom in"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <div className="w-px h-5 bg-[var(--border-subtle)] mx-0.5" />
      <button
        onClick={onFitToScreen}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        title="Fit to screen"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Tree Node ────────────────────────────────────────────────────────
function TreeNode({ node, onClick, searchQuery, depth = 0, teamCount = 0 }) {
  const isSuspended = node.status === 'SUSPENDED';
  const colors = getNodeColor(node.rolePriority);
  const isSearchMatch =
    searchQuery && searchQuery.trim().length > 0
      ? (node.username || '').toLowerCase().includes(searchQuery.toLowerCase())
      : false;

  return (
    <div className="flex flex-col items-center" style={{ minWidth: depth > 0 ? 160 : 180 }}>
      {/* Node card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRINGS.normal}
        whileHover={{ scale: 1.05, y: -2 }}
        onClick={() => onClick?.(node)}
        className={cn(
          'relative flex flex-col items-center rounded-2xl px-4 py-3 cursor-pointer transition-shadow',
          'border bg-[var(--bg-card)]',
          isSearchMatch
            ? 'ring-2 ring-[var(--accent)] shadow-lg shadow-[var(--accent-soft)]/30'
            : 'border-[var(--border-subtle)] hover:shadow-lg hover:border-[var(--accent-border)]',
          isSuspended && 'opacity-60'
        )}
        style={{
          minWidth: 150,
          ...(isSearchMatch && { animation: 'orgPulse 2s ease-in-out infinite' }),
        }}
      >
        {/* Search pulse ring */}
        {isSearchMatch && (
          <>
            <style>{`
              @keyframes orgPulse {
                0%, 100% { box-shadow: 0 0 0 0 var(--accent-soft); }
                50% { box-shadow: 0 0 0 8px transparent; }
              }
            `}</style>
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-[var(--accent)]"
              animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}

        {/* Top connector dot */}
        {depth > 0 && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[var(--border-subtle)] group-hover:bg-[var(--accent)] transition-colors" />
        )}

        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold mb-2 shadow-sm transition-transform"
          style={{
            background: `linear-gradient(135deg, hsl(${colors.hue} 55% 52%), hsl(${colors.hue} 70% 38%))`,
            color: '#fff',
            border: `3px solid hsl(${colors.hue} 80% 55%)`,
          }}
        >
          {node.username?.charAt(0).toUpperCase() || '?'}
        </div>

        {/* Name */}
        <span className="text-[13px] font-semibold text-[var(--text-primary)] text-center truncate w-full leading-tight">
          {node.username}
        </span>

        {/* Role badge */}
        <Badge
          variant="outline"
          className="mt-1 text-[10px] uppercase tracking-wider px-1.5 py-0 font-semibold"
          style={{
            borderColor: `hsl(${colors.hue} 70% 50%)`,
            color: `hsl(${colors.hue} 70% 35%)`,
            background: `hsl(${colors.hue} 30% 96%)`,
          }}
        >
          {node.orgRole || 'Member'}
        </Badge>

        {/* Team count */}
        {teamCount > 0 && (
          <span className="mt-1 text-[10px] font-medium text-[var(--text-muted)] flex items-center gap-1">
            <Users2 className="w-3 h-3" />
            {teamCount} {teamCount === 1 ? 'team' : 'teams'}
          </span>
        )}

        {/* Suspended indicator */}
        {isSuspended && (
          <div
            className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[var(--danger)] border-2 border-[var(--bg-card)] rounded-full"
            title="Suspended"
          />
        )}
      </motion.div>

      {/* Children */}
      {node.children && node.children.length > 0 && (
        <div className="flex flex-col items-center mt-0">
          {/* Vertical connector */}
          <div className="w-px h-6 bg-[var(--border-subtle)]" />
          {/* Horizontal connector */}
          <div className="relative flex items-start justify-center">
            <div
              className="absolute top-0 border-t border-[var(--border-subtle)]"
              style={{
                width: `${Math.max((node.children.length - 1) * 30, 10)}px`,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
            <div className="flex items-start justify-center gap-6 pt-6">
              {node.children.map((child) => (
                <div key={child.userId} className="flex flex-col items-center">
                  {/* Drop line */}
                  <div className="w-px h-6 bg-[var(--border-subtle)] -mt-6 mb-0" />
                  <TreeNode node={child} onClick={onClick} searchQuery={searchQuery} depth={depth + 1} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tiered Fallback Layout ───────────────────────────────────────────
function TieredLayout({ groupedMembers, onSelectMember, searchQuery, memberTeamsMap }) {
  const [expandedTiers, setExpandedTiers] = useState({});

  const toggleTier = (priority) => {
    setExpandedTiers((prev) => ({ ...prev, [priority]: !prev[priority] }));
  };

  return (
    <div className="flex flex-col items-center w-full pb-6">
      {groupedMembers.map((group, groupIdx) => {
        const isExpanded = expandedTiers[group.priority];
        const visibleMembers = isExpanded ? group.members : group.members.slice(0, 6);
        const hiddenCount = group.members.length - visibleMembers.length;

        return (
          <div key={group.priority} className="flex flex-col items-center w-full min-w-[600px]">
            {/* Tier Label */}
            <div className="mb-4 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-subtle)] px-2 py-1 rounded-full border border-[var(--border-subtle)]">
                {getPriorityLabel(group.priority)}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                {group.members.length} {group.members.length === 1 ? 'person' : 'people'}
              </span>
            </div>

            {/* Nodes Row */}
            <div className="flex justify-center gap-4 flex-wrap w-full mb-4">
              {visibleMembers.map((member) => {
                const teams = memberTeamsMap?.[member.userId] || [];
                const isSearchMatch =
                  searchQuery && searchQuery.trim().length > 0
                    ? (member.username || '').toLowerCase().includes(searchQuery.toLowerCase())
                    : false;

                return (
                  <EnhancedOrgNode
                    key={member.userId}
                    member={member}
                    onClick={() => onSelectMember(member)}
                    isSearchMatch={isSearchMatch}
                    teamCount={teams.length}
                  />
                );
              })}

              {/* Expand/Collapse Pill */}
              {group.members.length > 6 && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleTier(group.priority)}
                  className="flex flex-col items-center justify-center w-[140px] h-[140px] rounded-lg border border-dashed border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-subtle)] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mb-2 group-hover:bg-[var(--accent-soft)] group-hover:border-[var(--accent-border)] transition-colors">
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-transform',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </div>
                  <Text size="xs" variant="muted" className="font-medium">
                    {isExpanded ? 'Show less' : `+${hiddenCount} more`}
                  </Text>
                </motion.button>
              )}
            </div>

            {/* Connector Line to Next Tier */}
            {groupIdx < groupedMembers.length - 1 && (
              <div className="relative flex justify-center w-full mb-4">
                <div className="absolute h-6 w-px bg-[var(--border-subtle)] top-0 left-1/2 -translate-x-1/2" />
                <div className="w-2/3 border-t border-[var(--border-subtle)] mt-6" />
                <div className="absolute h-6 w-px bg-[var(--border-subtle)] bottom-[-1.5rem] left-1/2 -translate-x-1/2" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Enhanced Org Node (used in tiered fallback) ──────────────────────
function EnhancedOrgNode({ member, onClick, isSearchMatch, teamCount = 0 }) {
  const isSuspended = member.status === 'SUSPENDED';
  const colors = getNodeColor(member.rolePriority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.05, y: -2 }}
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center w-[140px] cursor-pointer group',
        'rounded-2xl border bg-[var(--bg-card)] p-3 transition-shadow',
        isSearchMatch
          ? 'ring-2 ring-[var(--accent)] shadow-lg shadow-[var(--accent-soft)]/30'
          : 'border-[var(--border-subtle)] hover:shadow-lg hover:border-[var(--accent-border)]',
        isSuspended && 'opacity-60'
      )}
      style={isSearchMatch ? { animation: 'orgPulse 2s ease-in-out infinite' } : undefined}
    >
      {/* Search pulse ring */}
      {isSearchMatch && (
        <>
          <style>{`
            @keyframes orgPulse {
              0%, 100% { box-shadow: 0 0 0 0 var(--accent-soft); }
              50% { box-shadow: 0 0 0 8px transparent; }
            }
          `}</style>
        </>
      )}

      {/* Connector node dot */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--border-subtle)] group-hover:bg-[var(--accent)] transition-colors" />

      {/* Avatar */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold mb-2 shadow-sm"
        style={{
          background: `linear-gradient(135deg, hsl(${colors.hue} 55% 52%), hsl(${colors.hue} 70% 38%))`,
          color: '#fff',
          border: `3px solid hsl(${colors.hue} 80% 55%)`,
        }}
      >
        {member.username?.charAt(0).toUpperCase() || '?'}
      </div>

      {/* Name */}
      <Text className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors text-center truncate w-full">
        {member.username}
      </Text>

      {/* Role Badge */}
      <Badge
        variant="outline"
        className="mt-1 text-[9px] uppercase tracking-wider px-1.5 py-0 font-semibold"
        style={{
          borderColor: `hsl(${colors.hue} 70% 50%)`,
          color: `hsl(${colors.hue} 70% 35%)`,
          background: `hsl(${colors.hue} 30% 96%)`,
        }}
      >
        {member.orgRole}
      </Badge>

      {/* Team count */}
      {teamCount > 0 && (
        <span className="mt-1 text-[9px] font-medium text-[var(--text-muted)] flex items-center gap-0.5">
          <Users2 className="w-2.5 h-2.5" />
          {teamCount} {teamCount === 1 ? 'team' : 'teams'}
        </span>
      )}

      {/* Suspended indicator */}
      {isSuspended && (
        <div className="absolute -top-2 -right-2 w-3.5 h-3.5 bg-[var(--danger)] border-2 border-[var(--bg-card)] rounded-full" title="Suspended" />
      )}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────
export function DirectoryOrgChart({ members, onSelectMember, searchQuery = '', memberTeamsMap = {} }) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  // Try to build a tree; fallback to tiered grouping
  const treeRoots = useMemo(() => buildOrgTree(members), [members]);

  // Group members by rolePriority (fallback)
  const groupedMembers = useMemo(() => {
    const groups = {};
    members.forEach((member) => {
      const priority = member.rolePriority ?? 999;
      if (!groups[priority]) groups[priority] = [];
      groups[priority].push(member);
    });

    return Object.keys(groups)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => ({ priority: Number(key), members: groups[key] }));
  }, [members]);

  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;
    const container = containerRef.current;
    const content = contentRef.current;
    const containerW = container.clientWidth - 48;
    const contentW = content.scrollWidth;
    if (contentW <= containerW) {
      setScale(1);
    } else {
      const newScale = Math.max(0.3, containerW / contentW);
      setScale(Math.min(1, newScale));
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(2, Math.round((prev + 0.1) * 10) / 10));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(0.3, Math.round((prev - 0.1) * 10) / 10));
  }, []);

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.05 : -0.05;
        setScale((prev) =>
          Math.max(0.3, Math.min(2, Math.round((prev + delta) * 20) / 20))
        );
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Empty state
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[var(--border-subtle)] rounded-lg">
        <EmptyOrgIllustration />
        <Text size="sm" className="font-semibold text-[var(--text-secondary)] mb-1">
          No members to display
        </Text>
        <Text size="xs" variant="muted">
          Add members to your organization to see the chart here.
        </Text>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-auto custom-scrollbar rounded-lg bg-[var(--bg-subtle)]/30"
      style={{ minHeight: 300, maxHeight: 'calc(100vh - 280px)' }}
    >
      {/* Content with zoom transform */}
      <div
        ref={contentRef}
        className="flex items-start justify-center py-8 px-6 min-w-min"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
        }}
      >
        {treeRoots ? (
          /* True Hierarchy Tree */
          <div className="flex flex-col items-center gap-0">
            {treeRoots.map((root) => (
              <TreeNode
                key={root.userId}
                node={root}
                onClick={onSelectMember}
                searchQuery={searchQuery}
                depth={0}
                teamCount={(memberTeamsMap?.[root.userId] || []).length}
              />
            ))}
          </div>
        ) : (
          /* Fallback: Tiered Layout */
          <TieredLayout
            groupedMembers={groupedMembers}
            onSelectMember={onSelectMember}
            searchQuery={searchQuery}
            memberTeamsMap={memberTeamsMap}
          />
        )}
      </div>

      {/* Zoom Controls */}
      <ZoomControls
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitToScreen={handleFitToScreen}
        containerRef={containerRef}
      />
    </div>
  );
}

export default DirectoryOrgChart;
