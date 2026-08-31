import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/forms'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { useLoginMutation, authAPI } from '@/identity'

const loginSchema = z.object({
  // email: z.string().email({ message: 'Please enter a valid email address.' }),
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
})

function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.97 11.97 0 0 0 0 10.76l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  )
}

export function LoginForm() {
  const loginMutation = useLoginMutation()
  const [oauthConfig, setOauthConfig] = useState(null)

  useEffect(() => {
    // Hide OAuth buttons when the backend has no credentials configured for a provider.
    authAPI
      .getOAuthConfig()
      .then(setOauthConfig)
      .catch(() => setOauthConfig({}))
  }, [])

  const startOAuth = (provider) => {
    window.location.href = authAPI.getOAuthStartUrl(provider)
  }

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = (values) => {
    loginMutation.mutate(values)
  }

  const oauthAvailable = oauthConfig && (oauthConfig.google || oauthConfig.github)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" size="lg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <Input type="password" placeholder="********" size="lg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          size="lg"
          className="w-full mt-1" 
          isLoading={loginMutation.isPending}
        >
          Sign In
        </Button>

        {oauthAvailable && (
          <>
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[var(--border-default)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[var(--bg-elevated)] px-2 text-[11px] uppercase tracking-wide text-[var(--text-tertiary)]">
                  or continue with
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {oauthConfig.google && (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => startOAuth('google')}
                >
                  <GoogleIcon className="h-4 w-4" />
                  Google
                </Button>
              )}
              {oauthConfig.github && (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => startOAuth('github')}
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
              )}
            </div>
          </>
        )}
      </form>
    </Form>
  )
}
