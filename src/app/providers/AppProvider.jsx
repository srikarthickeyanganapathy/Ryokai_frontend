import { ThemeProvider } from './ThemeProvider'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/features/auth/model/AuthContext'
import { RealtimeProvider } from './RealtimeProvider'

import { WorkspaceProvider } from '@/context/WorkspaceContext'
import { Toaster } from '@/shared/ui/Toast'

export function AppProvider({ children }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="aura-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <RealtimeProvider>
              {children}
              <Toaster />
            </RealtimeProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
