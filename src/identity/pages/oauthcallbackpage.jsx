import React, { useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth, authAPI } from '@/identity'
import { setAccessToken, setRefreshToken } from '../features/authentication/lib/tokens'
import { Spinner } from '@/shared/ui/Spinner'
import { Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { RefreshCw, ExternalLink } from 'lucide-react'

/**
 * Landing page for the OAuth redirect.
 *
 * Success: backend redirects to /oauth/callback#access_token=...&refresh_token=***
 * (fragment, so tokens never hit server logs / Referer). Failure: /oauth/callback?error=...
 *
 * OAuth state is single-use: re-approving the SAME GitHub authorization page (Back
 * button, stale tab) replays a consumed state and the backend rejects it with
 * "Invalid or expired OAuth state". That is the most common failure here, so we
 * surface a dedicated recovery screen instead of a dead-end error toast.
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
      // Single-use state replayed or expired — the common GitHub failure.
      if (error === 'oauth_state_expired' || error === 'authentication_failed') {
        setOauthStateError(true)
        return
      }
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

  const [stateError, setOauthStateError] = React.useState(false)

  if (stateError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-6">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
            <RefreshCw className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.5} />
          </div>
          <h1 className="text-[16px] font-bold tracking-tight text-[var(--text-primary)]">
            That sign-in link was already used
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
            GitHub authorization links work only once. This usually happens when you
            re-approved the same page (Back button or an old tab). Close any old
            GitHub authorization tabs, then try signing in again.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button asChild variant="primary" className="h-10 w-full">
              <Link to="/login">
                <RefreshCw className="mr-1.5 h-4 w-4" strokeWidth={1.5} />
                Try signing in again
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="h-9 w-full text-[12px]">
              <a href="https://github.com/settings/applications" target="_blank" rel="noreferrer">
                Review GitHub authorizations
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
              </a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
      <div className="flex flex-col items-center space-y-3">
        <Spinner size="lg" />
        <Text variant="muted" className="text-[13px]">Completing sign in…</Text>
      </div>
    </div>
  )
}
