import { create } from "zustand";
import { DataSensor, SensorConfig } from "../types/sensors";

interface SensorState {
  activeSensor1: DataSensor | null;
  activeSensor2: DataSensor | null;

  // Configuración de sensores
  setConfigSensor1: (dataSensor: DataSensor) => void;
  setConfigSensor2: (dataSensor: DataSensor) => void;

  // Lectura del sensor
  read: (config: SensorConfig) => Promise<number | string>;

  // Para controlar inputs y sensores
  values: string[]; // valores de los inputs
  activeIndex: number; // índice del input activo
  currentSensor: 1 | 2; // sensor actual (1 o 2)

  // Acciones sobre los inputs
  setValues: (vals: string[]) => void; // actualizar valores manualmente
  nextInput: () => void; // avanzar al siguiente input
  resetInputs: (numInputs: number) => void; // reiniciar valores e índice
}

export const useSensorStore = create<SensorState>((set, get) => ({
  activeSensor1: JSON.parse(localStorage.getItem("sensor1") || "null"),
  activeSensor2: JSON.parse(localStorage.getItem("sensor2") || "null"),

  setConfigSensor1: (dataSensor: DataSensor) => {
    localStorage.setItem("sensor1", JSON.stringify(dataSensor));
    set({ activeSensor1: dataSensor });
  },
  setConfigSensor2: (dataSensor: DataSensor) => {
    localStorage.setItem("sensor2", JSON.stringify(dataSensor));
    set({ activeSensor2: dataSensor });
  },

  read: async (config: SensorConfig) => {
    return window.electronAPI.sensor.read(config);
  },

  // Nuevo estado para inputs
  values: [],
  activeIndex: 0,
  currentSensor: 1,

  setValues: (vals) => set({ values: vals }),

  nextInput: (modelId?: string) => {
    const { activeIndex, values, currentSensor } = get();
    const lastIndex = values.length - 1;
    const nextIndex = Math.min(activeIndex + 1, lastIndex);

    // Cambiar a sensor 2 solo si es modelo rear y estamos en el último input
    if (
      (modelId === "rear-lh" || modelId === "rear-rh") &&
      activeIndex === lastIndex &&
      currentSensor === 1
    ) {
      set({ currentSensor: 2 });
    }

    set({ activeIndex: nextIndex });
  },
  resetInputs: (numInputs: number) => {
    set({
      values: Array(numInputs).fill(""),
      activeIndex: 0,
      currentSensor: 1,
    });
  },
}));
