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
  },
  sensor: {
    read: (config) => electron.ipcRenderer.invoke("sensor:read", config)
  },
  measurements: {
    save: (measurement) => electron.ipcRenderer.invoke("measurements:save", measurement)
  },
  chart: {
    getGroupedStats: (model, startDate, endDate) => electron.ipcRenderer.invoke("chart:getGroupedStats", model, startDate, endDate),
    filtrarPorMedida: (datos, medida) => electron.ipcRenderer.invoke("chart:filtrarPorMedida", datos, medida),
    calcDataForChart: (datos, LSE, LIE) => electron.ipcRenderer.invoke("chart:calcDataForChart", datos, LSE, LIE),
    detectarTendencia: (datos) => electron.ipcRenderer.invoke("chart:detectarTendencia", datos)
  }
});
