import { Button } from '@/shared/ui/Button';

import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from '@/shared/ui/Icons'
import { WhiteboardCanvas } from '@/whiteboard'
import { useWhiteboards } from '@/whiteboard'
import { Text } from '@/shared/ui/Typography'

export function WhiteboardPage() {
  const { crewId, boardId } = useParams()
  const navigate = useNavigate()
  const { data: boards = [] } = useWhiteboards(crewId)
  const board = boards.find(b => String(b.id) === boardId)

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--bg-base)] z-50">
      <div className="flex items-center gap-3 p-3 border-b border-[var(--color-border-subtle)] bg-[var(--bg-base)] shrink-0">
        <Button variant="ghost" onClick={() => navigate(`/app/crews/${crewId}`)}>
          <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
        </Button>
        <Text className="font-medium text-[var(--text-primary)]">{board?.title || 'Whiteboard'}</Text>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <WhiteboardCanvas crewId={crewId} boardId={boardId} initialSnapshot={board?.snapshotDataUrl} />
      </div>
    </div>
  )
}
