import { app, BrowserWindow } from "electron";
import { createRequire as createRequire$1 } from "node:module";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import { createRequire } from "module";
import path from "path";
const require2 = createRequire(import.meta.url);
const Database = require2("better-sqlite3");
const bcrypt = require2("bcrypt");
function initDB() {
  const dbPath = path.join(app.getPath("userData"), "database.sqlite");
  const db = new Database(dbPath);
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    contrasena TEXT NOT NULL,
    rol TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS modelos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS mediciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    modelo_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    medida1 REAL NOT NULL,
    medida2 REAL NOT NULL,
    medida3 REAL,
    medida4 REAL,
    FOREIGN KEY (modelo_id) REFERENCES modelos(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
`);
  const modelos = ["rear_lh", "rear_rh", "front_lh", "front_rh"];
  const insertModelo = db.prepare(
    "INSERT OR IGNORE INTO modelos (nombre) VALUES (?)"
  );
  modelos.forEach((modelo) => insertModelo.run(modelo));
  const adminExists = db.prepare("SELECT COUNT(*) as count FROM users WHERE rol = 'admin'").get();
  if (adminExists.count === 0) {
    const defaultUsername = "admin";
    const defaultPassword = "admin123";
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(defaultPassword, saltRounds);
    db.prepare(
      "INSERT INTO users (nombre, contrasena, rol) VALUES (?, ?, ?)"
    ).run(defaultUsername, hashedPassword, "admin");
    console.log("Usuario admin creado: admin / admin123 (contraseña hasheada)");
  }
}
initDB();
createRequire$1(import.meta.url);
const __dirname = path$1.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
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
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
