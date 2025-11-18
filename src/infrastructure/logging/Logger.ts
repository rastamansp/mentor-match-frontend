export interface ILogger {
  info(message: string, data?: unknown): void;
  error(message: string, error?: Error | unknown): void;
  warn(message: string, data?: unknown): void;
  debug(message: string, data?: unknown): void;
}

export class Logger implements ILogger {
  info(message: string, data?: unknown): void {
    console.log(`[INFO] ${message}`, data || '');
  }

  error(message: string, error?: Error | unknown): void {
    console.error(`[ERROR] ${message}`, error || '');
  }

  warn(message: string, data?: unknown): void {
    console.warn(`[WARN] ${message}`, data || '');
  }

  debug(message: string, data?: unknown): void {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
}

