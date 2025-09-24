// src/electron/db/index.ts
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");

import { app } from "electron";
import path from "path";

export function initDB() {
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

  const adminExists = db
    .prepare("SELECT COUNT(*) as count FROM users WHERE rol = 'admin'")
    .get();

  if (adminExists.count === 0) {
    const defaultUsername = "admin";
    const defaultPassword = "admin123";

    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(defaultPassword, saltRounds);

    db.prepare(
      "INSERT INTO users (nombre, contrasena, rol) VALUES (?, ?, ?)"
    ).run(defaultUsername, hashedPassword, "admin");
  }
}
