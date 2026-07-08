import { createContext, useContext, useState } from 'react'

const PreferencesContext = createContext({
  sidebarOpen: true,
  toggleSidebar: () => {},
  compactMode: false,
  toggleCompactMode: () => {},
})

export function PreferencesProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [compactMode, setCompactMode] = useState(false)

  const toggleSidebar = () => setSidebarOpen(prev => !prev)
  const toggleCompactMode = () => setCompactMode(prev => !prev)

  return (
    <PreferencesContext.Provider 
      value={{ 
        sidebarOpen, 
        toggleSidebar,
        compactMode,
        toggleCompactMode
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}

export const usePreferences = () => {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}
