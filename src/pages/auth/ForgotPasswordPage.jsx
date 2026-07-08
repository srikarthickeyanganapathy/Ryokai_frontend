import React from 'react'
import { Link } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { ForgotPasswordForm } from '@/widgets/auth/ForgotPasswordForm'
import { ArrowLeft } from 'lucide-react'

export function ForgotPasswordPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center mb-8">
        <Heading level={3} className="tracking-tight">Reset Password</Heading>
        <Text variant="muted">Enter your email and we'll send you a link to reset your password.</Text>
      </div>
      
      <ForgotPasswordForm />

      <div className="mt-8 flex justify-center">
        <Link 
          to="/login" 
          className="flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>
      </div>
    </>
  )
}
