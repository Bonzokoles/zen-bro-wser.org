/**
 * Toast Notification Component
 *
 * Wrapper for react-hot-toast with custom styling
 */

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        // Default options
        duration: 4000,

        // Styling
        style: {
          background: '#1f2937',
          color: '#f3f4f6',
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.875rem',
          maxWidth: '500px',
        },

        // Success toast styling
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#f3f4f6',
          },
        },

        // Error toast styling
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#f3f4f6',
          },
        },

        // Warning toast styling (custom type)
        loading: {
          iconTheme: {
            primary: '#f59e0b',
            secondary: '#f3f4f6',
          },
        },
      }}
    />
  );
}
