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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl">
      <div>
        <Heading level={2} className="tracking-tight text-[20px] font-semibold">Security Settings</Heading>
        <Text variant="muted" className="mt-1 text-[13px]">
          Update your password to keep your account secure.
        </Text>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-3">
            <Heading level={4} className="text-[14px]">Password</Heading>
            <Card>
              <CardContent className="p-0 px-6">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  rules={{ required: 'Current password is required' }}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <SettingsRow label="Current Password" description="Enter your existing password">
                        <FormControl>
                          <Input type="password" placeholder="Enter current password" className="w-full max-w-[300px]" {...field} />
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
                      <SettingsRow label="New Password" description="Must be at least 8 characters">
                        <FormControl>
                          <Input type="password" placeholder="Enter new password" className="w-full max-w-[300px]" {...field} />
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
                      <SettingsRow label="Confirm Password" description="Re-enter your new password to confirm">
                        <FormControl>
                          <Input type="password" placeholder="Confirm new password" className="w-full max-w-[300px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </SettingsRow>
                    </FormItem>
                  )}
                />
              </CardContent>
              <div className="border-t border-[var(--border-subtle)] px-6 py-4 flex justify-end bg-[var(--bg-subtle)] rounded-b-[var(--radius-lg)]">
                <Button 
                  type="submit" 
                  isLoading={changePassword.isPending}
                >
                  Update Password
                </Button>
              </div>
            </Card>
          </div>
        </form>
      </Form>

      <div className="space-y-3">
        <Heading level={4} className="text-[14px]">Two-Factor Authentication</Heading>
        <Card>
          <CardContent className="p-0 px-6">
            <SettingsRow label="Enable 2FA" description="Add an extra layer of security to your account">
              <Switch defaultChecked={false} />
            </SettingsRow>
          </CardContent>
        </Card>
      </div>

    </motion.div>
  )
}
