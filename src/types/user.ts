// src/types/user.ts
export interface User {
  id: string;
  username: string;
  role: string;
}

export interface AuthUser {
  username: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  username?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}
