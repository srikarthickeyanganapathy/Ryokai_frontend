// Simple logging abstraction as per Phase 1 requirements
const isDevelopment = import.meta.env?.MODE === 'development'

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  error: (...args) => {
    // In Phase 3/4, this will send to Sentry or Datadog
    console.error(...args)
  },
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args)
    }
  }
}
