import { app, ipcMain, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import { createRequire } from "module";
import path from "path";
const require$1 = createRequire(import.meta.url);
const Database = require$1("better-sqlite3");
const bcrypt$1 = require$1("bcrypt");
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
  const hashedPassword = bcrypt$1.hashSync(defaultPassword, saltRounds);
  db.prepare(
    "INSERT INTO users (nombre, contrasena, rol) VALUES (?, ?, ?)"
  ).run(defaultUsername, hashedPassword, "admin");
}
const require2 = createRequire(import.meta.url);
const bcrypt = require2("bcrypt");
async function Auth(credentials) {
  const { username, password } = credentials;
  try {
    if (!username || !password) {
      return { success: false, message: "Debes de llenar todos los campos" };
    }
    const userExist = db.prepare("SELECT * FROM users WHERE nombre = ?").get(username);
    if (!userExist || !await bcrypt.compare(password, userExist.contrasena)) {
      return { success: false, message: "Usuario o contraseña incorrectos" };
    }
    return {
      success: true,
      message: "Usuario autenticado con éxito",
      user: {
        id: userExist.id,
        username: userExist.nombre,
        role: userExist.rol
      }
    };
  } catch (err) {
    return { success: false, message: "Error de conexión" };
  }
}
async function addUser(credentials) {
  const { username, password, role } = credentials;
  try {
    if (!username || !password || !role) {
      return { success: false, message: "Debes de llenar todos los campos" };
    }
    const userExist = db.prepare("SELECT * FROM users WHERE nombre = ?").get(username);
    if (userExist) {
      return { success: false, message: "Ya existe un usuario con ese nombre" };
    }
    if (password.length < 6) {
      return {
        success: false,
        message: "La contraseña debe tener minimo 6 caracteres"
      };
    }
    const passwordHash = await bcrypt.hash(password, 10);
    db.prepare(
      "INSERT INTO users (nombre, contrasena, rol) VALUES (?, ?, ?)"
    ).run(username, passwordHash, role);
    return {
      success: true,
      message: "Usuario creado con éxito",
      username
    };
  } catch (err) {
    return { success: false, message: `Error al crear el usuario: ${err}` };
  }
}
async function deleteUser(username) {
  try {
    if (!username) {
      return { success: false, message: "Debes de llenar todos los campos" };
    }
    const userExist = db.prepare("SELECT * FROM users WHERE nombre = ?").get(username);
    if (!userExist) {
      return { success: false, message: "No existe ese usuario" };
    }
    db.prepare("DELETE FROM users WHERE nombre = ?").run(username);
    return {
      success: true,
      message: "Usuario eliminado con éxito",
      username
    };
  } catch (err) {
    return { success: false, message: `Error al eliminar el usuario: ${err}` };
  }
}
function registerUserHandlers() {
  ipcMain.handle(
    "users:auth",
    (_e, credentials) => Auth(credentials)
  );
  ipcMain.handle(
    "users:create",
    (_e, credentials) => addUser(credentials)
  );
  ipcMain.handle(
    "users:delete",
    (_e, username) => deleteUser(username)
  );
}
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
app.whenReady().then(() => {
  registerUserHandlers();
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
