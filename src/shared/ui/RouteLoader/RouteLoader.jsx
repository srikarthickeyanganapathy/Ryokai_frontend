import React from 'react'

// Deliberately minimal: a thin indeterminate bar, not a spinner or skeleton
// screen. Route chunks are small and cached after first visit, so this is
// rarely on screen for more than a couple hundred ms — it should read as
// "already loading" rather than announce itself.
export function RouteLoader() {
  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[100] overflow-hidden bg-transparent">
      <div className="h-full w-1/3 bg-[var(--accent)] animate-[route-loader_1.1s_ease-in-out_infinite]" />
      <style>{`
        @keyframes route-loader {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  )
}