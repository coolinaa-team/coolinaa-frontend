export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  role?: UserRole;
  createdAt?: string;
}
