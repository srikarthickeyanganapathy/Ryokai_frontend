import React from 'react'
import { Link } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { LoginForm } from '@/widgets/auth/LoginForm'
import { Separator } from '@/shared/ui/Separator'

export function LoginPage() {
  return (
    <>
      <div className="flex flex-col space-y-1.5 mb-8">
        <Heading level={3} className="tracking-tight text-[22px]">Welcome back</Heading>
        <Text variant="muted" className="text-[13px]">Sign in to your Ryokai workspace</Text>
      </div>
      
      <LoginForm />

      { /* OAuth buttons — to be wired up when OAuth providers are configured */ }
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wide">
          <span className="bg-[var(--bg-base)] px-2 text-[var(--text-tertiary)]">
            Or continue with
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="outline" size="lg" className="w-full" disabled>
          <Icons.google className="mr-2 h-4 w-4" />
          Google (coming soon)
        </Button>
        <Button variant="outline" size="lg" className="w-full" disabled>
          <Icons.github className="mr-2 h-4 w-4" />
          GitHub (coming soon)
        </Button>
      </div>

      <p className="mt-8 text-center text-[13px] text-[var(--text-secondary)]">
        Don't have an account?{' '}
        <Link 
          to="/register" 
          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
        >
          Create account
        </Link>
      </p>
    </>
  )
}