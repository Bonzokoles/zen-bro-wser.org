/*
 * WORKING VERSION
 * Original: src/original/utils/error-handler.ts
 * Started: 2025-11-03
 * Status: IN_PROGRESS
 *
 * Changes:
 * - (Add your changes here)
 */

/**
 * Error Handling System
 *
 * Centralized error handling with user-friendly messages
 */

import toast from 'react-hot-toast';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class APIError extends AppError {
  constructor(
    message: string,
    public statusCode: number,
    userMessage: string,
    details?: any
  ) {
    super(message, `API_ERROR_${statusCode}`, userMessage, details);
    this.name = 'APIError';
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public field?: string,
    userMessage?: string
  ) {
    super(
      message,
      'VALIDATION_ERROR',
      userMessage || `Invalid ${field || 'input'}`,
      { field }
    );
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      'NETWORK_ERROR',
      'Network error. Please check your connection.',
      details
    );
    this.name = 'NetworkError';
  }
}

// Error notification function using react-hot-toast
const showNotification = (message: string, type: 'error' | 'success' | 'warning' | 'info') => {
  switch (type) {
    case 'error':
      toast.error(message);
      break;
    case 'success':
      toast.success(message);
      break;
    case 'warning':
      toast(message, {
        icon: '⚠️',
        style: {
          background: '#f59e0b',
          color: '#ffffff',
        },
      });
      break;
    case 'info':
      toast(message, {
        icon: 'ℹ️',
        style: {
          background: '#3b82f6',
          color: '#ffffff',
        },
      });
      break;
  }
};

// Allow custom notification handler override if needed
let showNotificationFn = showNotification;

export function setNotificationHandler(
  handler: (message: string, type: 'error' | 'success' | 'warning' | 'info') => void
) {
  showNotificationFn = handler;
}

export function handleError(error: unknown, context?: string) {
  console.error(`[Error${context ? ` in ${context}` : ''}]:`, error);

  if (error instanceof AppError) {
    showNotificationFn(error.userMessage, 'error');

    // Log technical details
    console.error(`[${error.code}]`, error.message, error.details);

    // Send to error tracking service (optional)
    reportError(error);
  } else if (error instanceof Error) {
    showNotificationFn('Something went wrong. Please try again.', 'error');
    console.error(error);

    reportError(error);
  } else {
    showNotificationFn('An unexpected error occurred.', 'error');
    console.error('Unknown error:', error);
  }
}

function reportError(error: Error) {
  // In production, send to Sentry or similar
  // For now, just log
  const errorReport = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  console.log('[Error Report]', errorReport);

  // Could send to backend:
  // fetch('/api/errors', {
  //   method: 'POST',
  //   body: JSON.stringify(errorReport)
  // });
}

/**
 * Async error wrapper
 * Automatically handles errors in async functions
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  }) as T;
}

/**
 * React error boundary compatible handler
 */
export function handleReactError(error: Error, errorInfo: { componentStack: string }) {
  console.error('React Error:', error, errorInfo);

  showNotificationFn(
    'A component error occurred. The page may not work correctly.',
    'error'
  );

  reportError(error);
}

/**
 * Specific error handlers for common scenarios
 */

export function handleApiError(response: Response, context?: string): never {
  const statusHandlers: Record<number, () => AppError> = {
    400: () => new APIError(
      'Bad Request',
      400,
      'Invalid request. Please check your input.',
      { url: response.url }
    ),
    401: () => new APIError(
      'Unauthorized',
      401,
      'Authentication failed. Please check your API key.',
      { url: response.url }
    ),
    403: () => new APIError(
      'Forbidden',
      403,
      'Access denied.',
      { url: response.url }
    ),
    404: () => new APIError(
      'Not Found',
      404,
      'Resource not found.',
      { url: response.url }
    ),
    429: () => new APIError(
      'Rate Limit Exceeded',
      429,
      'Too many requests. Please wait a moment.',
      { url: response.url, retryAfter: response.headers.get('retry-after') }
    ),
    500: () => new APIError(
      'Internal Server Error',
      500,
      'Server error. Please try again later.',
      { url: response.url }
    ),
    503: () => new APIError(
      'Service Unavailable',
      503,
      'Service temporarily unavailable. Please try again later.',
      { url: response.url }
    )
  };

  const error = statusHandlers[response.status]?.() ||
    new APIError(
      `HTTP ${response.status}`,
      response.status,
      `Request failed with status ${response.status}`,
      { url: response.url }
    );

  handleError(error, context);
  throw error;
}

export function handleNetworkError(error: unknown, context?: string): never {
  const networkError = new NetworkError(
    error instanceof Error ? error.message : 'Network request failed',
    { originalError: error }
  );

  handleError(networkError, context);
  throw networkError;
}

export function handleValidationError(field: string, message?: string): never {
  const error = new ValidationError(message || `Validation failed for ${field}`, field);

  handleError(error);
  throw error;
}

/**
 * Safe fetch wrapper with automatic error handling
 */
export async function safeFetch(url: string, options?: RequestInit, context?: string): Promise<Response> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      handleApiError(response, context);
    }

    return response;
  } catch (error) {
    if (error instanceof AppError) {
      throw error; // Already handled
    }

    // Network error
    handleNetworkError(error, context);
  }
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    onRetry
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        break;
      }

      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);

      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
