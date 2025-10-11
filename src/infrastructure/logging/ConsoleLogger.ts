import { ILogger } from './ILogger'

export class ConsoleLogger implements ILogger {
  info(message: string, data?: Record<string, unknown>): void {
    console.log(`[INFO] ${message}`, data)
  }

  error(message: string, error?: Error, data?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}`, error, data)
  }

  warn(message: string, data?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, data)
  }

  debug(message: string, data?: Record<string, unknown>): void {
    console.debug(`[DEBUG] ${message}`, data)
  }
}
