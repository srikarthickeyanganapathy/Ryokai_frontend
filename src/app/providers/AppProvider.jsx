import { ThemeProvider } from './ThemeProvider'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/shared/api/queryClient'
import { AuthProvider } from '@/identity'
import { RealtimeProvider } from './RealTimeProvider'
import { ServerStatusProvider } from './ServerStatusProvider'

import { WorkspaceProvider } from './WorkspaceProvider'
import { Toaster } from './Toaster'
import { TooltipProvider } from '@/shared/ui/Tooltip'

export function AppProvider({ children }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ryokai-theme">
      <QueryClientProvider client={queryClient}>
        <ServerStatusProvider>
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
        </ServerStatusProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
