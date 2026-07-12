import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardFooter } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/shared/forms/Form'
import { Switch } from '@/shared/ui/Switch'
import { SettingsRow } from '@/shared/ui/SettingsRow'
import { useProfile, useUpdateProfile } from '@/features/auth/hooks/useUser'

export function ProfilePage() {
  const { data: user, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()

  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      bio: ''
    }
  })

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.name || user.fullName || '',
        email: user.email || '',
        bio: user.bio || ''
      })
    }
  }, [user, form])

  const onSubmit = (data) => {
    updateProfile.mutate(data)
  }

  const handleNotificationToggle = (checked) => {
    updateProfile.mutate({ emailNotificationsEnabled: checked })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl">
      <div>
        <Heading level={2} className="tracking-tight text-[20px] font-semibold">Profile Settings</Heading>
        <Text variant="muted" className="mt-1 text-[13px]">
          Manage your public profile and email preferences.
        </Text>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-3">
            <Heading level={4} className="text-[14px]">General</Heading>
            <Card>
              <CardContent className="p-0 px-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  rules={{ required: 'Full name is required', maxLength: { value: 100, message: 'Max 100 characters' } }}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <SettingsRow label="Full Name" description="Your display name across Ryokai">
                        <FormControl>
                          <Input placeholder="Enter your full name" className="w-[300px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </SettingsRow>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  rules={{ 
                    required: 'Email is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                  }}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <SettingsRow label="Email Address" description="The email associated with your account">
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" className="w-[300px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </SettingsRow>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  rules={{ maxLength: { value: 500, message: 'Max 500 characters' } }}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <SettingsRow label="Bio" description="Tell us a little bit about yourself">
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us a little bit about yourself" 
                            className="resize-none h-20 w-[300px]" 
                            {...field} 
                          />
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
                  isLoading={updateProfile.isPending} 
                  disabled={isLoading}
                >
                  Save Changes
                </Button>
              </div>
            </Card>
          </div>
        </form>
      </Form>

      <div className="space-y-3">
        <Heading level={4} className="text-[14px]">Notifications</Heading>
        <Card>
          <CardContent className="p-0 px-6">
            <SettingsRow label="Email Notifications" description="Receive email digests and important alerts">
              <Switch 
                defaultChecked={user?.emailNotificationsEnabled ?? true} 
                onCheckedChange={handleNotificationToggle}
              />
            </SettingsRow>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
