import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useSearchParams } from 'react-router-dom'
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
import { useResetPasswordMutation } from '@/features/auth/hooks/useAuthMutations'
import { ErrorState } from '@/shared/ui/ErrorState'

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const resetPasswordMutation = useResetPasswordMutation()

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  if (!token) {
    return (
      <ErrorState 
        title="Invalid Link"
        description="This password reset link is invalid or has expired."
      />
    )
  }

  const onSubmit = (values) => {
    resetPasswordMutation.mutate({ token, newPassword: values.password })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" size="lg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" size="lg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full mt-2" 
          isLoading={resetPasswordMutation.isPending}
        >
          Reset Password
        </Button>
      </form>
    </Form>
  )
}
