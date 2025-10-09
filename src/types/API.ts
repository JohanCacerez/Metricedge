import { SensorConfig } from "./sensors";
import {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  LoginResponse,
} from "./user";
import { Measurement } from "./measurement";
import { MedidaData, TendenciaResultado, Stat } from "./chart";

declare global {
  interface Window {
    electronAPI: {
      users: UserAPI;
      sensor: SensorAPI;
      measurements: MeasurementAPI;
      chart: ChartAPI;
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

export interface ChartAPI {
  getGroupedStats: (
    model: string,
    startDate?: string,
    endDate?: string
  ) => Promise<MedidaData[]>;
  filtrarPorMedida: (
    datos: MedidaData[],
    medida: string
  ) => Promise<MedidaData[]>;
  calcDataForChart: (
    datos: MedidaData[],
    LSE: number,
    LIE: number
  ) => Promise<any>;
  detectarTendencia: (datos: Stat[]) => Promise<TendenciaResultado>;
}
