import React from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/shared/forms'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'

export function ChecklistForm({ onSubmit, isLoading }) {
  const form = useForm({
    defaultValues: {
      text: '',
    },
  })

  const handleSubmit = (data) => {
    onSubmit(data)
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-center gap-2">
        <FormField
          control={form.control}
          name="text"
          rules={{ 
            required: 'Item text is required',
            maxLength: {
              value: 200,
              message: 'Checklist item text cannot exceed 200 characters'
            }
          }}
          render={({ field }) => (
            <FormItem className="flex-1 space-y-0">
              <FormControl>
                <Input placeholder="Add a checklist item..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" isLoading={isLoading} size="icon" className="shrink-0">
          {!isLoading && <Icons.plus className="w-4 h-4" />}
        </Button>
      </form>
    </Form>
  )
}
