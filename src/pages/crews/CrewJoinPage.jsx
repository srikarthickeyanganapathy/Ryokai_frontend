import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { useAcceptCrewInvite } from '@/features/crews/hooks/useCrews';

export function CrewJoinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteId = searchParams.get('inviteId');
  const acceptInviteMutation = useAcceptCrewInvite();

  const handleJoin = () => {
    if (!inviteId) return;
    acceptInviteMutation.mutate(inviteId, {
      onSuccess: (data) => {
        // Redirection to the crew detail page
        navigate(`/app/crews/${data.id || inviteId}`);
      }
    });
  };

  useEffect(() => {
    if (!inviteId) {
      navigate('/app/crews');
    }
  }, [inviteId, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] max-w-md mx-auto mt-16">
      <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] mb-4">
        <Icons.users className="w-6 h-6" />
      </div>
      <Heading level={3} className="text-[18px] font-semibold mb-2">You've been invited to join a Crew!</Heading>
      <Text variant="muted" className="text-[13px] mb-6">
        Crews are flat, collaborative spaces for working on projects, sharing text/voice channels, and tackling tasks together.
      </Text>
      <Button
        className="w-full gap-2"
        onClick={handleJoin}
        isLoading={acceptInviteMutation.isPending}
      >
        <Icons.check className="w-4 h-4" />
        Accept Invitation & Join
      </Button>
    </div>
  );
}
