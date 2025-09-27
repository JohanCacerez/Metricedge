import { useState } from "react";
import { useUserStore } from "../../../../store/userStore";
import { toast } from "sonner";

export default function CreateUser() {
  const createUser = useUserStore((state) => state.create);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "operador",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createUser(formData); // llama a tu store
      setFormData({ username: "", password: "", role: "operador" });
      toast.success("Usuario creado con éxito"); // mensaje de éxito
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message); // mensaje de addUser (ej: "Ya existe un usuario…")
      } else {
        toast.error("Ocurrió un error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-surface border text-text border-border p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-title mb-4">Crear Usuario</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block mb-1 text-sm font-medium">Nombre</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* Contraseña */}
        <div>
          <label className="block mb-1 text-sm font-medium">Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
            minLength={6}
          />
        </div>

        {/* Rol */}
        <div>
          <label className="block mb-1 text-sm font-medium">Rol</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="admin">Admin</option>
            <option value="operador">Operador</option>
            <option value="auditor">Auditor</option>
          </select>
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          {loading ? "Creando..." : "Crear Usuario"}
        </button>
      </form>
    </div>
  );
}
