import { LoginCredentials, LoginResponse } from "./user";

declare global {
  interface Window {
    electronAPI: {
      users: UserAPI;
    };
  }
}

export interface UserAPI {
  auth: (credentials: LoginCredentials) => Promise<LoginResponse>;
}
