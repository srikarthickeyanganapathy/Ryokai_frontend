import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/forms'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Text } from '@/shared/ui/Typography'
import { useForgotPasswordMutation } from '@/features/auth/hooks/useAuthMutations'

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
})

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const forgotPasswordMutation = useForgotPasswordMutation()

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = (values) => {
    forgotPasswordMutation.mutate(values.email, {
      onSuccess: () => {
        setIsSubmitted(true)
      }
    })
  }

  if (isSubmitted) {
    return (
      <div className="p-4 bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg">
        <Text variant="muted" className="text-center">
          If an account exists for <span className="font-medium text-[var(--text-primary)]">{form.getValues('email')}</span>, we have sent a password reset link. Please check your inbox.
        </Text>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full mt-2" 
          isLoading={forgotPasswordMutation.isPending}
        >
          Send Reset Link
        </Button>
      </form>
    </Form>
  )
}
