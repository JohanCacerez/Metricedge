import { ipcMain } from "electron";

import { LoginCredentials, AuthUser } from "../../../src/types/user";

import { Auth, addUser, changePassword, deleteUser } from "../../service/users";

export function registerUserHandlers() {
  ipcMain.handle("users:auth", (_e, credentials: LoginCredentials) =>
    Auth(credentials)
  );
  ipcMain.handle("users:create", (_e, credentials: AuthUser) =>
    addUser(credentials)
  );
  ipcMain.handle("users:delete", (_e, username: string) =>
    deleteUser(username)
  );
  ipcMain.handle(
    "users:changePassword",
    (_e, idUser: number, currentPassword: string, newPassword: string) =>
      changePassword(idUser, currentPassword, newPassword)
  );
}
