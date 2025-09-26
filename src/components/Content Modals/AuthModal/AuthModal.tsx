import { useUserStore } from "../../../store/userStore";
import { useState } from "react";
import { toast } from "sonner";

export default function AuthModal() {
  const { login, loading } = useUserStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
    <div>
      <div className="flex flex-col gap-4">
        <p className="text-text font-body">
          Debes iniciar sesión para poder usar la aplicación.
        </p>

        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="px-3 py-2 border rounded text-text"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-3 py-2 border rounded text-text"
        />

        <button
          className="px-4 py-2 rounded-md bg-primary text-white font-ui cursor-pointer"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </div>
    </div>
  );
}
