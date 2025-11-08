import { ipcMain } from "electron";

import { saveMeasurements, getMeasurements } from "../../service/measure";
import { Measurement } from "../../../src/types/measurement";

export function registerMeasurementHandlers() {
  ipcMain.handle("measurements:save", async (_e, measurement: Measurement) => {
    return await saveMeasurements(measurement);
  });
  ipcMain.handle(
    "measurements:getAll",
    async (_e, modeloId?: number, userId?: number) => {
      return await getMeasurements(modeloId, userId);
    }
  );
}
