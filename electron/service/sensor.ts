import { join } from "path";
import { exec } from "child_process";
import { app } from "electron";

import { SensorConfig } from "../../src/types/sensors";

const basePath = app.getPath("userData");

const sensorPath = join(basePath, "simulacion.py");

export const readSensor = async ({ port, mm, device, zero }: SensorConfig) => {
  return new Promise<number | string>((resolve) => {
    exec(
      `py "${sensorPath}" ${port} ${mm} ${device} ${zero}`,
      (error, stdout, stderr) => {
        if (error) {
          resolve(`Error: ${error.message}`);
        } else if (stderr) {
          resolve(`Error: ${stderr}`);
        } else {
          // Extraemos solo el valor de la lectura como texto
          const match = stdout.match(/Lectura:\s*([\d.]+)/);
          if (match) {
            resolve(match[1]); // texto del número
          } else {
            resolve(stdout.trim()); // cualquier otro texto
          }
        }
      }
    );
  });
};
