import { app as R, ipcMain as p, BrowserWindow as b, screen as C } from "electron";
import { fileURLToPath as U } from "node:url";
import f from "node:path";
import { createRequire as O } from "module";
import P, { join as M } from "path";
import { exec as x } from "child_process";
const S = O(import.meta.url), y = S("better-sqlite3"), F = S("bcrypt"), D = P.join(R.getPath("userData"), "database.sqlite"), l = new y(D);
l.exec(`
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
const X = ["rear_lh", "rear_rh", "front_lh", "front_rh"], H = l.prepare(
  "INSERT OR IGNORE INTO modelos (nombre) VALUES (?)"
);
X.forEach((s) => H.run(s));
const $ = l.prepare("SELECT COUNT(*) as count FROM users WHERE rol = 'admin'").get();
if ($.count === 0) {
  const s = "admin", a = F.hashSync("admin123", 10);
  l.prepare(
    "INSERT INTO users (nombre, contrasena, rol) VALUES (?, ?, ?)"
  ).run(s, a, "admin");
}
const V = O(import.meta.url), g = V("bcrypt");
async function W(s) {
  const { username: e, password: r } = s;
  try {
    if (!e || !r)
      return { success: !1, message: "Debes de llenar todos los campos" };
    const a = l.prepare("SELECT * FROM users WHERE nombre = ?").get(e);
    return !a || !await g.compare(r, a.contrasena) ? { success: !1, message: "Usuario o contraseña incorrectos" } : {
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
    if (l.prepare("SELECT * FROM users WHERE nombre = ?").get(e))
      return { success: !1, message: "Ya existe un usuario con ese nombre" };
    if (r.length < 6)
      return {
        success: !1,
        message: "La contraseña debe tener minimo 6 caracteres"
      };
    const d = await g.hash(r, 10);
    return l.prepare(
      "INSERT INTO users (nombre, contrasena, rol) VALUES (?, ?, ?)"
    ).run(e, d, a), {
      success: !0,
      message: "Usuario creado con éxito",
      username: e
    };
  } catch (n) {
    return { success: !1, message: `Error al crear el usuario: ${n}` };
  }
}
async function Y(s) {
  try {
    return s ? l.prepare("SELECT * FROM users WHERE nombre = ?").get(s) ? (l.prepare("DELETE FROM users WHERE nombre = ?").run(s), {
      success: !0,
      message: "Usuario eliminado con éxito",
      username: s
    }) : { success: !1, message: "No existe ese usuario" } : { success: !1, message: "Debes de llenar todos los campos" };
  } catch {
    return { success: !1, message: "Error al eliminar el usuario" };
  }
}
async function j(s, e, r) {
  try {
    if (!r || !e)
      return { success: !1, message: "Debes de llenar todos los campos" };
    if (r.length < 6)
      return {
        success: !1,
        message: "La contraseña debe tener minimo 6 caracteres"
      };
    const a = l.prepare("SELECT contrasena FROM users WHERE id = ?").get(s);
    if (!a || !await g.compare(e, a.contrasena))
      return { success: !1, message: "Contraseña actual incorrecta" };
    const n = await g.hash(r, 10);
    return l.prepare("UPDATE users SET contrasena = ? WHERE id = ?").run(
      n,
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
function G() {
  p.handle(
    "users:auth",
    (s, e) => W(e)
  ), p.handle(
    "users:create",
    (s, e) => v(e)
  ), p.handle(
    "users:delete",
    (s, e) => Y(e)
  ), p.handle(
    "users:changePassword",
    (s, e, r, a) => j(e, r, a)
  );
}
const q = R.getPath("userData"), B = M(q, "script.py"), K = async ({ port: s, mm: e, zero: r, device: a }) => new Promise((n) => {
  x(
    `py "${B}" ${s} ${e} ${r} ${a} `,
    (d, u, t) => {
      if (d)
        n(`Error: ${d.message}`), console.log(d.message);
      else if (t)
        n(`Error: ${t}`), console.log(t);
      else {
        const i = u.match(/Lectura:\s*([\d.]+)/);
        i ? (console.log(i[1]), n(i[1])) : n(u.trim());
      }
    }
  );
});
function z() {
  p.handle("sensor:read", (s, e) => K(e));
}
function k(s) {
  const { modeloId: e, userId: r, measurements: a } = s;
  try {
    return l.prepare(
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
  } catch (n) {
    return console.error("Error al guardar las mediciones:", n), { success: !1, message: n };
  }
}
function Q() {
  p.handle("measurements:save", async (s, e) => await k(e));
}
function J(s, e, r) {
  const a = ["medida1", "medida2", "medida3", "medida4"], n = [];
  for (const u of a) {
    let t = `SELECT COUNT(${u}) AS total FROM mediciones WHERE modelo_id = ?`;
    const i = [s];
    e && (t += " AND fecha >= ?", i.push(e)), r && (t += " AND fecha <= ?", i.push(r)), l.prepare(t).get(...i)?.total > 0 && n.push(u);
  }
  const d = [];
  for (const u of n) {
    let t = `SELECT ${u} AS valor FROM mediciones WHERE modelo_id = ? AND ${u} IS NOT NULL`;
    const i = [s];
    e && (t += " AND fecha >= ?", i.push(e)), r && (t += " AND fecha <= ?", i.push(r)), t += " ORDER BY fecha ASC";
    const m = l.prepare(t).all(...i);
    for (let E = 0; E < m.length; E += 5) {
      const o = m.slice(E, E + 5).map((N) => Number(N.valor));
      if (!o.length) continue;
      const c = o.reduce((N, w) => N + w, 0) / o.length, h = Math.max(...o) - Math.min(...o);
      d.push({
        medida: u,
        grupo: Math.floor(E / 5) + 1,
        prom: Number(c.toFixed(3)),
        rango: Number(h.toFixed(3)),
        numeros: o
      });
    }
  }
  return d;
}
function Z(s, e) {
  return s.filter((r) => r.medida === e);
}
function ee(s, e, r) {
  if (s.length === 0) return null;
  const a = s.flatMap((c) => c.numeros), n = a.reduce((c, h) => c + h, 0) / a.length, d = s.reduce((c, h) => c + h.rango, 0) / s.length;
  let u = n + 0.577 * d;
  u = u + 2e-5 * u;
  let t = n - 0.577 * d;
  t = t - 2e-5 * t;
  const i = 2.114 * d, m = d / 2.326, E = Math.min((e - n) / (3 * m), (n - r) / (3 * m)), o = (e - r) / (6 * m);
  return {
    Xmed: Number(n.toFixed(1)),
    LSCX: Number(u.toFixed(2)),
    LICX: Number(t.toFixed(2)),
    LSCR: Number(i.toFixed(3)),
    CPK: Number(E.toFixed(2)),
    sigma: Number(m.toFixed(4)),
    CP: Number(o.toFixed(2))
  };
}
function se(s) {
  if (!s || s.length < 6)
    return { tendencia: "estable", pendiente: 0 };
  const e = s.slice(5).map((o) => o.Xmed), r = e.length, a = Array.from({ length: r }, (o, c) => c + 1), n = a.reduce((o, c) => o + c, 0), d = e.reduce((o, c) => o + c, 0), u = a.reduce((o, c, h) => o + c * e[h], 0), t = a.reduce((o, c) => o + c * c, 0), i = (r * u - n * d) / (r * t - n * n);
  let m;
  const E = 0.02;
  return i > E ? m = "aumento" : i < -E ? m = "descenso" : m = "estable", { tendencia: m, pendiente: Number(i.toFixed(4)) };
}
function re() {
  p.handle(
    "chart:getGroupedStats",
    async (s, e, r, a) => await J(e, r, a)
  ), p.handle(
    "chart:filtrarPorMedida",
    async (s, e, r) => await Z(e, r)
  ), p.handle(
    "chart:calcDataForChart",
    async (s, e, r, a) => await ee(e, r, a)
  ), p.handle("chart:detectarTendencia", async (s, e) => await se(e));
}
const I = f.dirname(U(import.meta.url));
process.env.APP_ROOT = f.join(I, "..");
const L = process.env.VITE_DEV_SERVER_URL, ue = f.join(process.env.APP_ROOT, "dist-electron"), A = f.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = L ? f.join(process.env.APP_ROOT, "public") : A;
let T;
function _() {
  const { width: s, height: e } = C.getPrimaryDisplay().workAreaSize;
  T = new b({
    icon: f.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
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
      preload: f.join(I, "preload.mjs")
    }
  }), T.webContents.on("did-finish-load", () => {
    T?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), L ? T.loadURL(L) : T.loadFile(f.join(A, "index.html"));
}
R.on("window-all-closed", () => {
  process.platform !== "darwin" && (R.quit(), T = null);
});
R.on("activate", () => {
  b.getAllWindows().length === 0 && _();
});
R.whenReady().then(() => {
  G(), z(), Q(), re(), _();
});
export {
  ue as MAIN_DIST,
  A as RENDERER_DIST,
  L as VITE_DEV_SERVER_URL
};
