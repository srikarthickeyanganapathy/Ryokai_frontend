import React from 'react'
import { Link } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { RegisterForm } from '@/widgets/auth/RegisterForm'

export function RegisterPage() {
  return (
    <>
      <div className="flex flex-col space-y-1.5 mb-8">
        <Heading level={1} className="tracking-tight text-[22px]">Create an account</Heading>
        <Text variant="muted" className="text-[13px]">Enter your details below to create your account</Text>
      </div>
      
      <RegisterForm />

      <p className="mt-8 px-8 text-center text-[13px] text-[var(--text-secondary)]">
        By clicking continue, you agree to our{' '}
        <Link to="/terms" className="hover:text-[var(--accent)] hover:underline transition-colors">Terms of Service</Link>
        {' '}and{' '}
        <Link to="/privacy" className="hover:text-[var(--accent)] hover:underline transition-colors">Privacy Policy</Link>.
      </p>

      <p className="mt-4 px-8 text-center text-[13px] text-[var(--text-secondary)]">
        Already have an account?{' '}
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
