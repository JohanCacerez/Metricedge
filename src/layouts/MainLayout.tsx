import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Modal } from "../components/Modal";

import { useUserStore } from "../store/userStore";
import { Toaster } from "sonner";
import AuthModal from "../components/Content Modals/AuthModal/AuthModal";

export default function MainLayout() {
  const { user } = useUserStore();

  const isAuth = !!user;

  return (
    <div className="flex h-screen">
      <Sidebar
        userName={isAuth ? user?.username || "Usuario" : "Invitado"}
        activeModel="Rear lh"
      />

      <main className="flex-1 p-4 overflow-auto bg-bg">
        <Outlet />
      </main>

      {/* Modal bloqueante si no está autenticado */}
      <Modal isOpen={!isAuth} onClose={() => {}} title="Iniciar sesión">
        <AuthModal />
      </Modal>
      <Toaster position="top-center" richColors />
    </div>
  );
}
