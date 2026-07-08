import { createContext, useContext, useState } from 'react'

const SessionContext = createContext({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
})

export function SessionProvider({ children }) {
  // Phase 4: This will connect to the real authentication API
  const [user, setUser] = useState(null)

  const login = (userData) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('aura-auth-token')
  }

  return (
    <SessionContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
