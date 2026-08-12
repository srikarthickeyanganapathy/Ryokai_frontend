import React from 'react';
import { Text, Label } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/Select';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/shared/ui/Modal';
import { Hash, Volume2 } from '@/shared/ui/Icons';

/* Channel Creation Modal. Name/type form state is owned by the parent (ChannelsTab). */
export function CreateChannelModal({ 
  open, 
  onOpenChange, 
  channelName, 
  onChannelNameChange, 
  channelType, 
  onChannelTypeChange, 
  isPending, 
  onSubmit 
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-md !bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl rounded-2xl p-6">
        <ModalHeader className="text-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-3 mx-auto border border-[var(--accent-border)] shadow-xs">
            {channelType === 'TEXT' ? <Hash className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </div>
          <ModalTitle className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Create Channel</ModalTitle>
          <Text variant="muted" className="text-[12px] mt-1">Organize squad conversations by topic or voice mode.</Text>
        </ModalHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Channel Name</Label>
            <Input 
              value={channelName} 
              onChange={(e) => onChannelNameChange(e.target.value)} 
              placeholder="e.g. general, sprint-qa, dev-lounge" 
              required 
              className="h-9 text-[13px] rounded-lg font-medium bg-[var(--bg-base)]" 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Channel Type</Label>
            <Select value={channelType} onValueChange={onChannelTypeChange}>
              <SelectTrigger className="h-9 text-[13px] rounded-lg font-medium bg-[var(--bg-base)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="TEXT"><span className="flex items-center gap-2"><Hash className="w-3.5 h-3.5" /> Text Channel</span></SelectItem>
                <SelectItem value="VOICE"><span className="flex items-center gap-2"><Volume2 className="w-3.5 h-3.5" /> Voice Room</span></SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2.5 pt-4 border-t border-[var(--border-subtle)] mt-5">
            <Button type="button" variant="outline" size="sm" className="h-8 px-4 text-[12px] rounded-lg" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="h-8 px-4 text-[12px] font-semibold rounded-lg" isLoading={isPending}>Create Channel</Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
