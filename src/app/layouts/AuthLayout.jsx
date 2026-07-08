import React from 'react'
import { Outlet } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)]">
      
      {/* LEFT SIDE - Brand / Illustration */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[var(--bg-elevated)] border-r border-[var(--color-border-subtle)] flex-col justify-between p-12 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[var(--accent-cyan)]/10 blur-[120px]" />
          <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[var(--accent-violet)]/10 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[var(--text-primary)] mb-12">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-cyan)] flex items-center justify-center shadow-sm">
              <Icons.dashboard className="w-5 h-5 text-white" />
            </div>
            <Heading level={4} className="font-semibold tracking-tight">Ryokai</Heading>
          </div>
          <Heading level={2} className="max-w-md font-medium tracking-tight mb-4">
            Organize work beautifully.
          </Heading>
          <Text variant="muted" className="max-w-md text-base leading-relaxed">
            The premium task management system designed to keep you and your team in flow. No clutter, just focus.
          </Text>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <Text size="sm" variant="muted">© 2026 Ryokai</Text>
        </div>
      </div>

      {/* RIGHT SIDE - Forms */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 sm:p-12 lg:p-24 relative overflow-y-auto">
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="absolute top-8 left-8 flex lg:hidden items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-cyan)] flex items-center justify-center shadow-sm">
            <Icons.dashboard className="w-4 h-4 text-white" />
          </div>
          <Heading level={5} className="font-semibold tracking-tight">Ryokai</Heading>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-[380px] animate-in fade-in zoom-in-95 duration-500">
          <Outlet />
        </div>
        
      </div>
    </div>
  )
}
