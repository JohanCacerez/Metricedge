import { app, BrowserWindow, screen } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import "./db/index";
import { registerUserHandlers } from "./db/controllers/users";
import { registerSensorHandlers } from "./db/controllers/sensor";
import { registerMeasurementHandlers } from "./db/controllers/measurement";
import { registerChartHandlers } from "./db/controllers/chart";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

//test
// test de mediciones agrupadas
//import { getGroupedStats } from "./service/chart";

process.env.APP_ROOT = path.join(__dirname, "..");
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width, // ancho de la pantalla
    height, // alto de la pantalla
    resizable: false, // no se puede cambiar el tamaño
    minimizable: false, // no se puede minimizar
    maximizable: false, // no se puede maximizar
    frame: true, // mantiene los botones nativos
    autoHideMenuBar: true, // oculta barra de menú (Edit, View, etc.)
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ✅ Registrar handlers antes de crear ventanas
app.whenReady().then(() => {
  // Test de mediciones agrupadas
  /* const resultados = getGroupedStats("front-lh");
  console.log(JSON.stringify(resultados, null, 2)); */
  registerUserHandlers();
  registerSensorHandlers();
  registerMeasurementHandlers();
  registerChartHandlers();
  createWindow();
});
