import { Label } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/shared/ui/Modal';

// Email invitation modal
export function InviteMemberModal({ open, onOpenChange, email, onEmailChange, isPending, onSubmit }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Invite member</ModalTitle>
          <ModalDescription>Send an email invitation to add a collaborator to this crew.</ModalDescription>
        </ModalHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-[var(--text-muted)]">Email address</Label>
            <Input
              type="email"
              placeholder="colleague@company.com"
              className="h-9 text-sm"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
            />
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" size="sm" className="h-9 text-sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-9 text-sm" isLoading={isPending}>
              Send invitation
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}