import { User } from '../entities/User.entity';
import { UserMentor } from '../entities/UserMentor.entity';

export interface UpdateUserCredentials {
  name: string;
  email: string;
  phone: string;
  role?: 'USER' | 'ADMIN' | 'MENTOR';
}

export interface IUserRepository {
  findAll(): Promise<User[]>;
  update(id: string, data: UpdateUserCredentials): Promise<User>;
  delete(id: string): Promise<void>;
  listUserMentors(userId: string, status?: 'ACTIVE' | 'INACTIVE'): Promise<UserMentor[]>;
  associateMentor(userId: string, mentorId: string, subscriptionId?: string): Promise<UserMentor>;
  removeMentor(userId: string, mentorId: string): Promise<void>;
}
