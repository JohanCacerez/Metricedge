import { app as T, ipcMain as d, BrowserWindow as b, screen as _ } from "electron";
import { fileURLToPath as w } from "node:url";
import E from "node:path";
import { createRequire as O } from "module";
import P, { join as M } from "path";
import { exec as x } from "child_process";
const S = O(import.meta.url), y = S("better-sqlite3"), F = S("bcrypt"), D = P.join(T.getPath("userData"), "database.sqlite"), c = new y(D);
c.exec(`
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
const H = ["rear_lh", "rear_rh", "front_lh", "front_rh"], $ = c.prepare(
  "INSERT OR IGNORE INTO modelos (nombre) VALUES (?)"
);
H.forEach((s) => $.run(s));
const V = c.prepare("SELECT COUNT(*) as count FROM users WHERE rol = 'admin'").get();
if (V.count === 0) {
  const s = "admin", a = F.hashSync("admin123", 10);
  c.prepare(
    "INSERT INTO users (nombre, contrasena, rol) VALUES (?, ?, ?)"
  ).run(s, a, "admin");
}
const X = O(import.meta.url), N = X("bcrypt");
async function W(s) {
  const { username: e, password: r } = s;
  try {
    if (!e || !r)
      return { success: !1, message: "Debes de llenar todos los campos" };
    const a = c.prepare("SELECT * FROM users WHERE nombre = ?").get(e);
    return !a || !await N.compare(r, a.contrasena) ? { success: !1, message: "Usuario o contraseña incorrectos" } : {
      success: !0,
      message: "Usuario autenticado con éxito",
      user: {
        id: a.id,
        username: a.nombre,
        role: a.rol
      }
    };
  } catch {
    return { success: !1, message: "Error de conexión" };
  }
}
async function v(s) {
  const { username: e, password: r, role: a } = s;
  try {
    if (!e || !r || !a)
      return { success: !1, message: "Debes de llenar todos los campos" };
    if (c.prepare("SELECT * FROM users WHERE nombre = ?").get(e))
      return { success: !1, message: "Ya existe un usuario con ese nombre" };
    if (r.length < 6)
      return {
        success: !1,
        message: "La contraseña debe tener minimo 6 caracteres"
      };
    const i = await N.hash(r, 10);
    return c.prepare(
      "INSERT INTO users (nombre, contrasena, rol) VALUES (?, ?, ?)"
    ).run(e, i, a), {
      success: !0,
      message: "Usuario creado con éxito",
      username: e
    };
  } catch (o) {
    return { success: !1, message: `Error al crear el usuario: ${o}` };
  }
}
async function j(s) {
  try {
    return s ? c.prepare("SELECT * FROM users WHERE nombre = ?").get(s) ? (c.prepare("DELETE FROM users WHERE nombre = ?").run(s), {
      success: !0,
      message: "Usuario eliminado con éxito",
      username: s
    }) : { success: !1, message: "No existe ese usuario" } : { success: !1, message: "Debes de llenar todos los campos" };
  } catch {
    return { success: !1, message: "Error al eliminar el usuario" };
  }
}
async function G(s, e, r) {
  try {
    if (!r || !e)
      return { success: !1, message: "Debes de llenar todos los campos" };
    if (r.length < 6)
      return {
        success: !1,
        message: "La contraseña debe tener minimo 6 caracteres"
      };
    const a = c.prepare("SELECT contrasena FROM users WHERE id = ?").get(s);
    if (!a || !await N.compare(e, a.contrasena))
      return { success: !1, message: "Contraseña actual incorrecta" };
    const o = await N.hash(r, 10);
    return c.prepare("UPDATE users SET contrasena = ? WHERE id = ?").run(
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
function Y() {
  d.handle(
    "users:auth",
    (s, e) => W(e)
  ), d.handle(
    "users:create",
    (s, e) => v(e)
  ), d.handle(
    "users:delete",
    (s, e) => j(e)
  ), d.handle(
    "users:changePassword",
    (s, e, r, a) => G(e, r, a)
  );
}
const q = T.getPath("userData"), B = M(q, "script.py"), K = async ({ port: s, mm: e, zero: r, device: a }) => new Promise((o) => {
  x(
    `py "${B}" ${s} ${e} ${r} ${a} `,
    (i, n, t) => {
      if (i)
        o(`Error: ${i.message}`), console.log(i.message);
      else if (t)
        o(`Error: ${t}`), console.log(t);
      else {
        const u = n.match(/Lectura:\s*([\d.]+)/);
        u ? (console.log(u[1]), o(u[1])) : o(n.trim());
      }
    }
  );
});
function z() {
  d.handle("sensor:read", (s, e) => K(e));
}
function k(s) {
  const { modeloId: e, userId: r, measurements: a } = s;
  try {
    return c.prepare(
      `INSERT INTO mediciones (modelo_id, user_id, medida1, medida2, medida3, medida4)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      e,
      r,
      a[0],
      a[1],
      a[2],
      a[3]
    ), { success: !0, message: "Mediciones guardadas con éxito" };
  } catch (o) {
    return console.error("Error al guardar las mediciones:", o), { success: !1, message: o };
  }
}
function Q() {
  d.handle("measurements:save", async (s, e) => await k(e));
}
function J(s, e, r) {
  const a = ["medida1", "medida2", "medida3", "medida4"], o = [];
  for (const n of a) {
    let t = `SELECT COUNT(${n}) AS total FROM mediciones WHERE modelo_id = ?`;
    const u = [s];
    e && (t += " AND fecha >= ?", u.push(e)), r && (t += " AND fecha <= ?", u.push(r)), c.prepare(t).get(...u)?.total > 0 && o.push(n);
  }
  const i = [];
  for (const n of o) {
    let t = `SELECT ${n} AS valor FROM mediciones WHERE modelo_id = ? AND ${n} IS NOT NULL`;
    const u = [s];
    e && (t += " AND fecha >= ?", u.push(e)), r && (t += " AND fecha <= ?", u.push(r)), t += " ORDER BY fecha ASC";
    const l = c.prepare(t).all(...u);
    for (let p = 0; p < l.length; p += 5) {
      const m = l.slice(p, p + 5).map((g) => Number(g.valor));
      if (!m.length) continue;
      const f = m.reduce((g, U) => g + U, 0) / m.length, R = Math.max(...m) - Math.min(...m);
      i.push({
        medida: n,
        grupo: Math.floor(p / 5) + 1,
        prom: Number(f.toFixed(3)),
        rango: Number(R.toFixed(3)),
        numeros: m
      });
    }
  }
  return i;
}
function Z(s, e) {
  return s.filter((r) => r.medida === e);
}
function ee(s, e, r) {
  if (s.length === 0) return null;
  const a = s.flatMap((f) => f.numeros), o = a.reduce((f, R) => f + R, 0) / a.length, i = s.reduce((f, R) => f + R.rango, 0) / s.length;
  let n = o + 0.577 * i;
  n = n + 2e-5 * n;
  let t = o - 0.577 * i;
  t = t - 2e-5 * t;
  const u = 2.114 * i, l = i / 2.326, p = Math.min((e - o) / (3 * l), (o - r) / (3 * l)), m = (e - r) / (6 * l);
  return {
    Xmed: Number(o.toFixed(1)),
    LSCX: Number(n.toFixed(2)),
    LICX: Number(t.toFixed(2)),
    LSCR: Number(u.toFixed(3)),
    CPK: Number(p.toFixed(2)),
    sigma: Number(l.toFixed(4)),
    CP: Number(m.toFixed(2))
  };
}
function se() {
  d.handle(
    "chart:getGroupedStats",
    async (s, e, r, a) => await J(e, r, a)
  ), d.handle(
    "chart:filtrarPorMedida",
    async (s, e, r) => await Z(e, r)
  ), d.handle(
    "chart:calcDataForChart",
    async (s, e, r, a) => await ee(e, r, a)
  );
}
const I = E.dirname(w(import.meta.url));
process.env.APP_ROOT = E.join(I, "..");
const L = process.env.VITE_DEV_SERVER_URL, ie = E.join(process.env.APP_ROOT, "dist-electron"), A = E.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = L ? E.join(process.env.APP_ROOT, "public") : A;
let h;
function C() {
  const { width: s, height: e } = _.getPrimaryDisplay().workAreaSize;
  h = new b({
    icon: E.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
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
      preload: E.join(I, "preload.mjs")
    }
  }), h.webContents.on("did-finish-load", () => {
    h?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), L ? h.loadURL(L) : h.loadFile(E.join(A, "index.html"));
}
T.on("window-all-closed", () => {
  process.platform !== "darwin" && (T.quit(), h = null);
});
T.on("activate", () => {
  b.getAllWindows().length === 0 && C();
});
T.whenReady().then(() => {
  Y(), z(), Q(), se(), C();
});
export {
  ie as MAIN_DIST,
  A as RENDERER_DIST,
  L as VITE_DEV_SERVER_URL
};
