import { ipcRenderer, contextBridge } from "electron";

import { AuthUser, LoginCredentials } from "../src/types/user";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("electronAPI", {
  users: {
    auth: (credentials: LoginCredentials) =>
      ipcRenderer.invoke("users:auth", credentials),
    create: (credentials: AuthUser) =>
      ipcRenderer.invoke("users:create", credentials),
    delete: (username: string) => ipcRenderer.invoke("users:delete", username),
  },
});
