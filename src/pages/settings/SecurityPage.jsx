import React from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Card, CardContent } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { Input } from '@/shared/ui/Input'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/shared/forms/Form'
import { SettingsRow } from '@/shared/ui/SettingsRow'
import { Switch } from '@/shared/ui/Switch'
import { useChangePassword } from '@/features/auth/hooks/useUser'

export function SecurityPage() {
  const changePassword = useChangePassword()

  const form = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const newPasswordValue = form.watch('newPassword')

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-gray-400' }
    let score = 0
    if (pwd.length >= 8) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500' }
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' }
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-500' }
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' }
  }

  const strength = getPasswordStrength(newPasswordValue)

  const onSubmit = (data) => {
    changePassword.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    }, {
      onSuccess: () => {
        form.reset()
      }
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl pb-10">
      
      {/* 🏷️ SECURITY MODE HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
              SECURITY Mode
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">• Authentication & Safety</span>
          </div>
          <Heading level={1} className="tracking-tight text-[22px] font-bold text-[var(--text-primary)] mb-0">
            Security Settings
          </Heading>
          <Text variant="muted" className="text-xs mt-0.5">
            Update password credentials, view password strength, and configure multi-factor authentication.
          </Text>
        </div>
      </div>

      {/* 🔑 PASSWORD FORM */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <Heading level={4} className="text-sm font-bold text-[var(--text-primary)]">Password & Credentials</Heading>
            <Card className="border-[var(--color-border-subtle)] rounded-2xl overflow-hidden shadow-sm">
              <CardContent className="p-0 px-6 divide-y divide-[var(--color-border-subtle)]">
                
                <FormField
                  control={form.control}
                  name="currentPassword"
                  rules={{ required: 'Current password is required' }}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <SettingsRow label="Current Password" description="Enter your existing account password">
                        <FormControl>
                          <Input type="password" placeholder="••••••••••••" className="w-full max-w-[320px] text-xs h-9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </SettingsRow>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  rules={{ 
                    required: 'New password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  }}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <SettingsRow 
                        label="New Password" 
                        description={
                          <div className="space-y-1 mt-1">
                            <span>Must be at least 8 characters with numbers & symbols</span>
                            {newPasswordValue && (
                              <div className="flex items-center gap-2 pt-1">
                                <div className="h-1.5 w-24 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                                  <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.score}%` }} />
                                </div>
                                <span className="text-[10px] font-semibold text-[var(--text-secondary)]">{strength.label}</span>
                              </div>
                            )}
                          </div>
                        }
                      >
                        <FormControl>
                          <Input type="password" placeholder="Enter new password" className="w-full max-w-[320px] text-xs h-9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </SettingsRow>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  rules={{ 
                    required: 'Please confirm your new password',
                    validate: value => value === form.getValues('newPassword') || 'Passwords do not match'
                  }}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <SettingsRow label="Confirm Password" description="Re-type your new password to confirm">
                        <FormControl>
                          <Input type="password" placeholder="Confirm new password" className="w-full max-w-[320px] text-xs h-9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </SettingsRow>
                    </FormItem>
                  )}
                />
              </CardContent>

              <div className="border-t border-[var(--color-border-subtle)] px-6 py-3.5 flex justify-end bg-[var(--bg-subtle)]">
                <Button 
                  type="submit" 
                  size="sm"
                  isLoading={changePassword.isPending}
                  className="rounded-xl px-4"
                >
                  Update Password
                </Button>
              </div>
            </Card>
          </div>
        </form>
      </Form>

      {/* 🛡️ TWO-FACTOR AUTHENTICATION */}
      <div className="space-y-3">
        <Heading level={4} className="text-sm font-bold text-[var(--text-primary)]">Two-Factor Authentication (2FA)</Heading>
        <Card className="border-[var(--color-border-subtle)] rounded-2xl overflow-hidden shadow-sm">
          <CardContent className="p-0 px-6">
            <SettingsRow label="Authenticator App (TOTP)" description="Secure your account using Google Authenticator or 1Password">
              <Switch defaultChecked={false} />
            </SettingsRow>
          </CardContent>
        </Card>
      </div>

    </motion.div>
  )
}
