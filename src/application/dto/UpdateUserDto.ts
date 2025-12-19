export interface UpdateUserDto {
  name: string;
  email: string;
  phone: string;
  role?: 'USER' | 'ADMIN' | 'MENTOR';
}
