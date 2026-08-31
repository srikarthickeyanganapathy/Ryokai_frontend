import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Mail } from '@/shared/ui/Icons'
import { authAPI, useAuth } from '@/identity'
import { toast } from 'sonner'

const PENDING_EMAIL_KEY = 'pending_verify_email'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('idle') // idle, loading, success, invalid, expired, already
  const { user } = useAuth()
  const [isResending, setIsResending] = useState(false)

  // Resolve the email to resend to: query param -> logged-in user -> stored pending email.
  const email = searchParams.get('email') || user?.email || localStorage.getItem(PENDING_EMAIL_KEY) || ''

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

  useEffect(() => {
    if (status === 'success' || status === 'already') {
      localStorage.removeItem(PENDING_EMAIL_KEY)
    }
  }, [status])

  const handleResend = async () => {
    if (!email) {
      toast.error('Please sign in or provide your email to resend the verification email.')
      return
    }

    setIsResending(true)
    try {
      const res = await authAPI.resendVerification(email)
      toast.success(res.message || 'Verification email sent.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-[var(--accent-soft)] flex items-center justify-center mb-2">
        <Mail className="w-8 h-8 text-[var(--accent)]" />
      </div>

      <Heading level={3} className="tracking-tight text-[22px]">
        {status === 'loading' ? 'Verifying...' :
         status === 'success' ? 'Email verified!' :
         status === 'already' ? 'Already verified' :
         status === 'expired' ? 'Link expired' :
         status === 'invalid' ? 'Invalid link' :
         'Check your email'}
      </Heading>

      <Text variant="muted" className="max-w-xs text-[13px]">
        {status === 'success' || status === 'already'
          ? 'Your email address has been verified. You can now sign in.'
          : status === 'expired'
          ? 'This verification link has expired. Please request a new one.'
          : status === 'invalid'
          ? 'This verification link is invalid or corrupted. Please request a new one.'
          : email
          ? `We've sent a verification link to ${email}. Please verify to continue.`
          : "We've sent a verification link to your email address. Please verify to continue."}
      </Text>

      {(status === 'success' || status === 'already') && (
        <div className="glass-panel rounded-[var(--radius-lg)] p-4 w-full">
          <Text variant="muted" className="text-[13px] flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
            Verified -- you're all set
          </Text>
        </div>
      )}

      {status !== 'success' && status !== 'already' && (
        <div className="w-full pt-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleResend}
            isLoading={isResending}
            disabled={status === 'loading'}
          >
            Resend Verification Email
          </Button>
        </div>
      )}

      <p className="mt-8 px-8 text-center text-[13px] text-[var(--text-secondary)]">
        {status === 'success' || status === 'already' ? 'Ready to continue?' : 'Already verified?'}{' '}
        <Link
          to="/login"
          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
        >
          Sign In
        </Link>
      </p>
    </div>
  )
}
