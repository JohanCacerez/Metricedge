import { create } from "zustand";
import { Measurement } from "../types/measurement";

interface MeasurementState {
  measurements: Measurement[];
  saveMeasurement: (measurement: Measurement) => Promise<void>;
}

export const useMeasurementStore = create<MeasurementState>((set) => ({
  measurements: [],
  saveMeasurement: async (measurement: Measurement) => {
    try {
      const response = await window.electronAPI.measurements.save(measurement);
      if (response.success) {
        set((state) => ({
          measurements: [...state.measurements, measurement],
        }));
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error("Error saving measurement");
    }
  },
}));
