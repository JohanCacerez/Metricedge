import { useState } from "react";
import { toast } from "sonner";

import { useUserStore } from "../../../../store/userStore";

export default function ChangePassword() {
  const changePassword = useUserStore((state) => state.changePassword);
  const user = useUserStore((state) => state.user);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (!user) {
      toast.error("Usuario no autenticado");
      return;
    }
    try {
      changePassword(user!.id, currentPassword, newPassword);
      toast.success("Contraseña cambiada con éxito");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-1/2 space-y-4 border border-border rounded-2xl p-6 shadow text-text"
      >
        <h1>Cambiar Contraseña</h1>
        <div>
          <label htmlFor="current-password">Contraseña Actual</label>
          <input
            type="password"
            id="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="border border-border rounded p-2"
          />
        </div>
        <div>
          <label htmlFor="new-password">Nueva Contraseña</label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border border-border rounded p-2"
          />
        </div>
        <div>
          <label htmlFor="confirm-password">Confirmar Nueva Contraseña</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-border rounded p-2"
          />
        </div>
        <button type="submit" className="bg-primary text-white rounded p-2">
          Cambiar Contraseña
        </button>
      </form>
    </div>
  );
}
