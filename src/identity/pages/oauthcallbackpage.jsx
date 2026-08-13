import React, { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth, authAPI } from '@/identity'
import { setAccessToken, setRefreshToken } from '../features/authentication/lib/tokens'
import { Spinner } from '@/shared/ui/Spinner'
import { Text } from '@/shared/ui/Typography'

/**
 * Landing page for the OAuth redirect.
 *
 * Success: backend redirects to /oauth/callback#access_token=...&refresh_token=...
 * (fragment, so tokens never hit server logs / Referer). Failure: /oauth/callback?error=...
 *
 * Tokens are stripped from the URL immediately, the session is validated against the
 * backend, and the user is routed into the app — the same path as a normal login.
 */
export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const fragment = new URLSearchParams(location.hash.replace(/^#/, ''))
    const error = new URLSearchParams(location.search).get('error')
    const accessToken = fragment.get('access_token')
    const refreshToken = fragment.get('refresh_token')

    // Never leave credentials in the address bar.
    window.history.replaceState({}, document.title, '/oauth/callback')

    const fail = (description) => {
      toast.error('Sign in failed', { description })
      navigate('/login', { replace: true })
    }

    if (error) {
      fail(error === 'access_denied'
        ? 'You cancelled the sign-in. Please try again.'
        : 'The provider returned an error. Please try again.')
      return
    }
    if (!accessToken || !refreshToken) {
      fail('The sign-in response was incomplete. Please try again.')
      return
    }

    ;(async () => {
      try {
        setAccessToken(accessToken)
        setRefreshToken(refreshToken)
        // Validates the tokens against the backend and loads the user profile.
        const user = await authAPI.getCurrentUser()
        login(user)
        toast.success('Signed in', {
          description: user?.fullName ? `Welcome, ${user.fullName.split(' ')[0]}!` : 'Welcome back!',
        })
        navigate('/app', { replace: true })
      } catch (err) {
        fail('Could not validate your session. Please try again.')
      }
    })()
  }, [location, navigate, login])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
      <div className="flex flex-col items-center space-y-3">
        <Spinner size="lg" />
        <Text variant="muted" className="text-[13px]">Completing sign in…</Text>
      </div>
    </div>
  )
}
