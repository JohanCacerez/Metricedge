import { create } from "zustand";
import { DataSensor } from "../types/sensors";

interface SensorState {
  activeSensor1: DataSensor | null;
  activeSensor2: DataSensor | null;
  setConfigSensor1: (dataSensor: DataSensor) => void;
  setConfigSensor2: (dataSensor: DataSensor) => void;
}

export const useSensorStore = create<SensorState>((set) => ({
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
}));
