import { ipcMain } from "electron";

import { saveMeasurements } from "../../service/measure";
import { Measurement } from "../../../src/types/measurement";

export function registerMeasurementHandlers() {
  ipcMain.handle("measurements:save", async (_e, measurement: Measurement) => {
    return await saveMeasurements(measurement);
  });
}
