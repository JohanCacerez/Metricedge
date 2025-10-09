import { create } from "zustand";
import { MedidaData, Stat, TendenciaResultado } from "../types/chart";

interface ChartState {
  refreshKey: number;
  triggerRefresh: () => void;
  getGroupedStats: (
    modeloId: string,
    startDate?: string,
    endDate?: string
  ) => Promise<MedidaData[]>;
  detectarTendencia: (datos: Stat[]) => Promise<TendenciaResultado>;
}

export const useChartStore = create<ChartState>((set) => ({
  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
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
  detectarTendencia: async (datos: Stat[]) => {
    try {
      const resultado = await window.electronAPI.chart.detectarTendencia(datos);
      return resultado;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error("Error detecting trend");
    }
  },
}));
