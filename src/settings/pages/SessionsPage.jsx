import React from 'react'
import { InteractiveCard } from '@/shared/ui/InteractiveCard'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Heading } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { motion } from 'framer-motion'
import { useSessions, useRevokeSession } from '@/identity'
import { PageShell, PageHero, PageContent } from '@/shared/ui/PageShell'
import { PageState } from '@/shared/ui/PageState'

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

  const pageState = isLoading ? 'loading' : isError ? 'error' : (!sessions || sessions.length === 0) ? 'empty' : 'ready'

  return (
    <PageShell maxWidth="narrow">
      <PageHero
        eyebrow="Sessions"
        meta="Active Devices & Revocation"
        title="Active Device Sessions"
        subtitle="Monitor and manage active login sessions across all your laptops, phones, and browsers."
      />

      <PageContent>
        <PageState
          state={pageState}
          stateProps={{
            loadingVariant: 'list',
            icon: Icons.laptop,
            title: 'Failed to load sessions',
            description: error?.message || 'Unknown error',
          }}
        >
          <div className="space-y-3">
            {sessions?.map((session, index) => {
              const DeviceIcon = getDeviceIcon(session.deviceInfo)
              return (
                <motion.div
                  key={session.tokenId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 2 }}
                >
                  <InteractiveCard padding={false} className="overflow-hidden">
                    <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                      
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 text-[var(--text-primary)]">
                          <DeviceIcon className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Heading level={4} className="text-sm font-bold text-[var(--text-primary)] truncate mb-0">
                              {session.deviceInfo || 'Unknown Device'}
                            </Heading>
                            {session.current ? (
                              <span className="px-2 py-0.5 rounded-full bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success-border)] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
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

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                      </motion.div>
                    </div>
                  </InteractiveCard>
                </motion.div>
              )
            })}
          </div>
        </PageState>
      </PageContent>
    </PageShell>
  )
}
