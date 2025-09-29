import { useUserStore } from "../../../../store/userStore";
import { toast } from "sonner";

export default function DeleteUser() {
  const { delete: deleteUser } = useUserStore();

  const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    try {
      await deleteUser(username);
      toast.success("Usuario eliminado con éxito");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ocurrió un error desconocido");
      }
    }
  };

  return (
    <form
      className="flex flex-col border border-border rounded-2xl p-6 text-text"
      onSubmit={handleDelete}
    >
      <h1 className="text-xl font-title mb-4 text-text">Eliminar usuario</h1>
      <label>Nombre:</label>
      <input
        type="text"
        name="username"
        placeholder="Ej: Juan"
        className="w-full p-2 border rounded-md mb-4"
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        Eliminar Usuario
      </button>
    </form>
  );
}
