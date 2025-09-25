import { ipcRenderer, contextBridge } from "electron";

import { LoginCredentials } from "../src/types/user";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("electronAPI", {
  users: {
    auth: (credentials: LoginCredentials) =>
      ipcRenderer.invoke("users:auth", credentials),
  },
});
