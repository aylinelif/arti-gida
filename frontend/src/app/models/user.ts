export type UserRole = 'user' | 'business';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  profilePictureUrl?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
