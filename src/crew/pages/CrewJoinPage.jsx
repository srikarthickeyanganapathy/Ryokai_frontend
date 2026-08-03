import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { useAcceptCrewInvite } from '../features/hooks/useCrews';
import { 
  Users, 
  MessageSquare, 
  ListTodo, 
  Pencil, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  PartyPopper
} from 'lucide-react';

export function CrewJoinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteId = searchParams.get('inviteId');
  const acceptInviteMutation = useAcceptCrewInvite();
  
  const [showSuccess, setShowSuccess] = useState(false);

  const handleJoin = () => {
    if (!inviteId) return;
    acceptInviteMutation.mutate(inviteId, {
      onSuccess: (data) => {
        setShowSuccess(true);
        // Delay navigation to allow the success animation to play
        setTimeout(() => {
          navigate(`/app/crews/${data.id || inviteId}`);
        }, 1800);
      }
    });
  };

  useEffect(() => {
    if (!inviteId) {
      navigate('/app/crews');
    }
  }, [inviteId, navigate]);

  const features = [
    { icon: Users, title: 'Active Members', desc: 'Collaborate with a dedicated squad' },
    { icon: ListTodo, title: 'Shared Projects', desc: 'Execute tasks on a unified board' },
    { icon: MessageSquare, title: 'Real-Time Chat', desc: 'Communicate in text & voice channels' },
    { icon: Pencil, title: 'Whiteboards', desc: 'Sketch ideas on collaborative canvases' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-soft)] rounded-full blur-[120px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--info-soft)] rounded-full blur-[120px] opacity-30 pointer-events-none"></div>

      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.div
            key="invitation-card"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            {/* Hero Banner */}
            <div className="relative h-32 bg-gradient-to-br from-[var(--accent-soft)] via-[var(--bg-card)] to-[var(--info-soft)] border-b border-[var(--border-subtle)] flex items-center justify-center">
              <div 
                className="absolute inset-0 opacity-30" 
                style={{ backgroundImage: 'radial-gradient(var(--border-subtle) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
              ></div>
              
              {/* Floating Crew Avatar */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="relative w-20 h-20 rounded-full bg-[var(--accent)] text-white font-bold text-2xl flex items-center justify-center border-4 border-[var(--bg-card)] shadow-lg font-mono"
              >
                <Users className="w-9 h-9" />
              </motion.div>
            </div>

            {/* Content Body */}
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] mb-4">
                <Sparkles className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Crew Invitation</span>
              </div>
              
              <Heading level={2} className="text-[22px] font-bold tracking-tight text-[var(--text-primary)] mb-2">
                You've been invited!
              </Heading>
              <Text variant="muted" className="text-[14px] mb-8 max-w-sm mx-auto leading-relaxed">
                You are invited to join a collaborative Crew. Crews are flat, mission-oriented spaces for working on projects, sharing channels, and tackling tasks together.
              </Text>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {features.map((feature, index) => (
                  <motion.div 
                    key={feature.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.05 }}
                    className="flex items-start gap-2.5 p-3 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent)] shrink-0">
                      <feature.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-bold text-[var(--text-primary)] truncate">{feature.title}</div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">{feature.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action Button */}
              <Button 
                className="w-full gap-2 h-12 text-[14px] font-bold shadow-md transition-all hover:shadow-lg hover:scale-[1.01]" 
                onClick={handleJoin}
                isLoading={acceptInviteMutation.isPending}
                disabled={acceptInviteMutation.isPending}
              >
                Accept Invitation & Join
                {!acceptInviteMutation.isPending && <ArrowRight className="w-4 h-4" />}
              </Button>
              
              <Text variant="muted" size="xs" className="mt-4 text-[10px] font-medium">
                By joining, you agree to participate actively in the crew's mission.
              </Text>
            </div>
          </motion.div>
        ) : (
          /* Animated Success Screen */
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl p-10 text-center z-10 overflow-hidden"
          >
            {/* Confetti Elements */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: ['var(--accent)', 'var(--info)', 'var(--warning)', 'var(--success)'][i % 4],
                  top: '50%', 
                  left: '50%' 
                }}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{ 
                  scale: [0, 1, 0], 
                  x: (Math.random() - 0.5) * 300, 
                  y: (Math.random() - 0.5) * 300,
                  opacity: [1, 1, 0] 
                }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.1 }}
              />
            ))}

            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="relative w-20 h-20 rounded-full bg-[var(--success-soft)] flex items-center justify-center mx-auto mb-6 border-4 border-[var(--bg-card)] shadow-lg"
            >
              <div className="absolute inset-0 rounded-full bg-[var(--success)] opacity-20 animate-ping"></div>
              <CheckCircle2 className="w-10 h-10 text-[var(--success)] relative z-10" strokeWidth={2.5} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/20 mb-4">
                <PartyPopper className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Success</span>
              </div>
              <Heading level={2} className="text-[22px] font-bold tracking-tight text-[var(--text-primary)] mb-2">
                Welcome to the Crew!
              </Heading>
              <Text variant="muted" className="text-[14px] mb-8 max-w-xs mx-auto leading-relaxed">
                You're officially a member. Redirecting you to your new collaborative workspace...
              </Text>
              
              <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] text-[12px] font-medium">
                <Icons.spinner className="w-4 h-4 animate-spin" />
                <span>Preparing your dashboard</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}