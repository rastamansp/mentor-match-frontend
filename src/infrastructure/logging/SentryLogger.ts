import * as Sentry from '@sentry/react'
import { ILogger } from './ILogger'

export class SentryLogger implements ILogger {
  constructor(private isDevelopment: boolean) {
    if (!isDevelopment) {
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        integrations: [],
        tracesSampleRate: 1.0,
        environment: import.meta.env.MODE,
      })
    }
  }

  info(message: string, data?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, data)
    }
    Sentry.addBreadcrumb({
      message,
      level: 'info',
      data,
    })
  }

  error(message: string, error?: Error, data?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}`, error, data)
    Sentry.captureException(error, {
      contexts: { details: data },
      tags: { message },
    })
  }

  warn(message: string, data?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, data)
    }
    Sentry.captureMessage(message, {
      level: 'warning',
      contexts: { details: data },
    })
  }

  debug(message: string, data?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data)
    }
  }
}
