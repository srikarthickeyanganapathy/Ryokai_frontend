import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/shared/forms/Form'
import { SettingsRow } from '@/shared/ui/SettingsRow'
import { useProfile, useUpdateProfile, useUploadAvatar } from '@/identity'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar'
import { Icons } from '@/shared/ui/Icons'
import { Spinner } from '@/shared/ui/Spinner'
import { cn } from '@/shared/lib/cn'
import { resizeImageFile } from '@/shared/lib/imageResize'
import { toast } from 'sonner'
import { PageShell, PageHero, PageContent } from '@/shared/ui/PageShell'
import { InteractiveCard } from '@/shared/ui/InteractiveCard'
import { Switch } from '@radix-ui/react-switch'

export function ProfilePage() {
  const { data: user, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const fileInputRef = React.useRef(null)

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    // Reset so picking the same file again still fires onChange
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    try {
      // Downscale first — raw phone photos are several MB and the backend
      // stores avatars as base64 (2MB cap). 512px JPEG is plenty for avatars.
      const resized = await resizeImageFile(file, 512)
      uploadAvatar.mutate(resized)
    } catch {
      uploadAvatar.mutate(file) // let the backend surface the error
    }
  }

  return (
    <PageShell maxWidth="narrow">
      <PageHero
        eyebrow="Profile"
        meta="Personal Identity & Preferences"
        title="Account Profile"
        subtitle="Manage your personal credentials, workspace presentation, and alert settings."
      />

      <PageContent>
        <div className="space-y-8">
          {/* 👤 HERO PROFILE BANNER CARD */}
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-52 bg-[var(--bg-subtle)] rounded-3xl" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <InteractiveCard
                variant="glass"
                className="overflow-hidden"
                padding={false}
              >
                <div className="h-28 bg-gradient-to-r from-blue-600/20 via-indigo-500/15 to-purple-600/20 relative border-b border-[var(--border-subtle)]">
                  <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                </div>

                <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-10">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn("relative group shrink-0", uploadAvatar.isPending ? "pointer-events-none opacity-80" : "cursor-pointer")}
                    onClick={handleAvatarClick}
                  >
                    <Avatar size="xl" className="w-20 h-20 bg-[var(--accent)] text-white font-bold text-2xl shadow-xl ring-4 ring-[var(--bg-elevated)] group-hover:opacity-80 transition-opacity">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback>{(user?.name || user?.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className={cn("absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition-opacity", uploadAvatar.isPending ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                      {uploadAvatar.isPending ? (
                        <Spinner size="sm" className="text-white" />
                      ) : (
                        <Icons.image className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </motion.div>

                  <div className="flex-1 text-center sm:text-left min-w-0 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <Heading level={2} className="text-lg font-bold text-[var(--text-primary)] truncate mb-0">
                        {user?.name || user?.username || 'Ryokai User'}
                      </Heading>
                      <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-mono text-[11px] font-semibold w-fit mx-auto sm:mx-0">
                        @{user?.username || 'user'}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] flex items-center justify-center sm:justify-start gap-1.5">
                      <Icons.mail className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                      <span>{user?.email || 'No email provided'}</span>
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
                    <div className="p-3.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-2xl text-xs text-[var(--text-secondary)] italic">
                      "{user.bio}"
                    </div>
                  </div>
                )}
              </InteractiveCard>
            </motion.div>
          )}

          {/* 📝 PROFILE EDIT FORM */}
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05, ease: 'easeOut' }}
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-3">
                    <Heading level={4} className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Icons.user className="w-4 h-4 text-[var(--accent)]" />
                      Personal Details
                    </Heading>

                    <InteractiveCard padding={false} className="overflow-hidden">
                      <div className="px-6 divide-y divide-[var(--border-subtle)]">
                        
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
                      </div>

                      <div className="border-t border-[var(--border-subtle)] px-6 py-4 flex justify-end bg-[var(--bg-subtle)]">
                        <Button 
                          type="submit" 
                          size="sm"
                          isLoading={updateProfile.isPending} 
                          disabled={isLoading || updateProfile.isPending}
                          className="rounded-xl px-5 font-bold shadow-sm"
                        >
                          Save Profile Changes
                        </Button>
                      </div>
                    </InteractiveCard>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}

          {/* 🔔 NOTIFICATIONS PREFERENCES */}
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1, ease: 'easeOut' }}
            >
              <div className="space-y-3">
                <Heading level={4} className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Icons.bell className="w-4 h-4 text-[var(--accent)]" />
                  Notification Preferences
                </Heading>
                <InteractiveCard padding={false} className="overflow-hidden">
                  <div className="px-6">
                    <SettingsRow label="Email Notifications" description="Receive email digests, task assignments, and direct crew alerts">
                      <Switch 
                        defaultChecked={user?.emailNotificationsEnabled ?? true} 
                        onCheckedChange={handleNotificationToggle}
                      />
                    </SettingsRow>
                  </div>
                </InteractiveCard>
              </div>
            </motion.div>
          )}
        </div>
      </PageContent>
    </PageShell>
  )
}
