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
        <Label>Event Title</Label>
        <Input
          placeholder="e.g., Weekly Sync"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          placeholder="Add details (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-subtle)]">
        <div>
          <Label className="text-sm">All day event</Label>
          <Text variant="muted" className="text-xs mt-0.5">Does not have a specific start or end time</Text>
        </div>
        <Switch
          checked={form.isAllDay}
          onCheckedChange={(checked) => setForm({ ...form, isAllDay: checked })}
        />
      </div>

      {!form.isAllDay && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Start Time</Label>
            <Input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>End Time</Label>
            <Input
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              required
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating…' : 'Create Event'}
        </Button>
      </div>
    </form>
  )
}
