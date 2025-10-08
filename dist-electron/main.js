import { app, ipcMain, BrowserWindow, screen } from "electron";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import { createRequire } from "module";
import path, { join } from "path";
import { exec } from "child_process";
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
    fecha TIMESTAMP DEFAULT (datetime('now','localtime')),
    medida1 REAL NOT NULL,
    medida2 REAL NOT NULL,
    medida3 REAL NOT NULL,
    medida4 REAL,
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
    return { success: false, message: `Error al eliminar el usuario` };
  }
}
async function changePassword(idUser, currentPassword, newPassword) {
  try {
    if (!newPassword || !currentPassword) {
      return { success: false, message: "Debes de llenar todos los campos" };
    }
    if (newPassword.length < 6) {
      return {
        success: false,
        message: "La contraseña debe tener minimo 6 caracteres"
      };
    }
    const comparePassword = db.prepare("SELECT contrasena FROM users WHERE id = ?").get(idUser);
    if (!comparePassword || !await bcrypt.compare(currentPassword, comparePassword.contrasena)) {
      return { success: false, message: "Contraseña actual incorrecta" };
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE users SET contrasena = ? WHERE id = ?").run(
      passwordHash,
      idUser
    );
    return {
      success: true,
      message: "Contraseña cambiada con éxito"
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al cambiar la contraseña`
    };
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
  ipcMain.handle(
    "users:changePassword",
    (_e, idUser, currentPassword, newPassword) => changePassword(idUser, currentPassword, newPassword)
  );
}
const basePath = app.getPath("userData");
const sensorPath = join(basePath, "script.py");
const readSensor = async ({ port, mm, zero, device }) => {
  return new Promise((resolve) => {
    exec(
      `py "${sensorPath}" ${port} ${mm} ${zero} ${device} `,
      (error, stdout, stderr) => {
        if (error) {
          resolve(`Error: ${error.message}`);
          console.log(error.message);
        } else if (stderr) {
          resolve(`Error: ${stderr}`);
          console.log(stderr);
        } else {
          const match = stdout.match(/Lectura:\s*([\d.]+)/);
          if (match) {
            console.log(match[1]);
            resolve(match[1]);
          } else {
            resolve(stdout.trim());
          }
        }
      }
    );
  });
};
function registerSensorHandlers() {
  ipcMain.handle("sensor:read", (_e, config) => {
    return readSensor(config);
  });
}
function saveMeasurements(measurement) {
  const { modeloId, userId, measurements } = measurement;
  try {
    const insert = db.prepare(
      `INSERT INTO mediciones (modelo_id, user_id, medida1, medida2, medida3, medida4)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    insert.run(
      modeloId,
      userId,
      measurements[0],
      measurements[1],
      measurements[2],
      measurements[3]
    );
    return { success: true, message: "Mediciones guardadas con éxito" };
  } catch (error) {
    console.error("Error al guardar las mediciones:", error);
    return { success: false, message: error };
  }
}
function registerMeasurementHandlers() {
  ipcMain.handle("measurements:save", async (_e, measurement) => {
    return await saveMeasurements(measurement);
  });
}
function getGroupedStats(modeloId) {
  const posiblesMedidas = ["medida1", "medida2", "medida3", "medida4"];
  const medidasValidas = [];
  for (const medida of posiblesMedidas) {
    const row = db.prepare(
      `SELECT COUNT(${medida}) AS total
         FROM mediciones
         WHERE modelo_id = ? AND ${medida} IS NOT NULL`
    ).get(modeloId);
    if (row?.total > 0) {
      medidasValidas.push(medida);
    }
  }
  const resultados = [];
  for (const medida of medidasValidas) {
    const rows = db.prepare(
      `SELECT ${medida} AS valor
         FROM mediciones
         WHERE modelo_id = ? AND ${medida} IS NOT NULL
         ORDER BY fecha ASC`
    ).all(modeloId);
    for (let i = 0; i < rows.length; i += 5) {
      const grupo = rows.slice(i, i + 5).map((r) => r.valor);
      if (grupo.length === 0) continue;
      const prom = grupo.reduce((a, b) => a + b, 0) / grupo.length;
      const rango = Math.max(...grupo) - Math.min(...grupo);
      resultados.push({
        medida,
        grupo: Math.floor(i / 5) + 1,
        prom: Number(prom.toFixed(3)),
        rango: Number(rango.toFixed(3))
      });
    }
  }
  return resultados;
}
const __dirname = path$1.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width,
    // ancho de la pantalla
    height,
    // alto de la pantalla
    resizable: false,
    // no se puede cambiar el tamaño
    minimizable: false,
    // no se puede minimizar
    maximizable: false,
    // no se puede maximizar
    frame: true,
    // mantiene los botones nativos
    autoHideMenuBar: true,
    // oculta barra de menú (Edit, View, etc.)
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
  const resultados = getGroupedStats("front-lh");
  console.log(JSON.stringify(resultados, null, 2));
  registerUserHandlers();
  registerSensorHandlers();
  registerMeasurementHandlers();
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
