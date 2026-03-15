/**
 * React Error Boundary Component
 *
 * Catches React component errors and displays fallback UI
 */

import React, { Component, type ReactNode } from 'react';
import { handleReactError } from '../utils/error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    handleReactError(error, { componentStack: errorInfo.componentStack ?? '' });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-fallback p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-800 text-lg font-bold mb-2">
            Something went wrong
          </h2>
          <p className="text-red-700 mb-4">
            An error occurred in this component. Please refresh the page.
          </p>
          {this.state.error && (
            <details className="text-sm text-red-600">
              <summary className="cursor-pointer font-medium">
                Error details
              </summary>
              <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for handling errors in functional components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error; // Will be caught by ErrorBoundary
    }
  }, [error]);

  return setError;
}
