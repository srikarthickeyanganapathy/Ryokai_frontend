import { ThemeProvider } from './ThemeProvider'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/shared/api/queryClient'
import { AuthProvider } from '@/features/auth/model/AuthContext'
import { RealtimeProvider } from './RealTimeProvider'

import { WorkspaceProvider } from './WorkspaceProvider'
import { Toaster } from './Toaster'
import { TooltipProvider } from '@/shared/ui/Tooltip'

export function AppProvider({ children }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="aura-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WorkspaceProvider>
            <RealtimeProvider>
              <TooltipProvider delayDuration={200}>
                {children}
                <Toaster />
              </TooltipProvider>
            </RealtimeProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
