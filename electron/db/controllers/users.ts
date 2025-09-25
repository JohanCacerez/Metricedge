import { ipcMain } from "electron";

import { LoginCredentials } from "../../../src/types/user";

import { Auth } from "../../service/users";

export function registerUserHandlers() {
  ipcMain.handle("users:auth", (_e, credentials: LoginCredentials) =>
    Auth(credentials)
  );
}
