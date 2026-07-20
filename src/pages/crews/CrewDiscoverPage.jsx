import React, { useState, useEffect } from 'react'
import { Search, Users } from 'lucide-react'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { useDiscoverCrews, useJoinPublicCrew } from '@/features/crews/hooks/useCrews'

export function CrewDiscoverPage() {
  const [keyword, setKeyword] = useState('')
  const [debounced, setDebounced] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(keyword)
      setPage(0)
    }, 350)
    return () => clearTimeout(t)
  }, [keyword])

  const { data, isLoading } = useDiscoverCrews({ keyword: debounced, page, size: 12 })
  const joinMutation = useJoinPublicCrew()
  const crews = data?.content ?? []

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
          <Text variant="muted">No public crews found.</Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {crews.map(crew => (
            <div key={crew.id} className="p-5 rounded-[var(--radius-lg)] glass-panel border border-[var(--color-border-subtle)] flex flex-col gap-3">
              <div>
                <Heading level={4} className="mb-1">{crew.name}</Heading>
                <Text size="sm" variant="muted" className="line-clamp-2">{crew.description}</Text>
              </div>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--color-border-subtle)]">
                <Text size="sm" variant="muted">
                  {crew.memberCount ?? 0}/{crew.memberCap} members
                </Text>
                <Button
                  size="sm"
                  onClick={() => joinMutation.mutate(crew.id)}
                  disabled={joinMutation.isPending || (crew.memberCount ?? 0) >= crew.memberCap}
                >
                  {(crew.memberCount ?? 0) >= crew.memberCap ? 'Full' : 'Join'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Text size="sm" variant="muted">Page {page + 1} of {data.totalPages}</Text>
          <Button variant="outline" size="sm" disabled={page + 1 >= data.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
