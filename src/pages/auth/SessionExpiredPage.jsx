import React from 'react'
import { Link } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Clock } from 'lucide-react'

export function SessionExpiredPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-[var(--accent-soft)] flex items-center justify-center mb-2">
        <Clock className="w-8 h-8 text-[var(--accent)]" />
      </div>
      
      <Heading level={3} className="tracking-tight text-[22px]">Session Expired</Heading>
      
      <Text variant="muted" className="max-w-xs text-[13px]">
        Your session has expired due to inactivity. Please sign in again to continue working.
      </Text>

      <div className="w-full pt-4">
        <Button asChild size="lg" className="w-full">
          <Link to="/login">Sign In Again</Link>
        </Button>
      </div>
    </div>
  )
}
