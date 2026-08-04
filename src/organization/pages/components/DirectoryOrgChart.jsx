import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';
import { ChevronDown, Users } from 'lucide-react';

const PRIORITY_LABELS = {
  0: 'Administrators',
  1: 'Directors',
  2: 'Managers',
  3: 'Members',
};

const getPriorityLabel = (priority) => PRIORITY_LABELS[priority] || `Tier ${priority}`;

export function DirectoryOrgChart({ members, onSelectMember }) {
  const [expandedTiers, setExpandedTiers] = useState({});

  // Group members by rolePriority
  const groupedMembers = useMemo(() => {
    const groups = {};
    members.forEach((member) => {
      const priority = member.rolePriority ?? 999;
      if (!groups[priority]) groups[priority] = [];
      groups[priority].push(member);
    });
    
    // Sort groups by priority
    return Object.keys(groups)
      .sort((a, b) => Number(a) - Number(b))
      .map(key => ({ priority: Number(key), members: groups[key] }));
  }, [members]);

  if (groupedMembers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[var(--border-subtle)] rounded-xl">
        <Users className="w-8 h-8 text-[var(--text-muted)] mb-3" />
        <Text variant="muted">No members to display in organization chart.</Text>
      </div>
    );
  }

  const toggleTier = (priority) => {
    setExpandedTiers(prev => ({ ...prev, [priority]: !prev[priority] }));
  };

  return (
    <div className="flex flex-col items-center w-full overflow-x-auto pb-6 custom-scrollbar">
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
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                {group.members.length} {group.members.length === 1 ? 'person' : 'people'}
              </span>
            </div>

            {/* Nodes Row */}
            <div className="flex justify-center gap-4 flex-wrap w-full mb-4">
              {visibleMembers.map((member) => (
                <OrgNode 
                  key={member.userId} 
                  member={member} 
                  onClick={() => onSelectMember(member)}
                />
              ))}
              
              {/* Expand/Collapse Pill */}
              {group.members.length > 6 && (
                <button
                  onClick={() => toggleTier(group.priority)}
                  className="flex flex-col items-center justify-center w-[140px] h-[140px] rounded-xl border border-dashed border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-subtle)] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mb-2 group-hover:bg-[var(--accent-soft)] group-hover:border-[var(--accent-border)] transition-colors">
                    <ChevronDown className={cn("w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-transform", isExpanded && "rotate-180")} />
                  </div>
                  <Text size="xs" variant="muted" className="font-medium">
                    {isExpanded ? "Show less" : `+${hiddenCount} more`}
                  </Text>
                </button>
              )}
            </div>

            {/* Connector Line to Next Tier */}
            {groupIdx < groupedMembers.length - 1 && (
              <div className="relative flex justify-center w-full mb-4">
                {/* Vertical line down */}
                <div className="absolute h-6 w-px bg-[var(--border-subtle)] top-0 left-1/2 -translate-x-1/2" />
                {/* Horizontal line (simulated with border) */}
                <div className="w-2/3 border-t border-[var(--border-subtle)] mt-6" />
                {/* Vertical line up to next tier */}
                <div className="absolute h-6 w-px bg-[var(--border-subtle)] bottom-[-1.5rem] left-1/2 -translate-x-1/2" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrgNode({ member, onClick }) {
  const isSuspended = member.status === 'SUSPENDED';
  const isAdmin = member.rolePriority === 0;
  const isDirector = member.rolePriority === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="relative flex flex-col items-center w-[140px] cursor-pointer group"
    >
      {/* Connector node dot */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--border-subtle)] group-hover:bg-[var(--accent)] transition-colors" />

      <div className={cn(
        "w-16 h-16 rounded-full border-2 flex items-center justify-center text-xl font-bold mb-2 transition-all group-hover:scale-105 group-hover:shadow-md",
        isAdmin ? "bg-[var(--danger-soft)] border-[var(--danger)] text-[var(--danger)]" :
        isDirector ? "bg-[var(--warning-soft)] border-[var(--warning)] text-[var(--warning)]" :
        "bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]"
      )}>
        {member.username?.charAt(0).toUpperCase() || '?'}
      </div>
      
      <Text className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors text-center truncate w-full">
        {member.username}
      </Text>
      
      <Badge 
        variant={isAdmin ? 'danger' : isDirector ? 'warning' : 'outline'} 
        className="mt-1 text-[9px] uppercase tracking-wider px-1.5 py-0.5"
      >
        {member.orgRole}
      </Badge>

      {isSuspended && (
        <div className="absolute -top-2 -right-2 w-3.5 h-3.5 bg-[var(--danger)] border-2 border-[var(--bg-base)] rounded-full" title="Suspended"></div>
      )}
    </motion.div>
  );
}