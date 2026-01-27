// Infrastructure
import { Logger, ILogger } from '@infrastructure/logging/Logger';
import { MentorRepository } from '@infrastructure/repositories/MentorRepository';
import { SessionRepository } from '@infrastructure/repositories/SessionRepository';
import { AuthRepository } from '@infrastructure/repositories/AuthRepository';
import { AvailabilityRepository } from '@infrastructure/repositories/AvailabilityRepository';
import { UserRepository } from '@infrastructure/repositories/UserRepository';

// Application Use Cases
import { ListMentorsUseCase } from '@application/use-cases/mentors/ListMentors.usecase';
import { GetMentorByIdUseCase } from '@application/use-cases/mentors/GetMentorById.usecase';
import { SearchMentorsUseCase } from '@application/use-cases/mentors/SearchMentors.usecase';
import { CreateMentorUseCase } from '@application/use-cases/mentors/CreateMentor.usecase';
import { UpdateMentorUseCase } from '@application/use-cases/mentors/UpdateMentor.usecase';
import { DeleteMentorUseCase } from '@application/use-cases/mentors/DeleteMentor.usecase';
import { CreateSessionUseCase } from '@application/use-cases/sessions/CreateSession.usecase';
import { CreateSessionAdminUseCase } from '@application/use-cases/sessions/CreateSessionAdmin.usecase';
import { RescheduleSessionUseCase } from '@application/use-cases/sessions/RescheduleSession.usecase';
import { ConfirmSessionUseCase } from '@application/use-cases/sessions/ConfirmSession.usecase';
import { CancelSessionUseCase } from '@application/use-cases/sessions/CancelSession.usecase';
import { ListUserSessionsUseCase } from '@application/use-cases/sessions/ListUserSessions.usecase';
import { ListUserSessionsAdminUseCase } from '@application/use-cases/sessions/ListUserSessionsAdmin.usecase';
import { GetSessionByIdUseCase } from '@application/use-cases/sessions/GetSessionById.usecase';
import { GetSessionSummaryUseCase } from '@application/use-cases/sessions/GetSessionSummary.usecase';
import { GetSessionTranscriptUseCase } from '@application/use-cases/sessions/GetSessionTranscript.usecase';
import { LoginUseCase } from '@application/use-cases/auth/Login.usecase';
import { RegisterUseCase } from '@application/use-cases/auth/Register.usecase';
import { RegisterWithRoleUseCase } from '@application/use-cases/auth/RegisterWithRole.usecase';
import { LogoutUseCase } from '@application/use-cases/auth/Logout.usecase';
import { GetMentorAvailabilityUseCase } from '@application/use-cases/availability/GetMentorAvailability.usecase';
import { CreateAvailabilityUseCase } from '@application/use-cases/availability/CreateAvailability.usecase';
import { UpdateAvailabilityUseCase } from '@application/use-cases/availability/UpdateAvailability.usecase';
import { DeleteAvailabilityUseCase } from '@application/use-cases/availability/DeleteAvailability.usecase';
import { ListUsersUseCase } from '@application/use-cases/users/ListUsers.usecase';
import { UpdateUserUseCase } from '@application/use-cases/users/UpdateUser.usecase';
import { DeleteUserUseCase } from '@application/use-cases/users/DeleteUser.usecase';
import { ListUserMentorsUseCase } from '@application/use-cases/users/ListUserMentors.usecase';
import { AssociateMentorUseCase } from '@application/use-cases/users/AssociateMentor.usecase';
import { RemoveMentorUseCase } from '@application/use-cases/users/RemoveMentor.usecase';
import { GetProfileUseCase } from '@application/use-cases/auth/GetProfile.usecase';

class Container {
  // Infrastructure
  private _logger: ILogger | null = null;
  private _mentorRepository: MentorRepository | null = null;
  private _sessionRepository: SessionRepository | null = null;
  private _authRepository: AuthRepository | null = null;
  private _availabilityRepository: AvailabilityRepository | null = null;
  private _userRepository: UserRepository | null = null;

  // Use Cases
  private _listMentorsUseCase: ListMentorsUseCase | null = null;
  private _getMentorByIdUseCase: GetMentorByIdUseCase | null = null;
  private _searchMentorsUseCase: SearchMentorsUseCase | null = null;
  private _createMentorUseCase: CreateMentorUseCase | null = null;
  private _updateMentorUseCase: UpdateMentorUseCase | null = null;
  private _deleteMentorUseCase: DeleteMentorUseCase | null = null;
  private _createSessionUseCase: CreateSessionUseCase | null = null;
  private _createSessionAdminUseCase: CreateSessionAdminUseCase | null = null;
  private _rescheduleSessionUseCase: RescheduleSessionUseCase | null = null;
  private _confirmSessionUseCase: ConfirmSessionUseCase | null = null;
  private _cancelSessionUseCase: CancelSessionUseCase | null = null;
  private _listUserSessionsUseCase: ListUserSessionsUseCase | null = null;
  private _listUserSessionsAdminUseCase: ListUserSessionsAdminUseCase | null = null;
  private _getSessionByIdUseCase: GetSessionByIdUseCase | null = null;
  private _getSessionSummaryUseCase: GetSessionSummaryUseCase | null = null;
  private _loginUseCase: LoginUseCase | null = null;
  private _registerUseCase: RegisterUseCase | null = null;
  private _registerWithRoleUseCase: RegisterWithRoleUseCase | null = null;
  private _logoutUseCase: LogoutUseCase | null = null;
  private _getMentorAvailabilityUseCase: GetMentorAvailabilityUseCase | null = null;
  private _createAvailabilityUseCase: CreateAvailabilityUseCase | null = null;
  private _updateAvailabilityUseCase: UpdateAvailabilityUseCase | null = null;
  private _deleteAvailabilityUseCase: DeleteAvailabilityUseCase | null = null;
  private _listUsersUseCase: ListUsersUseCase | null = null;
  private _updateUserUseCase: UpdateUserUseCase | null = null;
  private _deleteUserUseCase: DeleteUserUseCase | null = null;
  private _listUserMentorsUseCase: ListUserMentorsUseCase | null = null;
  private _associateMentorUseCase: AssociateMentorUseCase | null = null;
  private _removeMentorUseCase: RemoveMentorUseCase | null = null;
  private _getProfileUseCase: GetProfileUseCase | null = null;

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

  get userRepository(): UserRepository {
    if (!this._userRepository) {
      this._userRepository = new UserRepository(this.logger);
    }
    return this._userRepository;
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

  get createMentorUseCase(): CreateMentorUseCase {
    if (!this._createMentorUseCase) {
      this._createMentorUseCase = new CreateMentorUseCase(this.mentorRepository);
    }
    return this._createMentorUseCase;
  }

  get updateMentorUseCase(): UpdateMentorUseCase {
    if (!this._updateMentorUseCase) {
      this._updateMentorUseCase = new UpdateMentorUseCase(this.mentorRepository);
    }
    return this._updateMentorUseCase;
  }

  get deleteMentorUseCase(): DeleteMentorUseCase {
    if (!this._deleteMentorUseCase) {
      this._deleteMentorUseCase = new DeleteMentorUseCase(this.mentorRepository);
    }
    return this._deleteMentorUseCase;
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

  get createSessionAdminUseCase(): CreateSessionAdminUseCase {
    if (!this._createSessionAdminUseCase) {
      this._createSessionAdminUseCase = new CreateSessionAdminUseCase(
        this.sessionRepository,
        this.mentorRepository
      );
    }
    return this._createSessionAdminUseCase;
  }

  get rescheduleSessionUseCase(): RescheduleSessionUseCase {
    if (!this._rescheduleSessionUseCase) {
      this._rescheduleSessionUseCase = new RescheduleSessionUseCase(this.sessionRepository);
    }
    return this._rescheduleSessionUseCase;
  }

  get confirmSessionUseCase(): ConfirmSessionUseCase {
    if (!this._confirmSessionUseCase) {
      this._confirmSessionUseCase = new ConfirmSessionUseCase(this.sessionRepository);
    }
    return this._confirmSessionUseCase;
  }

  get cancelSessionUseCase(): CancelSessionUseCase {
    if (!this._cancelSessionUseCase) {
      this._cancelSessionUseCase = new CancelSessionUseCase(this.sessionRepository);
    }
    return this._cancelSessionUseCase;
  }

  get listUserSessionsUseCase(): ListUserSessionsUseCase {
    if (!this._listUserSessionsUseCase) {
      this._listUserSessionsUseCase = new ListUserSessionsUseCase(this.sessionRepository);
    }
    return this._listUserSessionsUseCase;
  }

  get listUserSessionsAdminUseCase(): ListUserSessionsAdminUseCase {
    if (!this._listUserSessionsAdminUseCase) {
      this._listUserSessionsAdminUseCase = new ListUserSessionsAdminUseCase(this.sessionRepository);
    }
    return this._listUserSessionsAdminUseCase;
  }

  get getSessionByIdUseCase(): GetSessionByIdUseCase {
    if (!this._getSessionByIdUseCase) {
      this._getSessionByIdUseCase = new GetSessionByIdUseCase(this.sessionRepository);
    }
    return this._getSessionByIdUseCase;
  }

  get getSessionSummaryUseCase(): GetSessionSummaryUseCase {
    if (!this._getSessionSummaryUseCase) {
      this._getSessionSummaryUseCase = new GetSessionSummaryUseCase(this.sessionRepository);
    }
    return this._getSessionSummaryUseCase;
  }

  get getSessionTranscriptUseCase(): GetSessionTranscriptUseCase {
    if (!this._getSessionTranscriptUseCase) {
      this._getSessionTranscriptUseCase = new GetSessionTranscriptUseCase(this.sessionRepository);
    }
    return this._getSessionTranscriptUseCase;
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

  get registerWithRoleUseCase(): RegisterWithRoleUseCase {
    if (!this._registerWithRoleUseCase) {
      this._registerWithRoleUseCase = new RegisterWithRoleUseCase(this.authRepository);
    }
    return this._registerWithRoleUseCase;
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

  get createAvailabilityUseCase(): CreateAvailabilityUseCase {
    if (!this._createAvailabilityUseCase) {
      this._createAvailabilityUseCase = new CreateAvailabilityUseCase(this.availabilityRepository);
    }
    return this._createAvailabilityUseCase;
  }

  get updateAvailabilityUseCase(): UpdateAvailabilityUseCase {
    if (!this._updateAvailabilityUseCase) {
      this._updateAvailabilityUseCase = new UpdateAvailabilityUseCase(this.availabilityRepository);
    }
    return this._updateAvailabilityUseCase;
  }

  get deleteAvailabilityUseCase(): DeleteAvailabilityUseCase {
    if (!this._deleteAvailabilityUseCase) {
      this._deleteAvailabilityUseCase = new DeleteAvailabilityUseCase(this.availabilityRepository);
    }
    return this._deleteAvailabilityUseCase;
  }

  get listUsersUseCase(): ListUsersUseCase {
    if (!this._listUsersUseCase) {
      this._listUsersUseCase = new ListUsersUseCase(this.userRepository);
    }
    return this._listUsersUseCase;
  }

  get updateUserUseCase(): UpdateUserUseCase {
    if (!this._updateUserUseCase) {
      this._updateUserUseCase = new UpdateUserUseCase(this.userRepository);
    }
    return this._updateUserUseCase;
  }

  get deleteUserUseCase(): DeleteUserUseCase {
    if (!this._deleteUserUseCase) {
      this._deleteUserUseCase = new DeleteUserUseCase(this.userRepository);
    }
    return this._deleteUserUseCase;
  }

  get listUserMentorsUseCase(): ListUserMentorsUseCase {
    if (!this._listUserMentorsUseCase) {
      this._listUserMentorsUseCase = new ListUserMentorsUseCase(this.userRepository);
    }
    return this._listUserMentorsUseCase;
  }

  get associateMentorUseCase(): AssociateMentorUseCase {
    if (!this._associateMentorUseCase) {
      this._associateMentorUseCase = new AssociateMentorUseCase(this.userRepository);
    }
    return this._associateMentorUseCase;
  }

  get removeMentorUseCase(): RemoveMentorUseCase {
    if (!this._removeMentorUseCase) {
      this._removeMentorUseCase = new RemoveMentorUseCase(this.userRepository);
    }
    return this._removeMentorUseCase;
  }

  get getProfileUseCase(): GetProfileUseCase {
    if (!this._getProfileUseCase) {
      this._getProfileUseCase = new GetProfileUseCase(this.authRepository);
    }
    return this._getProfileUseCase;
  }
}

export const container = new Container();

