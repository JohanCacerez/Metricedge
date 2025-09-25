import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Modal } from "../components/Modal";
import { useState } from "react";
import { useUserStore } from "../store/userStore";
import { Toaster, toast } from "sonner";

export default function MainLayout() {
  const { user, login, loading } = useUserStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const isAuth = !!user;

  const handleLogin = async () => {
    try {
      await login({
        username,
        password,
      });
      setUsername("");
      setPassword("");
      toast.success("¡Inicio de sesión exitoso!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ocurrió un error desconocido");
      }
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        userName={isAuth ? user?.username || "Usuario" : "Invitado"}
        activeModel="Rear lh"
      />

      <main className="flex-1 p-4 overflow-auto bg-gray-50">
        <Outlet />
      </main>

      {/* Modal bloqueante si no está autenticado */}
      <Modal isOpen={!isAuth} onClose={() => {}} title="Iniciar sesión">
        <div className="flex flex-col gap-4">
          <p className="text-gray-700">
            Debes iniciar sesión para poder usar la aplicación.
          </p>

          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-2 border rounded"
          />

          <button
            className="px-4 py-2 rounded-md bg-blue-600 text-white"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </div>
      </Modal>
      <Toaster position="top-center" richColors />
    </div>
  );
}
