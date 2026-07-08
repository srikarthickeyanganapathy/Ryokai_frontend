import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getAccessToken, clearTokens } from '../lib/tokens'
import { authAPI } from '../api/auth.api'
import { toast } from 'sonner'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)

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
      setUser(null)
      toast.error('Session Expired', { description: 'Please log in again.' })
    }

    window.addEventListener('session-expired', handleSessionExpired)
    return () => window.removeEventListener('session-expired', handleSessionExpired)
  }, [checkAuth])

  const login = (userData) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } finally {
      setUser(null)
      clearTokens()
    }
  }

  // Determine if the user is authenticated based on state, not just token presence
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isInitializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
