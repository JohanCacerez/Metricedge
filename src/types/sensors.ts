export interface DataSensor {
  puerto: number;
  tamaño: number;
  dispositivo: number;
}

export interface SensorConfig {
  port: string;
  mm: number;
  device: string;
  zero: number;
}
