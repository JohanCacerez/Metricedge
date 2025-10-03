import { join } from "path";
import { exec } from "child_process";
import { app } from "electron";

import { SensorConfig } from "../../src/types/sensors";

const basePath = app.getPath("userData");

const sensorPath = join(basePath, "simulacion.py");

export const readSensor = async ({ port, mm, zero, device }: SensorConfig) => {
  return new Promise<number | string>((resolve) => {
    exec(
      `py "${sensorPath}" ${port} ${mm} ${zero} ${device} `,
      (error, stdout, stderr) => {
        if (error) {
          resolve(`Error: ${error.message}`);
        } else if (stderr) {
          resolve(`Error: ${stderr}`);
        } else {
          // Extraemos solo el valor de la lectura como texto
          const match = stdout.match(/Lectura:\s*([\d.]+)/);
          if (match) {
            console.log(match[1]);
            resolve(match[1]); // texto del número
          } else {
            resolve(stdout.trim()); // cualquier otro texto
          }
        }
      }
    );
  });
};
