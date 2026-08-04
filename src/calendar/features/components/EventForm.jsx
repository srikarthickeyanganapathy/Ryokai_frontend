import React, { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { Switch } from '@/shared/ui/Switch'
import { Text, Label } from '@/shared/ui/Typography'

export function EventForm({ onSubmit, onCancel, isLoading, defaultValues }) {
  const [form, setForm] = useState(defaultValues)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium uppercase tracking-wider">Event Title</Label>
        <Input placeholder="e.g., Weekly Sync" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="h-9 text-[13px]" />
      </div>
      
      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium uppercase tracking-wider">Description</Label>
        <Textarea placeholder="Add details (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="text-[13px]" />
      </div>

      <div className="flex items-center justify-between p-3 bg-[var(--bg-subtle)]/50 rounded-lg border border-[var(--border-subtle)]">
        <div>
          <Label className="text-[12px] font-medium">All day event</Label>
          <Text variant="muted" className="text-[11px] mt-0.5">Does not have a specific start or end time</Text>
        </div>
        <Switch checked={form.isAllDay} onCheckedChange={(checked) => setForm({ ...form, isAllDay: checked })} />
      </div>

      {!form.isAllDay && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium uppercase tracking-wider">Start Time</Label>
            <Input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required className="h-9 text-[13px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium uppercase tracking-wider">End Time</Label>
            <Input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required className="h-9 text-[13px]" />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
        {onCancel && <Button type="button" variant="outline" size="sm" className="h-8 text-[12px]" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" size="sm" className="h-8 text-[12px]" disabled={isLoading} isLoading={isLoading}>{isLoading ? 'Creating…' : 'Create Event'}</Button>
      </div>
    </form>
  )
}