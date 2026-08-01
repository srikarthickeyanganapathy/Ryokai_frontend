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
          <div className="p-8 max-w-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--danger-soft)] flex items-center justify-center mx-auto mb-4">
              <span className="text-[var(--danger)] text-2xl">⚠️</span>
            </div>
            <Heading level={2} className="text-xl font-bold mb-2">Something went wrong</Heading>
            <Text variant="muted" className="mb-6">An unexpected error occurred in the application. Please try reloading the page.</Text>
            
            <div className="p-4 bg-[var(--bg-subtle)] rounded-lg text-left mb-6 overflow-x-auto">
              <pre className="text-xs text-[var(--danger)] font-mono whitespace-pre-wrap break-all">
                {this.state.error?.toString()}
              </pre>
            </div>
            
            <Button
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
