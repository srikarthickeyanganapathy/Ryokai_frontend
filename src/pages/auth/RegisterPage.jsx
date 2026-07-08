import React from 'react'
import { Link } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { RegisterForm } from '@/widgets/auth/RegisterForm'

export function RegisterPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center mb-8">
        <Heading level={3} className="tracking-tight">Create an account</Heading>
        <Text variant="muted">Enter your details below to create your account</Text>
      </div>
      
      <RegisterForm />

      <p className="mt-8 px-8 text-center text-sm text-[var(--text-secondary)]">
        By clicking continue, you agree to our{' '}
        <Link to="/terms" className="hover:text-[var(--accent-cyan)] hover:underline">Terms of Service</Link>
        {' '}and{' '}
        <Link to="/privacy" className="hover:text-[var(--accent-cyan)] hover:underline">Privacy Policy</Link>.
      </p>

      <p className="mt-4 px-8 text-center text-sm text-[var(--text-secondary)]">
        Already have an account?{' '}
        <Link 
          to="/login" 
          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-cyan)] hover:underline"
        >
          Sign In
        </Link>
      </p>
    </>
  )
}
