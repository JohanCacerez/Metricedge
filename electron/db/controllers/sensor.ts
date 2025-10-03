import { ipcMain } from "electron";
import { readSensor } from "../../service/sensor";
import { SensorConfig } from "../../../src/types/sensors";

export function registerSensorHandlers() {
  ipcMain.handle("sensor:read", (_e, config: SensorConfig) => {
    return readSensor(config);
  });
}
