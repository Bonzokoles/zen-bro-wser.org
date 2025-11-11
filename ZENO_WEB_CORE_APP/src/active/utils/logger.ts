// src/active/utils/logger.ts
/**
 * Logger utility for development and production environments
 * Automatically disabled in production builds
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

export const logger = {
  /**
   * Log informational messages (only in development)
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log warnings (always shown)
   */
  warn: (...args: any[]) => {
    console.warn(...args);
  },

  /**
   * Log errors (always shown)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log informational messages with formatting
   */
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.info(`ℹ️ ${message}`, ...args);
    }
  },

  /**
   * Log success messages (only in development)
   */
  success: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`✅ ${message}`, ...args);
    }
  },

  /**
   * Create a logger group (only in development)
   */
  group: (label: string, callback: () => void) => {
    if (isDevelopment) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  },

  /**
   * Time a function execution (only in development)
   */
  time: (label: string, callback: () => void) => {
    if (isDevelopment) {
      console.time(label);
      callback();
      console.timeEnd(label);
    } else {
      callback();
    }
  },

  /**
   * Log table data (only in development)
   */
  table: (data: any) => {
    if (isDevelopment) {
      console.table(data);
    }
  }
};

// Export individual functions for convenience
export const { log, debug, warn, error, info, success, group, time, table } = logger;

export default logger;
