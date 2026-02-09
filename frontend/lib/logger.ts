/**
 * Logger utility that only logs in development mode
 * Prevents verbose logs from appearing in production console
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },
  warn: (...args: any[]) => {
    // Always show warnings
    console.warn(...args)
  },
  error: (...args: any[]) => {
    // Always show errors
    console.error(...args)
  }
}
