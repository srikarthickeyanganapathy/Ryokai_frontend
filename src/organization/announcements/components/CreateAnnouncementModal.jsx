import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Label } from '@/shared/ui/Typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { useCreateAnnouncement } from '../../features/hooks/useAnnouncements';
import { DatePicker } from '@/shared/ui/DatePicker';
import { format } from 'date-fns';

const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
  content: z.string().min(1, 'Content is required'),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  audience: z.string().min(1),
  category: z.string().min(1),
  expiresAt: z.date().nullable(),
});

export function CreateAnnouncementModal({ isOpen, onClose, orgId }) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      content: '',
      priority: 'MEDIUM',
      audience: 'Entire Organization',
      category: 'General',
      expiresAt: null,
    },
    mode: 'onChange',
  });

  const priority = watch('priority');
  const audience = watch('audience');
  const category = watch('category');
  const expiresAt = watch('expiresAt');
  const title = watch('title');
  const content = watch('content');

  const createMutation = useCreateAnnouncement(orgId);

  const onSubmit = (data) => {
    createMutation.mutate({
      title: data.title,
      content: data.content,
      priority: data.priority,
      audience: data.audience,
      category: data.category,
      expiresAt: data.expiresAt ? format(data.expiresAt, "yyyy-MM-dd'T'HH:mm:ss") : null,
    }, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="sm:max-w-lg">
        <ModalHeader>
          <ModalTitle>New Announcement</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              type="text"
              required
              placeholder="Important Update"
              {...register('title')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setValue('priority', v, { shouldValidate: true })}>
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
              <Select value={audience} onValueChange={(v) => setValue('audience', v, { shouldValidate: true })}>
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
              <Select value={category} onValueChange={(v) => setValue('category', v, { shouldValidate: true })}>
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
                setDate={(d) => setValue('expiresAt', d, { shouldValidate: true })}
                placeholder="Select date"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea
              required
              placeholder="Write your announcement here... (Markdown supported)"
              {...register('content')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !isValid}>
              {createMutation.isPending ? 'Posting...' : 'Post Announcement'}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
