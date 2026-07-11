import api from '@/lib/api'
import { setAccessToken, setRefreshToken, clearTokens, getRefreshToken } from '../lib/tokens'
import { normalizeUser } from './user.api'

export const authAPI = {
  login: async (credentials) => {
    // Step 1: POST /auth/login — backend returns { accessToken, refreshToken, expiresIn, refreshExpiresIn }
    const { data: tokens } = await api.post('/auth/login', credentials)
    setAccessToken(tokens.accessToken)
    setRefreshToken(tokens.refreshToken)
    // Step 2: GET /users/me to fetch the full user object
    const { data: user } = await api.get('/users/me')
    return { user: normalizeUser(user), accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
  },

  register: async (userData) => {
    // Backend returns JwtResponseDTO { accessToken, refreshToken, expiresIn, user } on 201 CREATED
    const { data: tokens } = await api.post('/auth/register', userData)
    setAccessToken(tokens.accessToken)
    setRefreshToken(tokens.refreshToken)
    // Fetch the full user profile
    const { data: user } = await api.get('/users/me')
    return { user: normalizeUser(user), accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
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
    return normalizeUser(data)
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
