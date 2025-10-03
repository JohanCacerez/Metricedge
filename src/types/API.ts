import { SensorConfig } from "./sensors";
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
      sensor: SensorAPI;
    };
  }
}

export interface UserAPI {
  auth: (credentials: LoginCredentials) => Promise<LoginResponse>;
  create: (credentials: AuthUser) => Promise<AuthResponse>;
  delete: (username: string) => Promise<AuthResponse>;
  changePassword: (
    idUser: number,
    currentPassword: string,
    newPassword: string
  ) => Promise<AuthResponse>;
}

export interface SensorAPI {
  read: (config: SensorConfig) => Promise<number | string>;
}
