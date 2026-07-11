import React from 'react'
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
import { useRegisterMutation } from '@/features/auth/hooks/useAuthMutations'

const registerSchema = z.object({
  username: z.string().min(3, { message: 'Must be at least 3 characters.' }).max(30).regex(/^[a-zA-Z0-9_-]+$/, { message: 'Only letters, numbers, underscores, and hyphens allowed.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(8, { message: 'Must be at least 8 characters.' }).regex(/[A-Za-z]/, { message: 'Must contain at least one letter.' }).regex(/\d/, { message: 'Must contain a number.' }),
})

export function RegisterForm() {
  const registerMutation = useRegisterMutation()

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = (values) => {
    registerMutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" size="lg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" size="lg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
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
          isLoading={registerMutation.isPending}
        >
          Create Account
        </Button>
      </form>
    </Form>
  )
}
