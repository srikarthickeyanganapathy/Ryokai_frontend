import React from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
          <div className="p-8 max-w-md w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl shadow-lg text-center flex flex-col">
            <div className="w-16 h-16 rounded-full bg-[var(--danger-soft)] flex items-center justify-center mx-auto mb-4">
              <span className="text-[var(--danger)] text-2xl" role="img" aria-label="Warning">[WARNING]</span>
            </div>
            <Heading level={2} className="text-xl font-bold mb-2">Something went wrong</Heading>
            <Text variant="muted" className="mb-6">An unexpected error occurred. Please try reloading the page or return to the dashboard.</Text>
            
            {import.meta.env.DEV && (
              <details className="text-left mb-6 bg-[var(--bg-subtle)] p-4 rounded-lg">
                <summary className="text-sm font-medium cursor-pointer text-[var(--text-secondary)] mb-2">View error details</summary>
                <pre className="text-xs text-[var(--danger)] font-mono whitespace-pre-wrap break-all overflow-x-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
            
            <div className="flex flex-col gap-3 mt-auto">
              <Button
                className="w-full"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/'}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
