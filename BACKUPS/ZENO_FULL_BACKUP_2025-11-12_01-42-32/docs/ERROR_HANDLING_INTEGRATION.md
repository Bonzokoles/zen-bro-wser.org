# Error Handling Integration Guide

Guide for integrating the new error handling system with ZENO components and services.

## Overview

The new error handling system provides:
- **Custom error classes** (AppError, APIError, ValidationError, NetworkError)
- **Centralized error handler** with user-friendly toast notifications
- **React Error Boundary** for component error catching
- **Safe fetch wrapper** with automatic error handling
- **Retry logic** with exponential backoff

## Integration Steps

### Step 1: Service Layer Integration

**Before (Current Pattern):**
```typescript
// src/services/mcpService.ts
async initialize(config: MCPServiceConfig): Promise<boolean> {
  try {
    // ... initialization code ...
    return true;
  } catch (error) {
    console.error('MCP Service initialization failed:', error);
    this.currentProvider = null;
    this.session = null;
    return false;
  }
}
```

**After (With Error Handling):**
```typescript
// src/services/mcpService.ts
import { handleError, APIError, ValidationError, withErrorHandling } from '../utils/error-handler';

async initialize(config: MCPServiceConfig): Promise<boolean> {
  try {
    // Validate config
    if (!config.apiKey) {
      throw new ValidationError(
        'API key is required',
        'apiKey',
        'Please provide a valid API key in settings'
      );
    }

    // ... initialization code ...

    // Test connection with better error handling
    const isConnected = await this.currentProvider.testConnection();
    if (!isConnected) {
      throw new APIError(
        `Connection test failed for ${config.provider}`,
        401,
        'Failed to connect to AI provider. Please check your API key.',
        { provider: config.provider }
      );
    }

    return true;
  } catch (error) {
    handleError(error, 'MCP Service Initialization');
    this.currentProvider = null;
    this.session = null;
    return false;
  }
}

// Use error handling wrapper for automatic error catching
async sendMessage(message: string, webContext?: WebContext): Promise<ChatMessage> {
  if (!this.currentProvider || !this.session) {
    throw new APIError(
      'MCP Service not initialized',
      503,
      'Service not ready. Please initialize first.',
      { hasProvider: !!this.currentProvider, hasSession: !!this.session }
    );
  }

  return withErrorHandling(async () => {
    const context = webContext
      ? `Current page: ${webContext.title} (${webContext.url})`
      : undefined;

    const response = await this.currentProvider!.sendMessage(message, context);

    // Add to session history
    this.session!.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    this.session!.messages.push(response);

    return response;
  }, 'Send Message')();
}
```

### Step 2: Network Request Integration

**Before:**
```typescript
const response = await fetch(url);
if (!response.ok) {
  throw new Error(`HTTP ${response.status}`);
}
```

**After:**
```typescript
import { safeFetch } from '../utils/error-handler';

// safeFetch automatically handles errors
const response = await safeFetch(url, options, 'Fetch User Data');
const data = await response.json();
```

### Step 3: Component Integration

**Main App Component:**
```tsx
// src/components/Browser.tsx
import { ErrorBoundary } from './ErrorBoundary';

export function Browser() {
  return (
    <ErrorBoundary
      fallback={
        <div className="error-container">
          <h2>Browser Error</h2>
          <p>The browser encountered an error. Please refresh.</p>
        </div>
      }
    >
      <div className="browser-container">
        <TabBar />
        <AddressBar />
        <WebView />
      </div>
    </ErrorBoundary>
  );
}
```

**Critical Components:**
```tsx
// Wrap individual critical components
export function ChatPanel() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Custom error logging for analytics
        console.log('ChatPanel error:', error, errorInfo);
      }}
    >
      {/* Chat panel content */}
    </ErrorBoundary>
  );
}
```

### Step 4: Hook Usage in Functional Components

```tsx
import { useErrorHandler } from './ErrorBoundary';

export function ChatPanel() {
  const setError = useErrorHandler();

  const handleSendMessage = async (message: string) => {
    try {
      const response = await mcpService.sendMessage(message);
      // Handle response
    } catch (error) {
      // This will be caught by the nearest ErrorBoundary
      setError(error as Error);
    }
  };

  return (
    // Component JSX
  );
}
```

### Step 5: Retry Logic for Flaky Operations

```typescript
import { retryWithBackoff } from '../utils/error-handler';

// Retry API calls with exponential backoff
const result = await retryWithBackoff(
  () => safeFetch('/api/data'),
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt} after error:`, error.message);
    }
  }
);
```

## Migration Checklist

### Services to Update
- [ ] `src/services/mcpService.ts` - Main MCP service
- [ ] `src/services/aiProviders/gemini.ts` - Gemini provider
- [ ] `src/services/aiProviders/openrouter.ts` - OpenRouter provider
- [ ] `src/services/toolExecutionService.ts` - Tool execution

### Components to Wrap
- [ ] `src/components/Browser.tsx` - Main browser
- [ ] `src/components/ChatPanel.tsx` - Chat interface
- [ ] `src/components/SimpleBrowser.tsx` - Simple browser
- [ ] `src/components/MCPConsole.tsx` - MCP console

### Common Error Scenarios

#### API Connection Errors
```typescript
// Detect network errors vs API errors
try {
  const response = await safeFetch(url);
} catch (error) {
  if (error instanceof NetworkError) {
    // Handle network issues (offline, timeout)
  } else if (error instanceof APIError) {
    // Handle API errors (401, 403, 500, etc.)
  }
}
```

#### Validation Errors
```typescript
import { handleValidationError } from '../utils/error-handler';

function validateConfig(config: MCPServiceConfig) {
  if (!config.apiKey) {
    handleValidationError('apiKey', 'API key is required');
  }
  if (!config.provider) {
    handleValidationError('provider', 'Provider must be selected');
  }
}
```

#### Rate Limiting
```typescript
// APIError automatically handles retry-after headers
try {
  const response = await safeFetch('/api/endpoint');
} catch (error) {
  if (error instanceof APIError && error.statusCode === 429) {
    const retryAfter = error.details?.retryAfter;
    // Show user when to retry
    console.log(`Rate limited. Retry after: ${retryAfter}`);
  }
}
```

## Testing Error Handling

### Unit Tests Example
```typescript
import { describe, it, expect, vi } from 'vitest';
import { handleError, APIError } from '../utils/error-handler';

describe('Error Handler', () => {
  it('should handle API errors', () => {
    const error = new APIError('Test error', 404, 'Not found');
    expect(() => handleError(error)).not.toThrow();
  });

  it('should call notification handler', () => {
    const mockHandler = vi.fn();
    setNotificationHandler(mockHandler);

    handleError(new Error('Test'));
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

### Integration Testing
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

it('should catch component errors', async () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  await waitFor(() => {
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
```

## Best Practices

### DO:
- ✅ Use specific error classes (APIError, ValidationError, etc.)
- ✅ Provide user-friendly messages in `userMessage`
- ✅ Include context in error details for debugging
- ✅ Wrap critical components in ErrorBoundary
- ✅ Use safeFetch for all network requests
- ✅ Handle errors at appropriate abstraction level

### DON'T:
- ❌ Swallow errors silently
- ❌ Use generic Error for API/network issues
- ❌ Show technical errors to end users
- ❌ Forget to log errors for debugging
- ❌ Skip validation before API calls

## Next Steps

1. **Phase 1**: Update all services to use new error classes
2. **Phase 2**: Wrap critical components in ErrorBoundary
3. **Phase 3**: Replace all fetch calls with safeFetch
4. **Phase 4**: Add retry logic for flaky operations
5. **Phase 5**: Implement error tracking service (Sentry integration)

## Additional Resources

- [Error Handling System](../src/utils/error-handler.ts) - Core implementation
- [Error Boundary Component](../src/components/ErrorBoundary.tsx) - React integration
- [Toast Notifications](../src/components/Toaster.tsx) - User feedback
