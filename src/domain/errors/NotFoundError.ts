import { DomainError } from './DomainError';

export class NotFoundError extends DomainError {
  constructor(resource: string, id?: string | number) {
    const message = id 
      ? `${resource} com ID ${id} não encontrado`
      : `${resource} não encontrado`;
    super(message);
  }
}

