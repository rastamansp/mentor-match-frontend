import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { Session } from '@domain/entities/Session.entity';
import { ConfirmSessionDto } from '../../dto/ConfirmSessionDto';
import { validateConfirmSession } from '../../validators/ConfirmSessionValidator';

export class ConfirmSessionUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(sessionId: string, dto?: ConfirmSessionDto): Promise<Session> {
    // Se DTO fornecido, valida
    const validated = dto ? validateConfirmSession(dto) : undefined;

    // Confirma sessão
    return this.sessionRepository.confirm(sessionId, validated);
  }
}
