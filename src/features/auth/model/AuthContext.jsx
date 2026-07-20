import React, { createContext, useEffect, useState, useCallback, useRef } from 'react'
import { getAccessToken, clearTokens } from '../lib/tokens'
import { authAPI } from '../api/auth.api'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { scheduleProactiveRefresh, cancelProactiveRefresh } from '@/shared/api/api'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const queryClient = useQueryClient()
  // Track whether we've already handled session-expired to avoid double-toast
  const sessionExpiredHandled = useRef(false)

  const checkAuth = useCallback(async () => {
    try {
      const token = getAccessToken()
      if (token) {
        // Call real backend endpoint GET /users/me to validate and fetch user
        const userData = await authAPI.getCurrentUser()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Session restoration failed:', error)
      setUser(null)
      clearTokens()
    } finally {
      setIsInitializing(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()

    // Listen for custom session-expired event dispatched by axios interceptor
    const handleSessionExpired = () => {
      if (sessionExpiredHandled.current) return
      sessionExpiredHandled.current = true
      setUser(null)
      clearTokens()
      queryClient.clear()
      toast.error('Session Expired', { description: 'Please log in again.' })
      // Reset the guard after a short delay so future expirations can fire
      setTimeout(() => { sessionExpiredHandled.current = false }, 1000)
    }

    // Re-validate auth when the tab regains focus — catches expired sessions
    // after the user has been away from the tab for a while
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && getAccessToken()) {
        checkAuth()
      }
    }

    window.addEventListener('session-expired', handleSessionExpired)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [checkAuth, queryClient])

  const login = (userData) => {
    setUser(userData)
    sessionExpiredHandled.current = false
  }

  // Called by useUpdateProfile / useUploadAvatar to sync user state
  // without requiring a page refresh
  const refreshUser = useCallback(async () => {
    try {
      const token = getAccessToken()
      if (token) {
        const userData = await authAPI.getCurrentUser()
        setUser(userData)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }, [])

  const logout = async () => {
    try {
      await authAPI.logout()
    } finally {
      setUser(null)
      clearTokens()
      cancelProactiveRefresh()
      queryClient.clear()
    }
  }

  // Determine if the user is authenticated based on state, not just token presence
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isInitializing, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
