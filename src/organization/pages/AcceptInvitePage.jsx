import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAcceptInviteByToken } from '@/organization'
import { Spinner } from '@/shared/ui/Spinner'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Icons } from '@/shared/ui/Icons'

export function AcceptInvitePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const acceptMutation = useAcceptInviteByToken()
  const attemptedRef = useRef(false)

  useEffect(() => {
    if (token && !attemptedRef.current && !acceptMutation.isPending) {
      attemptedRef.current = true
      acceptMutation.mutate(token, {
        onSuccess: () => {
          setTimeout(() => {
            navigate('/app/organizations', { replace: true })
          }, 1500)
        }
      })
    }
  }, [token, acceptMutation, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] p-4">
      <Card className="max-w-md w-full p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto">
          <Icons.users className="w-6 h-6" />
        </div>

        <Heading level={3}>Organization invitation</Heading>

        {acceptMutation.isPending && (
          <div className="space-y-3 py-4">
            <Spinner size="lg" className="mx-auto" />
            <Text variant="muted">Accepting invitation and joining organization...</Text>
          </div>
        )}

        {acceptMutation.isSuccess && (
          <div className="space-y-3 py-4 text-[var(--success)]">
            <Text className="font-medium text-base">You have successfully joined the organization!</Text>
            <Text variant="muted" className="text-sm">Redirecting to organizations workspace...</Text>
          </div>
        )}

        {acceptMutation.isError && (
          <div className="space-y-4 py-4">
            <div className="p-3 bg-[var(--danger-soft)] text-[var(--danger)] rounded-md text-sm">
              {acceptMutation.error?.response?.data?.message || 'Failed to accept invitation. The link may be expired or invalid.'}
            </div>
            <Button variant="primary" onClick={() => navigate('/app/organizations')}>
              Go to workspace
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}