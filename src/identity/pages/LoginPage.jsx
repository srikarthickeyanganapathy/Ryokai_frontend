import React from 'react'
import { Link } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { LoginForm } from '@/identity'

export function LoginPage() {
  return (
    <>
      <div className="flex flex-col space-y-1.5 mb-7">
        <Heading level={3} className="tracking-tight text-[22px]">Welcome back</Heading>
        <Text variant="muted" className="text-[13px]">Sign in to your Ryokai workspace</Text>
      </div>

      <LoginForm />

      <p className="mt-7 text-center text-[13px] text-[var(--text-secondary)]">
        Don't have an account?{' '}
        <Link 
          to="/register" 
          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors font-semibold"
        >
          Create account
        </Link>
      </p>
    </>
  )
}