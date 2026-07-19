import React, { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { Switch } from '@/shared/ui/Switch'
import { Text } from '@/shared/ui/Typography'

export function EventForm({ onSubmit, isLoading, defaultValues }) {
  const [form, setForm] = useState(defaultValues)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Event title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />
      <Textarea
        placeholder="Description (optional)"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <div className="flex items-center justify-between">
        <Text size="sm">All day</Text>
        <Switch
          checked={form.isAllDay}
          onCheckedChange={(checked) => setForm({ ...form, isAllDay: checked })}
        />
      </div>
      {!form.isAllDay && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="datetime-local"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            required
          />
          <Input
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            required
          />
        </div>
      )}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating…' : 'Create Event'}
      </Button>
    </form>
  )
}
