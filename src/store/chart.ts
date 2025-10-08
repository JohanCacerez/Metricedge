import { create } from "zustand";
import { MedidaData } from "../types/chart";

interface ChartState {
  getGroupedStats: (
    modeloId: string,
    startDate?: string,
    endDate?: string
  ) => Promise<MedidaData[]>;
}

export const useChartStore = create<ChartState>(() => ({
  getGroupedStats: async (
    modeloId: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      const datos = await window.electronAPI.chart.getGroupedStats(
        modeloId,
        startDate,
        endDate
      );
      return datos;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error("Error fetching grouped stats");
    }
  },
}));
