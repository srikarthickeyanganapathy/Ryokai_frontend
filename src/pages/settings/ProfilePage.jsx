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
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar'
import { Icons } from '@/shared/ui/Icons'

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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl pb-10">
      
      {/* 🏷️ STICKY MODE HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-bold shadow-xs">
              PROFILE Mode
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">• Personal Identity & Preferences</span>
          </div>
          <Heading level={1} className="tracking-tight text-[22px] font-extrabold text-[var(--text-primary)] mb-0">
            Account Profile
          </Heading>
          <Text variant="muted" className="text-xs mt-0.5">
            Manage your personal credentials, workspace presentation, and alert settings.
          </Text>
        </div>
      </div>

      {/* 👤 HIGH-END HERO PROFILE BANNER CARD */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-3xl overflow-hidden shadow-sm transition-all duration-200 hover:border-[var(--accent-soft)]">
        {/* Banner Graphic Top */}
        <div className="h-24 bg-gradient-to-r from-blue-600/20 via-indigo-500/15 to-purple-600/20 relative border-b border-[var(--color-border-subtle)]">
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-10">
          <div className="relative group shrink-0">
            <Avatar size="xl" className="w-20 h-20 bg-[var(--accent)] text-white font-bold text-2xl shadow-xl ring-4 ring-[var(--bg-elevated)]">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>{(user?.name || user?.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-elevated)] shadow-sm" title="Online" />
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Heading level={2} className="text-lg font-bold text-[var(--text-primary)] truncate mb-0">
                {user?.name || user?.username || 'Ryokai User'}
              </Heading>
              <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--color-border-subtle)] font-mono text-[11px] font-semibold w-fit mx-auto sm:mx-0">
                @{user?.username || 'user'}
              </span>
            </div>

            <p className="text-xs text-[var(--text-muted)] flex items-center justify-center sm:justify-start gap-1.5">
              <Icons.mail className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              <span>{user?.email || 'srikar.kkn123@gmail.com'}</span>
            </p>
          </div>

          <div className="shrink-0 pt-2 sm:pt-0">
            <span className="px-3 py-1.5 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] text-xs font-bold font-mono uppercase tracking-wide flex items-center gap-1.5">
              <Icons.shield className="w-3.5 h-3.5" />
              Active Member
            </span>
          </div>
        </div>

        {user?.bio && (
          <div className="px-6 pb-6 pt-0">
            <div className="p-3.5 bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] rounded-2xl text-xs text-[var(--text-secondary)] italic">
              "{user.bio}"
            </div>
          </div>
        )}
      </div>

      {/* 📝 PROFILE EDIT FORM */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <Heading level={4} className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Icons.user className="w-4 h-4 text-[var(--accent)]" />
              Personal Details
            </Heading>

            <Card className="border-[var(--color-border-subtle)] rounded-3xl overflow-hidden shadow-sm">
              <CardContent className="p-0 px-6 divide-y divide-[var(--color-border-subtle)]">
                
                <FormField
                  control={form.control}
                  name="fullName"
                  rules={{ required: 'Full name is required', maxLength: { value: 100, message: 'Max 100 characters' } }}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <SettingsRow label="Full Name" description="Your official display name across all Ryokai workspaces">
                        <FormControl>
                          <Input placeholder="Enter your full name" className="w-full max-w-[340px] text-xs h-9 font-medium" {...field} />
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
                      <SettingsRow label="Email Address" description="Primary email address for account notifications and recovery">
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" className="w-full max-w-[340px] text-xs h-9 font-medium" {...field} />
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
                      <SettingsRow label="Bio & Intro" description="Brief description visible to crew members and teammates">
                        <FormControl>
                          <Textarea 
                            placeholder="Tell your squad a little bit about yourself..." 
                            className="resize-none h-22 w-full max-w-[340px] text-xs" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </SettingsRow>
                    </FormItem>
                  )}
                />
              </CardContent>

              <div className="border-t border-[var(--color-border-subtle)] px-6 py-4 flex justify-end bg-[var(--bg-subtle)]">
                <Button 
                  type="submit" 
                  size="sm"
                  isLoading={updateProfile.isPending} 
                  disabled={isLoading}
                  className="rounded-xl px-5 font-bold shadow-sm"
                >
                  Save Profile Changes
                </Button>
              </div>
            </Card>
          </div>
        </form>
      </Form>

      {/* 🔔 NOTIFICATIONS PREFERENCES */}
      <div className="space-y-3">
        <Heading level={4} className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Icons.bell className="w-4 h-4 text-[var(--accent)]" />
          Notification Preferences
        </Heading>
        <Card className="border-[var(--color-border-subtle)] rounded-3xl overflow-hidden shadow-sm">
          <CardContent className="p-0 px-6">
            <SettingsRow label="Email Notifications" description="Receive email digests, task assignments, and direct crew alerts">
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
