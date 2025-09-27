import {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  LoginResponse,
} from "./user";

declare global {
  interface Window {
    electronAPI: {
      users: UserAPI;
    };
  }
}

export interface UserAPI {
  auth: (credentials: LoginCredentials) => Promise<LoginResponse>;
  create: (credentials: AuthUser) => Promise<AuthResponse>;
}
