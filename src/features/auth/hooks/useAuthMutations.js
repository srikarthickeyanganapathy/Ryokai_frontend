import { useMutation } from '@tanstack/react-query'
import { authAPI } from '../api/auth.api'
import { useAuth } from './useAuth'
import { toast } from 'sonner'
import { useNavigate, useLocation } from 'react-router-dom'

export const useLoginMutation = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/app'

  return useMutation({
    mutationFn: (credentials) => authAPI.login(credentials),
    onSuccess: ({ user }) => {
      login(user)
      toast.success('Welcome back!', { description: "You've successfully logged in." })
      navigate(from, { replace: true })
    },
    onError: (error) => {
      const description = error.response?.data?.message || error.message || 'Invalid credentials'
      toast.error('Login Failed', { description })
    },
  })
}

export const useRegisterMutation = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (userData) => authAPI.register(userData),
    onSuccess: (data) => {
      toast.success('Account Created!', { description: data?.message || 'Please check your email to verify your account.' })
      navigate('/login', { replace: true })
    },
    onError: (error) => {
      const description = error.response?.data?.message || error.message || 'Could not create account'
      toast.error('Registration Failed', { description })
    },
  })
}

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (email) => authAPI.forgotPassword(email),
    onSuccess: () => {
      toast.success('Reset link sent!', { description: 'Please check your email.' })
    },
    onError: (error) => {
      const description = error.response?.data?.message || error.message || 'Could not send reset link'
      toast.error('Request Failed', { description })
    }
  })
}

export const useResetPasswordMutation = () => {
  const navigate = useNavigate()
  
  return useMutation({
    mutationFn: ({ token, newPassword }) => authAPI.resetPassword(token, newPassword),
    onSuccess: () => {
      toast.success('Password Reset', { description: 'You can now log in with your new password.' })
      navigate('/login', { replace: true })
    },
    onError: (error) => {
      const description = error.response?.data?.message || error.message || 'The token may have expired.'
      toast.error('Reset Failed', { description })
    }
  })
}

// FIX (SEC-Min01): new logout-all mutation — invalidates ALL sessions by
// incrementing token_version on the backend. Useful for the Security page
// "Sign out everywhere" button.
export const useLogoutAllMutation = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: () => authAPI.logoutAll(),
    onSuccess: () => {
      toast.success('Signed out everywhere', { description: 'All your sessions have been revoked.' })
      navigate('/login', { replace: true })
    },
    onError: (error) => {
      const description = error.response?.data?.message || error.message || 'Could not sign out everywhere'
      toast.error('Logout Failed', { description })
    }
  })
}
