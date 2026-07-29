import React from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'
import { Mail, Shield, Calendar, ExternalLink } from 'lucide-react'

/**
 * MemberProfileDrawer
 * ─────────────────────────────────────────────────────────
 * Quick-view contextual drawer for a member profile.
 * Shown when clicking a member avatar/name anywhere in the workspace.
 *
 * Expects `data` payload:
 *   { username, orgRole, rolePriority, userId, joinedAt? }
 *
 * WEF Boundary: Pure UI. No API calls. All data injected via props.
 */
export function MemberProfileDrawer({ data, onClose }) {
  if (!data) return null

  const { username, orgRole, rolePriority, userId, joinedAt, email } = data
  const initial = username?.charAt(0).toUpperCase() || '?'

  return (
    <div className="flex flex-col h-full">
      {/* Profile Header */}
      <div className="p-6 pb-5 border-b border-[var(--border-subtle)]">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] border-2 border-[var(--accent-border)] flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-[var(--accent)]">{initial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <Heading level={3} className="text-lg font-semibold truncate">
              {username}
            </Heading>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={
                  rolePriority === 0 ? 'danger' : rolePriority === 1 ? 'warning' : 'outline'
                }
              >
                {orgRole || 'Member'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        <div className="space-y-3">
          <Text variant="muted" className="text-[11px] font-medium uppercase tracking-wider">
            Contact
          </Text>
          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <Mail className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <span className="truncate">{email || `${username}@ryokai.app`}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Text variant="muted" className="text-[11px] font-medium uppercase tracking-wider">
            Role & Access
          </Text>
          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
            <Shield className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <span>Priority Level {rolePriority ?? 'N/A'}</span>
          </div>
          {joinedAt && (
            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <Calendar className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              <span>Joined {new Date(joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* Activity placeholder */}
        <div className="space-y-3">
          <Text variant="muted" className="text-[11px] font-medium uppercase tracking-wider">
            Recent Activity
          </Text>
          <div className="bg-[var(--bg-subtle)] border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6 text-center">
            <Text variant="muted" size="xs">Activity tracking available after next release.</Text>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        <Button variant="outline" className="w-full gap-2 text-xs" onClick={onClose}>
          <ExternalLink className="w-3.5 h-3.5" />
          View full profile
        </Button>
      </div>
    </div>
  )
}
