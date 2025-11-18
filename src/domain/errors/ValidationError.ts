import { DomainError } from './DomainError';

export class ValidationError extends DomainError {
  constructor(message: string, public readonly errors?: Record<string, string[]>) {
    super(message);
  }
}

