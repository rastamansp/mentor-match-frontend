// Infrastructure
import { Logger, ILogger } from '@infrastructure/logging/Logger';
import { MentorRepository } from '@infrastructure/repositories/MentorRepository';
import { SessionRepository } from '@infrastructure/repositories/SessionRepository';
import { AuthRepository } from '@infrastructure/repositories/AuthRepository';
import { AvailabilityRepository } from '@infrastructure/repositories/AvailabilityRepository';

// Application Use Cases
import { ListMentorsUseCase } from '@application/use-cases/mentors/ListMentors.usecase';
import { GetMentorByIdUseCase } from '@application/use-cases/mentors/GetMentorById.usecase';
import { SearchMentorsUseCase } from '@application/use-cases/mentors/SearchMentors.usecase';
import { CreateSessionUseCase } from '@application/use-cases/sessions/CreateSession.usecase';
import { ListUserSessionsUseCase } from '@application/use-cases/sessions/ListUserSessions.usecase';
import { GetSessionByIdUseCase } from '@application/use-cases/sessions/GetSessionById.usecase';
import { LoginUseCase } from '@application/use-cases/auth/Login.usecase';
import { RegisterUseCase } from '@application/use-cases/auth/Register.usecase';
import { LogoutUseCase } from '@application/use-cases/auth/Logout.usecase';
import { GetMentorAvailabilityUseCase } from '@application/use-cases/availability/GetMentorAvailability.usecase';

class Container {
  // Infrastructure
  private _logger: ILogger | null = null;
  private _mentorRepository: MentorRepository | null = null;
  private _sessionRepository: SessionRepository | null = null;
  private _authRepository: AuthRepository | null = null;
  private _availabilityRepository: AvailabilityRepository | null = null;

  // Use Cases
  private _listMentorsUseCase: ListMentorsUseCase | null = null;
  private _getMentorByIdUseCase: GetMentorByIdUseCase | null = null;
  private _searchMentorsUseCase: SearchMentorsUseCase | null = null;
  private _createSessionUseCase: CreateSessionUseCase | null = null;
  private _listUserSessionsUseCase: ListUserSessionsUseCase | null = null;
  private _getSessionByIdUseCase: GetSessionByIdUseCase | null = null;
  private _loginUseCase: LoginUseCase | null = null;
  private _registerUseCase: RegisterUseCase | null = null;
  private _logoutUseCase: LogoutUseCase | null = null;
  private _getMentorAvailabilityUseCase: GetMentorAvailabilityUseCase | null = null;

  // Infrastructure Getters
  get logger(): ILogger {
    if (!this._logger) {
      this._logger = new Logger();
    }
    return this._logger;
  }

  get mentorRepository(): MentorRepository {
    if (!this._mentorRepository) {
      this._mentorRepository = new MentorRepository(this.logger);
    }
    return this._mentorRepository;
  }

  get sessionRepository(): SessionRepository {
    if (!this._sessionRepository) {
      this._sessionRepository = new SessionRepository(this.logger);
    }
    return this._sessionRepository;
  }

  get authRepository(): AuthRepository {
    if (!this._authRepository) {
      this._authRepository = new AuthRepository(this.logger);
    }
    return this._authRepository;
  }

  get availabilityRepository(): AvailabilityRepository {
    if (!this._availabilityRepository) {
      this._availabilityRepository = new AvailabilityRepository(this.logger);
    }
    return this._availabilityRepository;
  }

  // Use Cases Getters
  get listMentorsUseCase(): ListMentorsUseCase {
    if (!this._listMentorsUseCase) {
      this._listMentorsUseCase = new ListMentorsUseCase(this.mentorRepository);
    }
    return this._listMentorsUseCase;
  }

  get getMentorByIdUseCase(): GetMentorByIdUseCase {
    if (!this._getMentorByIdUseCase) {
      this._getMentorByIdUseCase = new GetMentorByIdUseCase(this.mentorRepository);
    }
    return this._getMentorByIdUseCase;
  }

  get searchMentorsUseCase(): SearchMentorsUseCase {
    if (!this._searchMentorsUseCase) {
      this._searchMentorsUseCase = new SearchMentorsUseCase(this.mentorRepository);
    }
    return this._searchMentorsUseCase;
  }

  get createSessionUseCase(): CreateSessionUseCase {
    if (!this._createSessionUseCase) {
      this._createSessionUseCase = new CreateSessionUseCase(
        this.sessionRepository,
        this.mentorRepository
      );
    }
    return this._createSessionUseCase;
  }

  get listUserSessionsUseCase(): ListUserSessionsUseCase {
    if (!this._listUserSessionsUseCase) {
      this._listUserSessionsUseCase = new ListUserSessionsUseCase(this.sessionRepository);
    }
    return this._listUserSessionsUseCase;
  }

  get getSessionByIdUseCase(): GetSessionByIdUseCase {
    if (!this._getSessionByIdUseCase) {
      this._getSessionByIdUseCase = new GetSessionByIdUseCase(this.sessionRepository);
    }
    return this._getSessionByIdUseCase;
  }

  get loginUseCase(): LoginUseCase {
    if (!this._loginUseCase) {
      this._loginUseCase = new LoginUseCase(this.authRepository);
    }
    return this._loginUseCase;
  }

  get registerUseCase(): RegisterUseCase {
    if (!this._registerUseCase) {
      this._registerUseCase = new RegisterUseCase(this.authRepository);
    }
    return this._registerUseCase;
  }

  get logoutUseCase(): LogoutUseCase {
    if (!this._logoutUseCase) {
      this._logoutUseCase = new LogoutUseCase(this.authRepository);
    }
    return this._logoutUseCase;
  }

  get getMentorAvailabilityUseCase(): GetMentorAvailabilityUseCase {
    if (!this._getMentorAvailabilityUseCase) {
      this._getMentorAvailabilityUseCase = new GetMentorAvailabilityUseCase(this.availabilityRepository);
    }
    return this._getMentorAvailabilityUseCase;
  }
}

export const container = new Container();

