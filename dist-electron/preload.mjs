"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  users: {
    auth: (credentials) => electron.ipcRenderer.invoke("users:auth", credentials),
    create: (credentials) => electron.ipcRenderer.invoke("users:create", credentials),
    delete: (username) => electron.ipcRenderer.invoke("users:delete", username),
    changePassword: (idUser, currentPassword, newPassword) => electron.ipcRenderer.invoke(
      "users:changePassword",
      idUser,
      currentPassword,
      newPassword
    )
  }
});
