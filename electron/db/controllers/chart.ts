import { ipcMain } from "electron";

import {
  getGroupedStats,
  filtrarPorMedida,
  calcDataForChart,
} from "../../service/chart";

import { MedidaData } from "../../../src/types/chart";

export function registerChartHandlers() {
  ipcMain.handle("chart:getGroupedStats", async (_e, model: string) => {
    return await getGroupedStats(model);
  });
  ipcMain.handle(
    "chart:filtrarPorMedida",
    async (_e, datos: MedidaData[], medida: string) => {
      return await filtrarPorMedida(datos, medida);
    }
  );
  ipcMain.handle(
    "chart:calcDataForChart",
    async (_e, datos: MedidaData[], LSE: number, LIE: number) => {
      return await calcDataForChart(datos, LSE, LIE);
    }
  );
}
