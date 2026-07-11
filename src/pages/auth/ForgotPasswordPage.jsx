import React from 'react'
import { Link } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { ForgotPasswordForm } from '@/widgets/auth/ForgotPasswordForm'
import { ArrowLeft } from 'lucide-react'

export function ForgotPasswordPage() {
  return (
    <>
      <div className="flex flex-col space-y-1.5 mb-8">
        <Heading level={3} className="tracking-tight text-[22px]">Reset Password</Heading>
        <Text variant="muted" className="text-[13px]">Enter your email and we'll send you a link to reset your password.</Text>
      </div>
      
      <ForgotPasswordForm />

      <div className="mt-8 flex justify-center">
        <Link 
          to="/login" 
          className="flex items-center text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-[var(--duration-base)]"
        >
          <ArrowLeft className="mr-2 h-3.5 w-3.5" />
          Back to login
        </Link>
      </div>
    </>
  )
}
