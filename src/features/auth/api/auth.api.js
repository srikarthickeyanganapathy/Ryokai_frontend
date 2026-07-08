import api from '@/lib/api'
import { setAccessToken, setRefreshToken, clearTokens, getRefreshToken } from '../lib/tokens'

export const authAPI = {
  login: async (credentials) => {
    // Step 1: POST /auth/login — backend returns { accessToken, refreshToken, expiresIn, refreshExpiresIn }
    const { data: tokens } = await api.post('/auth/login', credentials)
    setAccessToken(tokens.accessToken)
    setRefreshToken(tokens.refreshToken)
    // Step 2: GET /users/me to fetch the full user object
    const { data: user } = await api.get('/users/me')
    return { user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
  },

  register: async (userData) => {
    // Backend returns { message, userId } — no tokens on registration
    const { data } = await api.post('/auth/register', userData)
    return data
  },

  logout: async () => {
    const refreshToken = getRefreshToken()
    try {
      await api.post('/auth/logout', { refreshToken })
    } finally {
      clearTokens()
    }
  },

  verifyEmail: async (token) => {
    const { data } = await api.post(`/auth/verify-email?token=${token}`)
    return data
  },

  resendVerification: async (email) => {
    const { data } = await api.post('/auth/resend-verification', { email })
    return data
  },

  getCurrentUser: async () => {
    const { data } = await api.get('/users/me')
    return data
  },

  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  },

  resetPassword: async (token, newPassword) => {
    const { data } = await api.post('/auth/reset-password', { token, newPassword })
    return data
  }
}
