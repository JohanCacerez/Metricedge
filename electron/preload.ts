import { ipcRenderer, contextBridge } from "electron";

import { AuthUser, LoginCredentials } from "../src/types/user";
import { SensorConfig } from "../src/types/sensors";
import { Measurement } from "../src/types/measurement";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("electronAPI", {
  users: {
    auth: (credentials: LoginCredentials) =>
      ipcRenderer.invoke("users:auth", credentials),
    create: (credentials: AuthUser) =>
      ipcRenderer.invoke("users:create", credentials),
    delete: (username: string) => ipcRenderer.invoke("users:delete", username),
    changePassword: (
      idUser: number,
      currentPassword: string,
      newPassword: string
    ) =>
      ipcRenderer.invoke(
        "users:changePassword",
        idUser,
        currentPassword,
        newPassword
      ),
  },
  sensor: {
    read: (config: SensorConfig) => ipcRenderer.invoke("sensor:read", config),
  },
  measurements: {
    save: (measurement: Measurement) =>
      ipcRenderer.invoke("measurements:save", measurement),
  },
});
