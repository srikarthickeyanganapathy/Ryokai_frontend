import React from 'react'
import { Card, CardContent } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Icons } from '@/shared/ui/Icons'
import { motion } from 'framer-motion'
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

function getDeviceIcon(deviceInfo = '') {
  const lower = deviceInfo.toLowerCase()
  if (lower.includes('mobile') || lower.includes('iphone') || lower.includes('android')) return Icons.smartphone || Icons.laptop
  if (lower.includes('mac') || lower.includes('windows') || lower.includes('linux')) return Icons.laptop || Icons.monitor
  return Icons.monitor || Icons.laptop
}

export function SessionsPage() {
  const { data: sessions, isLoading, isError, error } = useSessions()
  const revokeSession = useRevokeSession()

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl pb-10">
      
      {/* 🏷️ SESSIONS MODE HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
              SESSIONS Mode
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">• Active Devices & Revocation</span>
          </div>
          <Heading level={1} className="tracking-tight text-[22px] font-bold text-[var(--text-primary)] mb-0">
            Active Device Sessions
          </Heading>
          <Text variant="muted" className="text-xs mt-0.5">
            Monitor and manage active login sessions across all your laptops, phones, and browsers.
          </Text>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-[var(--color-border-subtle)] rounded-2xl p-4">
              <CardContent className="p-0 flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48 rounded-md" />
                  <Skeleton className="h-3 w-32 rounded-md" />
                </div>
                <Skeleton className="h-8 w-20 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isError && (
        <Card className="border-rose-500/20 bg-rose-500/5 rounded-2xl">
          <CardContent className="p-6 text-center">
            <Text className="text-xs text-rose-500 font-semibold">
              Failed to load sessions: {error?.message || 'Unknown error'}
            </Text>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && sessions?.length === 0 && (
        <Card className="border-[var(--color-border-subtle)] rounded-2xl">
          <CardContent className="p-12 text-center">
            <Icons.laptop className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
            <Heading level={4} className="text-xs font-semibold text-[var(--text-secondary)]">No active sessions found.</Heading>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && sessions?.length > 0 && (
        <div className="space-y-3">
          {sessions.map((session, index) => {
            const DeviceIcon = getDeviceIcon(session.deviceInfo)
            return (
              <motion.div
                key={session.tokenId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-[var(--color-border-subtle)] hover:border-[var(--accent-soft)] rounded-2xl transition-all duration-200 shadow-sm overflow-hidden">
                  <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] flex items-center justify-center shrink-0 text-[var(--text-primary)]">
                        <DeviceIcon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Heading level={4} className="text-sm font-bold text-[var(--text-primary)] truncate mb-0">
                            {session.deviceInfo || 'Unknown Device'}
                          </Heading>
                          {session.current ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Current Device
                            </span>
                          ) : (
                            <Badge variant="outline" size="sm" className="text-[10px] font-mono">
                              Active Session
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                          <span>Token: <strong className="font-mono text-[11px] font-normal">{maskTokenId(session.tokenId)}</strong></span>
                          <span>Started: <strong>{formatDate(session.createdAt)}</strong></span>
                          <span>Expires: <strong>{formatDate(session.expiresAt)}</strong></span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant={session.current ? "outline" : "danger"}
                      size="sm"
                      disabled={session.current}
                      isLoading={revokeSession.isPending && revokeSession.variables === session.tokenId}
                      onClick={() => revokeSession.mutate(session.tokenId)}
                      className="rounded-xl shrink-0"
                    >
                      {session.current ? 'This Device' : 'Revoke'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
