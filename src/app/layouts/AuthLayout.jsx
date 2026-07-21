import React from 'react'
import { Outlet } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { RyokaiLogo } from '@/shared/ui/Logo/RyokaiLogo'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)]">

      {/* LEFT SIDE — Brand */}
      <div className="hidden lg:flex lg:w-[42%] relative bg-[var(--bg-subtle)] border-r border-[var(--border-subtle)] flex-col justify-between p-10 overflow-hidden mesh-bg shadow-[var(--inset-highlight-soft)]">
        {/* Quiet dot-grid texture */}
        <div
          className="absolute inset-0 z-0 opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(var(--border-strong) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 30% 20%, black 0%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 30% 20%, black 0%, transparent 75%)',
          }}
        />

        <div className="relative z-10">
          <div className="mb-16">
            <RyokaiLogo size="lg" />
          </div>
          <Heading level={2} className="max-w-sm mb-3">
            Organize work, quietly.
          </Heading>
          <Text variant="muted" className="max-w-sm text-[14px] leading-relaxed">
            A fast, keyboard-first workspace for tasks and projects. No clutter — just what your team needs to ship.
          </Text>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <Text size="xs" variant="muted">© 2026 Ryokai</Text>
        </div>
      </div>

      {/* RIGHT SIDE — Forms */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 sm:p-12 lg:p-24 relative overflow-y-auto">

        {/* Mobile brand mark */}
        <div className="absolute top-8 left-8 flex lg:hidden items-center gap-2">
          <RyokaiLogo size="sm" />
        </div>

        <div className="w-full max-w-[360px] spring-in">
          <Outlet />
        </div>

      </div>
    </div>
  )
}