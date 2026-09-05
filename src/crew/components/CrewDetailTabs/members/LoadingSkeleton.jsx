// Shimmer skeleton shown while the crew roster is loading
export function LoadingSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div className="space-y-2">
          <div className="h-4 bg-[var(--bg-subtle)] rounded w-32" />
          <div className="h-3 bg-[var(--bg-subtle)] rounded w-48" />
        </div>
        <div className="h-9 bg-[var(--bg-subtle)] rounded-lg w-72" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border border-[var(--border-subtle)] rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)]" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 bg-[var(--bg-subtle)] rounded w-24" />
                <div className="h-3 bg-[var(--bg-subtle)] rounded w-32" />
              </div>
            </div>
            <div className="h-1 bg-[var(--bg-subtle)] rounded-full" />
            <div className="h-3 bg-[var(--bg-subtle)] rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}