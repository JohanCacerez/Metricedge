"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  users: {
    auth: (credentials) => electron.ipcRenderer.invoke("users:auth", credentials)
  }
});
