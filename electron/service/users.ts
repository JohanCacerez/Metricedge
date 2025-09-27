import {
  LoginCredentials,
  LoginResponse,
  AuthUser,
  AuthResponse,
} from "../../src/types/user";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const bcrypt = require("bcrypt");
import db from "../db/index";

export async function Auth(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const { username, password } = credentials;
  try {
    if (!username || !password) {
      return { success: false, message: "Debes de llenar todos los campos" };
    }
    // identificar usuario por nombre
    const userExist = db
      .prepare("SELECT * FROM users WHERE nombre = ?")
      .get(username);

    // Verificar si el usuario existe y si la contraseña es correcta
    if (!userExist || !(await bcrypt.compare(password, userExist.contrasena))) {
      return { success: false, message: "Usuario o contraseña incorrectos" };
    }

    // Devolver datos del usuario si la autenticación es exitosa
    return {
      success: true,
      message: "Usuario autenticado con éxito",
      user: {
        id: userExist.id,
        username: userExist.nombre,
        role: userExist.rol,
      },
    };
  } catch (err) {
    return { success: false, message: "Error de conexión" };
  }
}

export async function addUser(credentials: AuthUser): Promise<AuthResponse> {
  const { username, password, role } = credentials;
  try {
    if (!username || !password || !role) {
      return { success: false, message: "Debes de llenar todos los campos" };
    }
    // identificar usuario por nombre
    const userExist = db
      .prepare("SELECT * FROM users WHERE nombre = ?")
      .get(username);
    if (userExist) {
      return { success: false, message: "Ya existe un usuario con ese nombre" };
    }
    if (password.length < 6) {
      return {
        success: false,
        message: "La contraseña debe tener minimo 6 caracteres",
      };
    }
    const passwordHash = await bcrypt.hash(password, 10);
    // insertar usuario en la base de datos
    db.prepare(
      "INSERT INTO users (nombre, contrasena, rol) VALUES (?, ?, ?)"
    ).run(username, passwordHash, role);

    return {
      success: true,
      message: "Usuario creado con éxito",
      username: username,
    };
  } catch (err) {
    return { success: false, message: `Error al crear el usuario: ${err}` };
  }
}
