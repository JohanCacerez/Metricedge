import { app as u, ipcMain as i, BrowserWindow as f, screen as I } from "electron";
import { fileURLToPath as O } from "node:url";
import t from "node:path";
import { createRequire as R } from "module";
import b, { join as U } from "path";
import { exec as A } from "child_process";
const h = R(import.meta.url), S = h("better-sqlite3"), _ = h("bcrypt"), w = b.join(u.getPath("userData"), "database.sqlite"), n = new S(w);
n.exec(`
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
const P = ["rear_lh", "rear_rh", "front_lh", "front_rh"], y = n.prepare(
  "INSERT OR IGNORE INTO modelos (nombre) VALUES (?)"
);
P.forEach((s) => y.run(s));
const M = n.prepare("SELECT COUNT(*) as count FROM users WHERE rol = 'admin'").get();
if (M.count === 0) {
  const s = "admin", r = _.hashSync("admin123", 10);
  n.prepare(
    "INSERT INTO users (nombre, contrasena, rol) VALUES (?, ?, ?)"
  ).run(s, r, "admin");
}
const x = R(import.meta.url), l = x("bcrypt");
async function C(s) {
  const { username: e, password: a } = s;
  try {
    if (!e || !a)
      return { success: !1, message: "Debes de llenar todos los campos" };
    const r = n.prepare("SELECT * FROM users WHERE nombre = ?").get(e);
    return !r || !await l.compare(a, r.contrasena) ? { success: !1, message: "Usuario o contraseña incorrectos" } : {
      success: !0,
      message: "Usuario autenticado con éxito",
      user: {
        id: r.id,
        username: r.nombre,
        role: r.rol
      }
    };
  } catch {
    return { success: !1, message: "Error de conexión" };
  }
}
async function D(s) {
  const { username: e, password: a, role: r } = s;
  try {
    if (!e || !a || !r)
      return { success: !1, message: "Debes de llenar todos los campos" };
    if (n.prepare("SELECT * FROM users WHERE nombre = ?").get(e))
      return { success: !1, message: "Ya existe un usuario con ese nombre" };
    if (a.length < 6)
      return {
        success: !1,
        message: "La contraseña debe tener minimo 6 caracteres"
      };
    const d = await l.hash(a, 10);
    return n.prepare(
      "INSERT INTO users (nombre, contrasena, rol) VALUES (?, ?, ?)"
    ).run(e, d, r), {
      success: !0,
      message: "Usuario creado con éxito",
      username: e
    };
  } catch (o) {
    return { success: !1, message: `Error al crear el usuario: ${o}` };
  }
}
async function F(s) {
  try {
    return s ? n.prepare("SELECT * FROM users WHERE nombre = ?").get(s) ? (n.prepare("DELETE FROM users WHERE nombre = ?").run(s), {
      success: !0,
      message: "Usuario eliminado con éxito",
      username: s
    }) : { success: !1, message: "No existe ese usuario" } : { success: !1, message: "Debes de llenar todos los campos" };
  } catch {
    return { success: !1, message: "Error al eliminar el usuario" };
  }
}
async function H(s, e, a) {
  try {
    if (!a || !e)
      return { success: !1, message: "Debes de llenar todos los campos" };
    if (a.length < 6)
      return {
        success: !1,
        message: "La contraseña debe tener minimo 6 caracteres"
      };
    const r = n.prepare("SELECT contrasena FROM users WHERE id = ?").get(s);
    if (!r || !await l.compare(e, r.contrasena))
      return { success: !1, message: "Contraseña actual incorrecta" };
    const o = await l.hash(a, 10);
    return n.prepare("UPDATE users SET contrasena = ? WHERE id = ?").run(
      o,
      s
    ), {
      success: !0,
      message: "Contraseña cambiada con éxito"
    };
  } catch {
    return {
      success: !1,
      message: "Error al cambiar la contraseña"
    };
  }
}
function V() {
  i.handle(
    "users:auth",
    (s, e) => C(e)
  ), i.handle(
    "users:create",
    (s, e) => D(e)
  ), i.handle(
    "users:delete",
    (s, e) => F(e)
  ), i.handle(
    "users:changePassword",
    (s, e, a, r) => H(e, a, r)
  );
}
const $ = u.getPath("userData"), j = U($, "script.py"), W = async ({ port: s, mm: e, zero: a, device: r }) => new Promise((o) => {
  A(
    `py "${j}" ${s} ${e} ${a} ${r} `,
    (d, p, m) => {
      if (d)
        o(`Error: ${d.message}`), console.log(d.message);
      else if (m)
        o(`Error: ${m}`), console.log(m);
      else {
        const E = p.match(/Lectura:\s*([\d.]+)/);
        E ? (console.log(E[1]), o(E[1])) : o(p.trim());
      }
    }
  );
});
function v() {
  i.handle("sensor:read", (s, e) => W(e));
}
function Y(s) {
  const { modeloId: e, userId: a, measurements: r } = s;
  try {
    return n.prepare(
      `INSERT INTO mediciones (modelo_id, user_id, medida1, medida2, medida3, medida4)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      e,
      a,
      r[0],
      r[1],
      r[2],
      r[3]
    ), { success: !0, message: "Mediciones guardadas con éxito" };
  } catch (o) {
    return console.error("Error al guardar las mediciones:", o), { success: !1, message: o };
  }
}
function B() {
  i.handle("measurements:save", async (s, e) => await Y(e));
}
const g = t.dirname(O(import.meta.url));
process.env.APP_ROOT = t.join(g, "..");
const T = process.env.VITE_DEV_SERVER_URL, Q = t.join(process.env.APP_ROOT, "dist-electron"), N = t.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = T ? t.join(process.env.APP_ROOT, "public") : N;
let c;
function L() {
  const { width: s, height: e } = I.getPrimaryDisplay().workAreaSize;
  c = new f({
    icon: t.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width: s,
    // ancho de la pantalla
    height: e,
    // alto de la pantalla
    resizable: !1,
    // no se puede cambiar el tamaño
    minimizable: !1,
    // no se puede minimizar
    maximizable: !1,
    // no se puede maximizar
    frame: !0,
    // mantiene los botones nativos
    autoHideMenuBar: !0,
    // oculta barra de menú (Edit, View, etc.)
    webPreferences: {
      preload: t.join(g, "preload.mjs")
    }
  }), c.webContents.on("did-finish-load", () => {
    c?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), T ? c.loadURL(T) : c.loadFile(t.join(N, "index.html"));
}
u.on("window-all-closed", () => {
  process.platform !== "darwin" && (u.quit(), c = null);
});
u.on("activate", () => {
  f.getAllWindows().length === 0 && L();
});
u.whenReady().then(() => {
  V(), v(), B(), L();
});
export {
  Q as MAIN_DIST,
  N as RENDERER_DIST,
  T as VITE_DEV_SERVER_URL
};
