import { ipcMain } from "electron";

import {
  getGroupedStats,
  filtrarPorMedida,
  calcDataForChart,
} from "../../service/chart";

import { MedidaData } from "../../../src/types/chart";

export function registerChartHandlers() {
  ipcMain.handle(
    "chart:getGroupedStats",
    async (_e, model: string, startDate?: string, endDate?: string) => {
      return await getGroupedStats(model, startDate, endDate);
    }
  );
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
