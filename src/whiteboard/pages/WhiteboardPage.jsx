import { Button } from '@/shared/ui/Button';

import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from '@/shared/ui/Icons'
import { WhiteboardCanvas } from '@/whiteboard'
import { useWhiteboards, useOrgWhiteboards, useTeamWhiteboards } from '@/whiteboard'
import { Text } from '@/shared/ui/Typography'

/**
 * Full-screen whiteboard for both scopes: crews
 * (/app/crews/:crewId/whiteboards/:boardId) and organizations
 * (/app/organizations/:orgId/whiteboards/:boardId).
 */
export function WhiteboardPage() {
  const { crewId, orgId, teamId, boardId } = useParams()
  const navigate = useNavigate()

  const crewQuery = useWhiteboards(crewId)
  const orgQuery = useOrgWhiteboards(teamId ? undefined : orgId)
  const teamQuery = useTeamWhiteboards(orgId, teamId)

  const boards = crewId ? (crewQuery.data || []) : teamId ? (teamQuery.data || []) : (orgQuery.data || [])
  const board = boards.find(b => String(b.id) === String(boardId))
  const backTo = crewId
    ? `/app/crews/${crewId}`
    : teamId
      ? `/app/organizations/${orgId}/teams/${teamId}`
      : `/app/organizations/${orgId}`

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--bg-base)] z-50">
      <div className="flex items-center gap-3 p-3 border-b border-[var(--color-border-subtle)] bg-[var(--bg-base)] shrink-0">
        <Button variant="ghost" onClick={() => navigate(backTo)}>
          <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
        </Button>
        <Text className="flex-1 min-w-0 truncate font-medium text-[var(--text-primary)]">{board?.title || 'Whiteboard'}</Text>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <WhiteboardCanvas
          crewId={crewId}
          orgId={teamId ? orgId : orgId}
          teamId={teamId}
          boardId={boardId}
          initialSnapshot={board?.snapshotDataUrl}
        />
      </div>
    </div>
  )
}
