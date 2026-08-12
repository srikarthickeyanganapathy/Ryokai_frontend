import { Label } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/shared/ui/Modal';
import { Mail } from '@/shared/ui/Icons';

// Email invitation modal — used from both the empty roster state and the main directory toolbar
export function InviteMemberModal({ open, onOpenChange, email, onEmailChange, isPending, onSubmit }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Invite Member to Crew</ModalTitle>
          <ModalDescription>Send an email invitation to add a collaborator to this crew workspace.</ModalDescription>
        </ModalHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <Input
                type="email"
                placeholder="colleague@company.com"
                className="pl-9 h-9 text-[12px]"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                required
              />
            </div>
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-8 text-[12px]" isLoading={isPending}>
              Send Invitation
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
