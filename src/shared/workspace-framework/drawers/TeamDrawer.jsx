import React from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'
import { Users, ExternalLink, Calendar, Shield, FolderKanban } from '@/shared/ui/Icons'

/**
 * TeamDrawer
 * ─────────────────────────────────────────────────────────
 * Quick-view contextual drawer for team summaries.
 * Shown when clicking a team badge or reference
 * anywhere in the workspace.
 *
 * Expects `data` payload:
 *   { id, name, description?, memberCount?, members?, projectCount?, createdAt? }
 *
 * WEF Boundary: Pure UI. No API calls. All data injected via props.
 */
export function TeamDrawer({ data, onClose }) {
  if (!data) return null

  const {
    id, name, description,
    memberCount, members = [],
    projectCount = 0, createdAt
  } = data

  const displayMemberCount = memberCount ?? members.length ?? 0
  const visibleMembers = members.slice(0, 8)
  const remainingCount = displayMemberCount - visibleMembers.length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 pb-5 border-b border-[var(--border-subtle)]">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--accent-soft)] border-2 border-[var(--accent-border)] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-[var(--accent)]" />
          </div>
          <div className="min-w-0 flex-1">
            <Heading level={3} className="text-lg font-semibold truncate">
              {name}
            </Heading>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="outline" className="text-[10px]">
                {displayMemberCount} member{displayMemberCount !== 1 ? 's' : ''}
              </Badge>
              {projectCount > 0 && (
                <Badge variant="outline" className="text-[10px]">
                  {projectCount} project{projectCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        {description && (
          <div className="space-y-2">
            <Text variant="muted" className="text-[11px] font-medium uppercase tracking-wider">About</Text>
            <Text className="text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap line-clamp-4">
              {description}
            </Text>
          </div>
        )}

        {/* Members */}
        {visibleMembers.length > 0 && (
          <div className="space-y-3">
            <Text variant="muted" className="text-[11px] font-medium uppercase tracking-wider">Members</Text>
            <div className="space-y-2">
              {visibleMembers.map((member, i) => (
                <div key={member.id || member.userId || i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-[var(--accent)]">
                      {(member.username || member.name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text className="text-sm font-medium truncate">{member.username || member.name}</Text>
                    {member.role && (
                      <Text variant="muted" size="xs" className="truncate">{member.role}</Text>
                    )}
                  </div>
                </div>
              ))}
              {remainingCount > 0 && (
                <Text variant="muted" size="xs" className="text-center py-1">
                  + {remainingCount} more member{remainingCount !== 1 ? 's' : ''}
                </Text>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-3">
          <Text variant="muted" className="text-[11px] font-medium uppercase tracking-wider">Info</Text>
          {createdAt && (
            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <Calendar className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              <span>Created {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        <Button variant="outline" className="w-full gap-2 text-xs" onClick={onClose}>
          <ExternalLink className="w-3.5 h-3.5" />
          Enter team portal
        </Button>
      </div>
    </div>
  )
}
