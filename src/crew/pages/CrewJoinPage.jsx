import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Avatar, AvatarFallback } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { ErrorState } from '@/shared/ui/ErrorState';
import { useAcceptCrewInvite } from '../features/hooks/useCrews';
import { 
  Users, 
  MessageSquare, 
  ListTodo, 
  Pencil, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  PartyPopper,
  ShieldCheck,
  Compass,
  Loader2,
  AlertCircle,
  WifiOff,
  Rocket,
  Radio
} from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';

// Ambient Particle Canvas / Background
const AMBIENT_PARTICLES = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 6 + 3,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 4,
}));

function AmbientParticleBackground() {
  const particles = AMBIENT_PARTICLES;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Glowing Ambient Blobs */}
      <div className="absolute top-1/6 left-1/5 w-[500px] h-[500px] bg-[var(--accent-soft)] rounded-full blur-[140px] opacity-40 animate-pulse" />
      <div className="absolute bottom-1/6 right-1/5 w-[500px] h-[500px] bg-[var(--info-soft)] rounded-full blur-[140px] opacity-30 animate-pulse" />

      {/* Floating Geometric Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--info)] opacity-20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.15, 0.35, 0.15],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

// Celebratory Confetti Burst Particle Components
const CONFETTI_ITEMS = (() => {
    const colors = [
      'var(--accent)', 
      'var(--info)', 
      'var(--warning)', 
      'var(--success)',
      '#EC4899', 
      '#8B5CF6'
    ];
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      color: colors[i % colors.length],
      shape: i % 3 === 0 ? 'rounded-full' : i % 3 === 1 ? 'rounded-xs' : 'rotate-45 rounded-xs',
      size: Math.random() * 10 + 6,
      angle: (i / 28) * 360,
      distance: Math.random() * 220 + 120,
      duration: Math.random() * 0.6 + 1.2,
      delay: Math.random() * 0.15,
    }));
  })();

function ConfettiParticles() {
  const confettiItems = CONFETTI_ITEMS;


  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {confettiItems.map((item) => {
        const rad = (item.angle * Math.PI) / 180;
        const targetX = Math.cos(rad) * item.distance;
        const targetY = Math.sin(rad) * item.distance;

        return (
          <motion.div
            key={item.id}
            className={cn("absolute left-1/2 top-1/2 shadow-xs", item.shape)}
            style={{
              backgroundColor: item.color,
              width: item.size,
              height: item.size,
            }}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{
              scale: [0, 1.2, 0.8, 0],
              x: targetX,
              y: targetY + 60, // gravity drop
              rotate: 360 * (item.id % 2 === 0 ? 1 : -1),
              opacity: [1, 1, 0.8, 0],
            }}
            transition={{
              duration: item.duration,
              ease: [0.16, 1, 0.3, 1],
              delay: item.delay,
            }}
          />
        );
      })}
    </div>
  );
}

export function CrewJoinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteId = searchParams.get('inviteId');

  const acceptInviteMutation = useAcceptCrewInvite();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [joinedCrewData, setJoinedCrewData] = useState(null);

  // Monitor network status for UX State #6
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleJoin = () => {
    if (!inviteId) return;
    acceptInviteMutation.mutate(inviteId, {
      onSuccess: (data) => {
        setJoinedCrewData(data || {});
        setShowSuccess(true);
        // Delay navigation so user can enjoy celebration animation
        setTimeout(() => {
          navigate(`/app/crews/${data?.id || inviteId}`);
        }, 2200);
      }
    });
  };

  const features = [
    { icon: Users, title: 'Dedicated Squad', desc: 'Collaborate with cross-functional members' },
    { icon: ListTodo, title: 'Shared Task Board', desc: 'Manage project tasks in real time' },
    { icon: MessageSquare, title: 'Squad Channels', desc: 'Communicate in text & chat streams' },
    { icon: Pencil, title: 'Whiteboard Canvases', desc: 'Brainstorm ideas on shared visual space' },
  ];



  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 overflow-hidden bg-[var(--bg-base)]">
      {/* Ambient Animated Particle Background */}
      <AmbientParticleBackground />

      {/* Offline Alert Banner (UX State #6) */}
      {!isOnline && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning)]/30 text-[12px] font-medium shadow-md">
          <WifiOff className="w-4 h-4" />
          <span>You are currently offline. Connect to internet to accept invitation.</span>
        </div>
      )}

      {/* UX State #4: Invalid or Missing Invite ID */}
      {!inviteId ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-md w-full bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border-subtle)] rounded-3xl p-8 text-center shadow-2xl z-10"
        >
          <div className="w-14 h-14 rounded-full bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center mx-auto mb-4 border border-[var(--danger)]/20">
            <AlertCircle className="w-7 h-7" />
          </div>
          <Heading level={2} className="text-[20px] font-bold text-[var(--text-primary)] mb-2">
            Invalid Invitation Link
          </Heading>
          <Text variant="muted" className="text-[13px] leading-relaxed mb-6">
            This crew invitation link appears to be missing or invalid. Please request a new invite link from your squad lead.
          </Text>
          <Button 
            variant="primary" 
            onClick={() => navigate('/app/crews')}
            className="w-full h-10 text-[13px] gap-2 font-semibold"
          >
            <Compass className="w-4 h-4" /> Browse Public Squads
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          {!showSuccess ? (
            /* UX State #3: Interactive Welcome Glass Card */
            <motion.div
              key="invitation-card"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="relative w-full max-w-lg bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              {/* Glass Hero Header */}
              <div className="relative h-36 bg-gradient-to-br from-[var(--accent-soft)] via-[var(--bg-card)] to-[var(--info-soft)] border-b border-[var(--border-subtle)] flex items-center justify-center overflow-hidden">
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(var(--border-subtle) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                />
                
                {/* Floating Squad Crest */}
                <motion.div 
                  initial={{ y: 20, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-[var(--info)] text-white font-bold text-2xl flex items-center justify-center border-4 border-[var(--bg-card)] shadow-xl font-mono"
                >
                  <Users className="w-9 h-9" />
                </motion.div>
              </div>

              {/* Content Body */}
              <div className="p-8 text-center space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Squad Invitation</span>
                  </div>
                  
                  <Heading level={2} className="text-[24px] font-bold tracking-tight text-[var(--text-primary)]">
                    You're Invited to Join!
                  </Heading>
                  <Text variant="muted" className="text-[13px] leading-relaxed max-w-sm mx-auto mt-2">
                    Crews are mission-oriented workspaces where teams execute projects, chat in real-time, and solve problems together.
                  </Text>
                </div>

                {/* Active Squad Workspace Preview */}
                <div className="p-3 bg-[var(--bg-subtle)]/70 rounded-xl border border-[var(--border-subtle)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-left">
                    <div className="w-7 h-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-[11px] border border-[var(--accent-border)]">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] font-medium">
                      Active Squad Workspace
                    </span>
                  </div>

                  <Badge variant="success" size="xs" className="font-mono text-[9px] gap-1">
                    <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE SQUAD
                  </Badge>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-left">
                  {features.map((feature, index) => (
                    <motion.div 
                      key={feature.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + index * 0.05 }}
                      className="flex items-start gap-2.5 p-3 bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)] rounded-xl"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent)] shrink-0 shadow-2xs">
                        <feature.icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-bold text-[var(--text-primary)] truncate">{feature.title}</div>
                        <div className="text-[10px] text-[var(--text-muted)] leading-snug mt-0.5">{feature.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* UX State #5: Error Banner if mutation failed */}
                {acceptInviteMutation.isError && (
                  <div className="p-3 bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger)]/30 rounded-xl text-[12px] text-left flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Failed to join: </span>
                      {acceptInviteMutation.error?.response?.data?.message || 'Server error accepting invite. Please try again.'}
                    </div>
                  </div>
                )}

                {/* Action CTA Button */}
                <div className="space-y-2 pt-2">
                  <Button 
                    className="w-full gap-2 h-12 text-[14px] font-bold shadow-md hover:shadow-lg transition-all" 
                    onClick={handleJoin}
                    isLoading={acceptInviteMutation.isPending}
                    disabled={acceptInviteMutation.isPending || !isOnline}
                  >
                    {acceptInviteMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Joining Squad...</>
                    ) : (
                      <>Accept Invitation & Join <ArrowRight className="w-4 h-4" /></>
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]" />
                    <span>Instant access to tasks, channels, and team whiteboards.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* UX State #7: Celebratory Confetti Success Experience */
            <motion.div
              key="success-card"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-md bg-[var(--bg-card)]/95 backdrop-blur-xl border border-[var(--border-subtle)] rounded-3xl shadow-2xl p-10 text-center z-10 overflow-hidden"
            >
              {/* Confetti Explosion Component */}
              <ConfettiParticles />

              {/* Glowing Success Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
                className="relative w-20 h-20 rounded-full bg-[var(--success-soft)] flex items-center justify-center mx-auto mb-6 border-4 border-[var(--bg-card)] shadow-xl"
              >
                <div className="absolute inset-0 rounded-full bg-[var(--success)] opacity-20 animate-ping" />
                <CheckCircle2 className="w-10 h-10 text-[var(--success)] relative z-10" strokeWidth={2.5} />
              </motion.div>

              {/* Welcome Message */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-3"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/30 font-mono text-[10px] font-bold uppercase tracking-widest">
                  <PartyPopper className="w-3.5 h-3.5" /> Welcome to the Squad!
                </div>
                
                <Heading level={2} className="text-[24px] font-bold tracking-tight text-[var(--text-primary)]">
                  {joinedCrewData?.name ? `Joined ${joinedCrewData.name}!` : "Invitation Accepted!"}
                </Heading>
                
                <Text variant="muted" className="text-[13px] leading-relaxed max-w-xs mx-auto">
                  You are now an active member of this crew workspace. Preparing your real-time dashboard...
                </Text>

                <div className="pt-4 flex items-center justify-center gap-2 text-[var(--accent)] text-[12px] font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Redirecting to squad control center...</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
export default CrewJoinPage;