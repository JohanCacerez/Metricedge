import { ipcMain } from "electron";

import { LoginCredentials, AuthUser } from "../../../src/types/user";

import { Auth, addUser } from "../../service/users";

export function registerUserHandlers() {
  ipcMain.handle("users:auth", (_e, credentials: LoginCredentials) =>
    Auth(credentials)
  );
  ipcMain.handle("users:create", (_e, credentials: AuthUser) =>
    addUser(credentials)
  );
}
