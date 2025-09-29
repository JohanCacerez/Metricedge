import { create } from "zustand";
import { LoginCredentials, User, AuthUser } from "../types/user";

interface UserState {
  user: User | null;
  message: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  create: (credentials: AuthUser) => Promise<void>;
  delete: (username: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  message: null,
  loading: false,
  login: async (credentials) => {
    set({ loading: true, message: null });
    try {
      const response = await window.electronAPI.users.auth(credentials);

      if (response.success && response.user) {
        set({ user: response.user, message: null, loading: false });
      } else {
        // marcar usuario como null y lanzar error para que el frontend lo capture
        set({ user: null, message: response.message, loading: false });
        throw new Error(response.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        set({ user: null, message: err.message, loading: false });
        throw err; // para que el frontend lo capture en try/catch
      }
      set({ user: null, message: "Error de conexión store", loading: false });
      throw new Error("Error de conexión store");
    }
  },
  logout: () => set({ user: null, message: null }),
  create: async (credentials) => {
    try {
      const response = await window.electronAPI.users.create(credentials);

      if (response.success) {
        set({ message: response.message }); // <-- aquí recuperas el mensaje de addUser
      } else {
        set({ message: response.message });
        throw new Error(response.message);
      }
    } catch (err) {
      if (err instanceof Error) throw err;
      set({ message: "Error de conexión store" });
      throw new Error("Error de conexión store");
    }
  },
  delete: async (username) => {
    try {
      const response = await window.electronAPI.users.delete(username);
      if (response.success) {
        set({ message: response.message });
      } else {
        set({ message: response.message });
        throw new Error(response.message);
      }
    } catch (err) {
      if (err instanceof Error) throw err;
      set({ message: "Error de conexión store" });
      throw new Error("Error de conexión store");
    }
  },
}));
