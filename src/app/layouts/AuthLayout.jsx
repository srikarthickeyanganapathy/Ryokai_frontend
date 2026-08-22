import React from 'react'
import { Outlet } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { RyokaiLogo } from '@/shared/ui/Logo/RyokaiLogo'
import { CosmicBackground } from '@/shared/ui/CosmicBackground'
import CardFanCarousel from '@/shared/ui/CardFanCarousel/CardFanCarousel'
import {
  LayoutDashboard, Rocket, FileCheck2, Zap, Radio, Github, CalendarClock, TrendingUp,
} from 'lucide-react'

const AUTH_SPOTLIGHT_CARDS = [
  {
    icon: LayoutDashboard,
    title: 'Mission Control, one home',
    body: 'Personal, Crews, and Org work in a single calm dashboard. Switch lenses without losing context.',
    footer: 'Dashboard',
    gradient: 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 60%, #075985 100%)',
    imgUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=700&fit=crop',
    alt: 'Mountain landscape',
  },
  {
    icon: Rocket,
    title: 'Crews that ship together',
    body: 'Spin up squads, claim open tasks from the board, and watch mission completion climb in real time.',
    footer: 'Collaboration',
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 60%, #5B21B6 100%)',
    imgUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=700&fit=crop',
    alt: 'Sunlit forest path',
  },
  {
    icon: FileCheck2,
    title: 'Evidence-backed reviews',
    body: 'Attach files and screenshots to finished work. Submit for review, get approvals — no chasing.',
    footer: 'Workflow',
    gradient: 'linear-gradient(135deg, #34D399 0%, #10B981 60%, #065F46 100%)',
    imgUrl: 'https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?w=400&h=700&fit=crop',
    alt: 'City at night',
  },
  {
    icon: Zap,
    title: 'Focus mode',
    body: 'A deep-work timer that mutes the noise and keeps you on the one task that matters right now.',
    footer: 'Deep work',
    gradient: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 60%, #B45309 100%)',
    imgUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=700&fit=crop',
    alt: 'Starry mountain night',
  },
  {
    icon: Radio,
    title: 'Live everywhere at once',
    body: 'Comments, status changes, and evidence sync instantly across every device and every teammate.',
    footer: 'Realtime',
    gradient: 'linear-gradient(135deg, #5477F5 0%, #3B82F6 60%, #1E3A8A 100%)',
    imgUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=700&fit=crop',
    alt: 'Tropical beach waves',
  },
  {
    icon: Github,
    title: 'GitHub, wired in',
    body: 'Pull requests and commits link straight to the tasks they close — proof arrives automatically.',
    footer: 'Integrations',
    gradient: 'linear-gradient(135deg, #64748B 0%, #475569 60%, #1E293B 100%)',
    imgUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=700&fit=crop',
    alt: 'Foggy forest',
  },
  {
    icon: CalendarClock,
    title: 'Deadlines without dread',
    body: 'Every due date in one view. Overdue work surfaces early, due-soon work never sneaks up.',
    footer: 'Planning',
    gradient: 'linear-gradient(135deg, #F472B6 0%, #EC4899 60%, #9D174D 100%)',
    imgUrl: 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=400&h=700&fit=crop',
    alt: 'Golden sunset',
  },
  {
    icon: TrendingUp,
    title: 'Insights from real work',
    body: 'Completion trends, overdue counts, and workload signals — computed from your actual tasks.',
    footer: 'Analytics',
    gradient: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 60%, #134E4A 100%)',
    imgUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=700&fit=crop',
    alt: 'Lake reflection',
  },
]

export function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)]">

      {/* LEFT SIDE — Brand + feature fan carousel */}
      <div className="hidden lg:flex lg:w-[46%] relative bg-[var(--bg-subtle)] border-r border-[var(--border-subtle)] flex-col justify-between p-10 overflow-hidden mesh-bg shadow-[var(--inset-highlight-soft)]">
        {/* Cosmic starfield particles in brand panel */}
        <CosmicBackground variant="hero" opacity={0.3} />
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

        <div className="relative z-10 shrink-0">
          <div className="mb-6">
            <RyokaiLogo size="lg" />
          </div>
          <Heading level={2} className="max-w-md mb-2">
            Organize work, quietly.
          </Heading>
          <Text variant="muted" className="max-w-md text-[14px] leading-relaxed">
            A fast, keyboard-first workspace for tasks and projects. No clutter — just what your team needs to ship.
          </Text>
        </div>

        {/* Feature fan carousel — hover a card to explore */}
        <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center py-4">
          <CardFanCarousel cards={AUTH_SPOTLIGHT_CARDS} />
        </div>

        <div className="relative z-10 flex items-center gap-4 shrink-0">
          <Text size="xs" variant="muted">© 2026 Ryokai</Text>
        </div>
      </div>

      {/* RIGHT SIDE — Forms */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 sm:p-12 lg:p-24 relative overflow-y-auto bg-[var(--bg-base)]">

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
