import { SensorConfig } from "./sensors";
import {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  LoginResponse,
} from "./user";
import { Measurement } from "./measurement";

declare global {
  interface Window {
    electronAPI: {
      users: UserAPI;
      sensor: SensorAPI;
      measurements: MeasurementAPI;
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

export interface MeasurementAPI {
  save: (
    measurement: Measurement
  ) => Promise<{ success: boolean; message: string }>;
}
