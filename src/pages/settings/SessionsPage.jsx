import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useSessions, useRevokeSession } from '@/features/auth/hooks/useUser'

function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function maskTokenId(tokenId) {
  if (!tokenId) return '—'
  return tokenId.slice(0, 8) + '…'
}

export function SessionsPage() {
  const { data: sessions, isLoading, isError, error } = useSessions()
  const revokeSession = useRevokeSession()

  return (
    <div className="space-y-6">
      <div>
        <Heading level={2} className="tracking-tight">Active Sessions</Heading>
        <Text variant="muted" className="mt-1">
          Manage your active login sessions across devices. Revoke any sessions you don't recognize.
        </Text>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="p-6 text-center">
            <Text variant="muted">
              Failed to load sessions: {error?.message || 'Unknown error'}
            </Text>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && sessions?.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Text variant="muted">No active sessions found.</Text>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && sessions?.length > 0 && (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card key={session.tokenId}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Text className="font-medium truncate">
                        {session.deviceInfo}
                      </Text>
                      {session.current && (
                        <Badge variant="success" size="sm">Current</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <Text variant="muted" className="text-xs">
                        ID: {maskTokenId(session.tokenId)}
                      </Text>
                      <Text variant="muted" className="text-xs">
                        Created: {formatDate(session.createdAt)}
                      </Text>
                      <Text variant="muted" className="text-xs">
                        Expires: {formatDate(session.expiresAt)}
                      </Text>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={session.current}
                    isLoading={revokeSession.isPending && revokeSession.variables === session.tokenId}
                    onClick={() => revokeSession.mutate(session.tokenId)}
                  >
                    Revoke
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
