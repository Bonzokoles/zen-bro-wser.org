export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'RATE_LIMIT'
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'TIMEOUT'
  | 'UNKNOWN';

export interface ErrorContext {
  endpoint?: string;
  statusCode?: number;
  retryAfter?: number;
  details?: Record<string, any>;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly userMessage: string;
  public readonly context?: ErrorContext;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode,
    userMessage: string,
    context?: ErrorContext
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
    this.context = context;
    this.timestamp = new Date();

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      userMessage: this.userMessage,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack
    };
  }
}

// Factory functions for common errors
export const createNetworkError = (details?: string): AppError => {
  return new AppError(
    `Network error: ${details || 'Connection failed'}`,
    'NETWORK_ERROR',
    'Unable to connect to the server. Please check your internet connection.',
    { details: { message: details } }
  );
};

export const createRateLimitError = (retryAfter?: number): AppError => {
  return new AppError(
    'Rate limit exceeded',
    'RATE_LIMIT',
    `Too many requests. Please wait ${retryAfter ? `${retryAfter} seconds` : 'a moment'} before trying again.`,
    { retryAfter }
  );
};

export const createAuthError = (endpoint?: string): AppError => {
  return new AppError(
    `Authentication failed for ${endpoint || 'API'}`,
    'AUTH_ERROR',
    'Invalid or missing API key. Please check your configuration.',
    { endpoint }
  );
};

export const createValidationError = (field: string, reason: string): AppError => {
  return new AppError(
    `Validation failed for ${field}: ${reason}`,
    'VALIDATION_ERROR',
    `Invalid input: ${reason}`,
    { details: { field, reason } }
  );
};

export const createTimeoutError = (endpoint?: string): AppError => {
  return new AppError(
    `Request timeout for ${endpoint || 'API'}`,
    'TIMEOUT',
    'The request took too long to complete. Please try again.',
    { endpoint }
  );
};

// Error handler utility
export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return createNetworkError(error.message);
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return createTimeoutError();
    }

    // Generic error
    return new AppError(
      error.message,
      'UNKNOWN',
      'An unexpected error occurred. Please try again.',
      { details: { originalError: error.message } }
    );
  }

  // Unknown error type
  return new AppError(
    'Unknown error',
    'UNKNOWN',
    'An unexpected error occurred. Please try again.'
  );
};

// Logging utility
export const logError = (error: AppError): void => {
  console.error('[AppError]', {
    code: error.code,
    message: error.message,
    userMessage: error.userMessage,
    context: error.context,
    timestamp: error.timestamp,
    stack: error.stack
  });
};
