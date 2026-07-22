import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { useDiscoverCrews, useJoinPublicCrew } from '@/features/crews/hooks/useCrews'

export function CrewDiscoverPage() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')

  const { data: allCrews = [], isLoading } = useDiscoverCrews()
  const joinMutation = useJoinPublicCrew()

  const crews = useMemo(() => {
    if (!Array.isArray(allCrews)) return []
    if (!keyword.trim()) return allCrews
    const q = keyword.toLowerCase().trim()
    return allCrews.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    )
  }, [allCrews, keyword])

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Heading level={2} className="mb-6">Discover Crews</Heading>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <Input
          placeholder="Search public crews…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <Text variant="muted">Loading crews…</Text>
      ) : crews.length === 0 ? (
        <div className="text-center p-12 rounded-lg border border-dashed border-[var(--color-border-default)]">
          <Users className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-3 opacity-50" />
          <Text variant="muted">No crews found.</Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {crews.map(crew => {
            const isMember = !!crew.myRole
            const isFull = (crew.memberCount ?? 0) >= crew.memberCap
            const isInviteOnly = crew.visibility === 'INVITE_ONLY'
            return (
              <div key={crew.id} className="p-5 rounded-[var(--radius-lg)] glass-panel border border-[var(--color-border-subtle)] flex flex-col gap-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Heading level={4} className="mb-0">{crew.name}</Heading>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--color-border-subtle)]">
                      {crew.visibility?.replace('_', ' ') || 'PUBLIC'}
                    </span>
                  </div>
                  <Text size="sm" variant="muted" className="line-clamp-2">{crew.description || 'No description provided.'}</Text>
                </div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--color-border-subtle)]">
                  <Text size="sm" variant="muted">
                    {crew.memberCount ?? 0}/{crew.memberCap} members
                  </Text>
                  {isMember ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/app/crews/${crew.id}`)}
                      className="border-[var(--success)] text-[var(--success)] hover:bg-[var(--success-soft)] font-medium"
                    >
                      Joined
                    </Button>
                  ) : isInviteOnly ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="opacity-60 cursor-not-allowed"
                    >
                      Invite Only
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => joinMutation.mutate(crew.id)}
                      disabled={joinMutation.isPending || isFull}
                    >
                      {isFull ? 'Full' : 'Join'}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
