import React from 'react'
import { Link } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { ResetPasswordForm } from '@/widgets/auth/ResetPasswordForm'

export function ResetPasswordPage() {
  return (
    <>
      <div className="flex flex-col space-y-1.5 mb-8">
        <Heading level={3} className="tracking-tight text-[22px]">Create new password</Heading>
        <Text variant="muted" className="text-[13px]">Your new password must be different from previous used passwords.</Text>
      </div>
      
      <ResetPasswordForm />

      <p className="mt-8 px-8 text-center text-[13px] text-[var(--text-secondary)]">
        Return to{' '}
        <Link 
          to="/login" 
          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
        >
          Sign In
        </Link>
      </p>
    </>
  )
}
