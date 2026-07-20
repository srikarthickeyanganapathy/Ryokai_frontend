import api from '@/shared/api/api'
import { setAccessToken, setRefreshToken, clearTokens, getRefreshToken } from '../lib/tokens'
import { normalizeUser } from './user.api'

export const authAPI = {
  login: async (credentials) => {
    // Backend POST /auth/login returns JwtResponseDTO:
    //   { accessToken, refreshToken, expiresIn, refreshExpiresIn, user: UserResponseDTO }
    // FIX: the old code made a redundant GET /users/me after login. The JwtResponseDTO
    // already includes the full user object, so we use it directly. This removes a
    // round-trip and avoids a race where /users/me could fail (returning 401) before
    // the access token is persisted to localStorage by the axios interceptor.
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
    // Backend returns JwtResponseDTO { accessToken, refreshToken, expiresIn, user } on 201 CREATED.
    // FIX: same as login — use the embedded user object instead of a second /users/me call.
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
      // Backend expects { refreshToken } in the body (TokenRefreshRequestDTO).
      await api.post('/auth/logout', { refreshToken })
    } finally {
      clearTokens()
    }
  },

  // FIX (SEC-Min01): new logout-all endpoint — invalidates ALL sessions by
  // incrementing token_version and deleting all refresh tokens. The backend
  // resolves the user from the Authorization header (access token), so no
  // body is required. We pass an empty body for safety.
  logoutAll: async () => {
    try {
      await api.post('/auth/logout-all', {})
    } finally {
      clearTokens()
    }
  },

  // FIX: backend endpoint is GET /auth/verify-email?token=..., NOT POST.
  // The old code used POST which would return 405 Method Not Allowed.
  verifyEmail: async (token) => {
    const { data } = await api.get(`/auth/verify-email`, { params: { token } })
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
    // Backend expects ForgotPasswordRequestDTO { email }. Returns 200 with a
    // generic message regardless of email existence (anti-enumeration).
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  },

  // FIX: backend ResetPasswordRequestDTO uses field name `newPassword` (verified).
  // The old code was already correct, but we make it explicit here.
  resetPassword: async (token, newPassword) => {
    const { data } = await api.post('/auth/reset-password', { token, newPassword })
    return data
  }
}
