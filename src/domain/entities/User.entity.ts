import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['USER', 'ORGANIZER', 'ADMIN']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type User = z.infer<typeof UserSchema>

export class UserEntity {
  constructor(private readonly data: User) {}

  get id(): string { return this.data.id }
  get name(): string { return this.data.name }
  get email(): string { return this.data.email }
  get phone(): string | undefined { return this.data.phone }
  get role(): string { return this.data.role }
  get createdAt(): string { return this.data.createdAt }
  get updatedAt(): string { return this.data.updatedAt }

  isAdmin(): boolean {
    return this.data.role === 'ADMIN'
  }

  isOrganizer(): boolean {
    return this.data.role === 'ORGANIZER'
  }

  isUser(): boolean {
    return this.data.role === 'USER'
  }

  canCreateEvents(): boolean {
    return this.isAdmin() || this.isOrganizer()
  }

  canManageUsers(): boolean {
    return this.isAdmin()
  }

  toJSON(): User {
    return this.data
  }
}
