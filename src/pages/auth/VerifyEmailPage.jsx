import React from 'react'
import { Link } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Mail } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { authAPI } from '@/features/auth/api/auth.api'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('idle') // idle, loading, success, invalid, expired, already
  const { user } = useAuth()
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (!token) return

    const verify = async () => {
      setStatus('loading')
      try {
        const res = await authAPI.verifyEmail(token)
        if (res.status === 'VERIFIED') setStatus('success')
        else if (res.status === 'ALREADY_VERIFIED') setStatus('already')
        else if (res.status === 'EXPIRED') setStatus('expired')
        else setStatus('invalid')
      } catch (err) {
        setStatus('invalid')
      }
    }
    verify()
  }, [token])

  const handleResend = async () => {
    // If we have a logged in user, use their email. Otherwise we might prompt for it, 
    // but typically they are redirected here after registration so user is present.
    if (!user?.email) {
      toast.error('Please log in to resend the verification email.')
      return
    }

    setIsResending(true)
    try {
      const res = await authAPI.resendVerification(user.email)
      toast.success(res.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-[var(--accent-cyan)]/10 flex items-center justify-center mb-2">
        <Mail className="w-8 h-8 text-[var(--accent-cyan)]" />
      </div>
      
      <Heading level={3} className="tracking-tight">
        {status === 'loading' ? 'Verifying...' : 
         status === 'success' ? 'Email verified!' : 
         status === 'already' ? 'Already verified' : 
         status === 'expired' ? 'Link expired' : 
         status === 'invalid' ? 'Invalid link' : 
         'Check your email'}
      </Heading>
      
      <Text variant="muted" className="max-w-xs">
        {status === 'success' || status === 'already' 
          ? 'Your email address has been successfully verified. You can now access all features.' 
          : status === 'expired' 
          ? 'This verification link has expired. Please request a new one.' 
          : status === 'invalid'
          ? 'This verification link is invalid or corrupted. Please request a new one.'
          : 'We\'ve sent a verification link to your email address. Please verify to continue.'}
      </Text>

      {status !== 'success' && status !== 'already' && (
        <div className="w-full pt-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleResend}
            isLoading={isResending}
            disabled={status === 'loading'}
          >
            Resend Verification Email
          </Button>
        </div>
      )}

      <p className="mt-8 px-8 text-center text-sm text-[var(--text-secondary)]">
        Return to{' '}
        <Link 
          to="/app" 
          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-cyan)] hover:underline"
        >
          Dashboard
        </Link>
      </p>
    </div>
  )
}
