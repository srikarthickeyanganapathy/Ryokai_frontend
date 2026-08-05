import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Label } from '@/shared/ui/Typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { useCreateAnnouncement } from '../../features/hooks/useAnnouncements';
// The DatePicker is not guaranteed to exist in shared/ui but assuming the user meant standard inputs if missing. Let's use standard native input type="date" if DatePicker is complex, or rely on DatePicker if they have it.
// Wait, the user specifically imported DatePicker in their snippet: `import { DatePicker } from '@/shared/ui/DatePicker';`
// I will keep their import. If it fails, they can provide it.
import { DatePicker } from '@/shared/ui/DatePicker';
import { format } from 'date-fns';

export function CreateAnnouncementModal({ isOpen, onClose, orgId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [audience, setAudience] = useState('Entire Organization');
  const [category, setCategory] = useState('General');
  const [expiresAt, setExpiresAt] = useState(null);
  
  const createMutation = useCreateAnnouncement(orgId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    createMutation.mutate({
      title,
      content,
      priority,
      audience,
      category,
      expiresAt: expiresAt ? format(expiresAt, "yyyy-MM-dd'T'HH:mm:ss") : null,
    }, {
      onSuccess: () => {
        setTitle('');
        setContent('');
        setPriority('MEDIUM');
        setAudience('Entire Organization');
        setCategory('General');
        setExpiresAt(null);
        onClose();
      }
    });
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="sm:max-w-lg">
        <ModalHeader>
          <ModalTitle>New Announcement</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Important Update"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entire Organization">Entire Organization</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="HR Team">HR Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Release Notes">Release Notes</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Policy Update">Policy Update</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Expires At (Optional)</Label>
              <DatePicker 
                date={expiresAt}
                setDate={setExpiresAt}
                placeholder="Select date"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Write your announcement here... (Markdown supported)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !title.trim() || !content.trim()}>
              {createMutation.isPending ? 'Posting...' : 'Post Announcement'}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
