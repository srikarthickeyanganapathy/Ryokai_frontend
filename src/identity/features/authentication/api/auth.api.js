import api from '@/shared/api/api'
import { setAccessToken, setRefreshToken, clearTokens, getRefreshToken } from '../lib/tokens'
import { normalizeUser } from './user.api'

export const authAPI = {
  login: async (credentials) => {
    const { data: tokens } = await api.post('/auth/login', credentials)
    setAccessToken(tokens.accessToken)
    setRefreshToken(tokens.refreshToken)
    return {
      user: normalizeUser(tokens.user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  },

  register: async (userData) => {
    const { data: tokens } = await api.post('/auth/register', userData)
    setAccessToken(tokens.accessToken)
    setRefreshToken(tokens.refreshToken)
    return {
      user: normalizeUser(tokens.user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  },

  logout: async () => {
    const refreshToken = getRefreshToken()
    try {
      await api.post('/session/logout', { refreshToken })
    } catch (err) {
      // Ignore logout errors
    } finally {
      clearTokens()
    }
  },

  logoutAll: async () => {
    try {
      await api.post('/session/logout-all', {})
    } catch (err) {
      // Ignore
    } finally {
      clearTokens()
    }
  },

  verifyEmail: async (token) => {
    const { data } = await api.get(`/session/verify-email`, { params: { token } })
    return data
  },

  resendVerification: async (email) => {
    const { data } = await api.post('/session/resend-verification', { email })
    return data
  },

  getCurrentUser: async () => {
    const { data } = await api.get('/users/me')
    return normalizeUser(data)
  },

  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  },

  resetPassword: async (token, newPassword) => {
    const { data } = await api.post('/auth/reset-password', { token, newPassword })
    return data
  },

  /** OAuth: which providers have credentials configured on the backend. */
  getOAuthConfig: async () => {
    const { data } = await api.get('/auth/oauth2/config')
    return data
  },

  /** OAuth: full backend URL that starts the provider flow (browser must navigate there). */
  getOAuthStartUrl: (provider) => `${api.defaults.baseURL}/auth/oauth2/${provider}`,
}
