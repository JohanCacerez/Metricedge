// src/components/Sidebar.tsx
import { FaCogs, FaRuler, FaSignOutAlt } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

import { NavLink } from "react-router-dom";
import { useState } from "react";

import { Modal } from "../components/Modal";
import { useUserStore } from "../store/userStore";
import { SettingsModal } from "./Content Modals/SettingsModal/SettingsModal";

import { useModelStore } from "../store/modelStore";

interface SidebarProps {
  userName: string;
}

export const Sidebar = ({ userName }: SidebarProps) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { logout } = useUserStore();
  const { activeModel } = useModelStore();

  const handleLogout = () => {
    try {
      logout();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Ocurrió un error desconocido");
      }
    }
  };
  return (
    <aside className="h-screen w-64 bg-surface text-text font-body flex flex-col">
      {/* Usuario y ajustes */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="text-lg font-body">{userName}</div>
        <button
          onClick={() => setModalOpen(true)}
          className="text-text-muted hover:text-text cursor-pointer"
        >
          <FaCogs size={20} />
        </button>
      </div>

      {/* Rutas de la app */}
      <nav className="flex-1 p-4 space-y-2 font-body">
        <NavLink
          to={"/"}
          className="flex items-center w-full font-body p-2 rounded cursor-pointer hover:bg-secondary-dark"
        >
          <MdDashboard className="mr-2" /> Dashboard
        </NavLink>
        <NavLink
          to={"/mediciones"}
          className="flex items-center w-full p-2 rounded cursor-pointer hover:bg-secondary-dark"
        >
          <FaRuler className="mr-2" /> Mediciones
        </NavLink>
      </nav>

      {/* Modelo activo */}
      <div className="p-4 border-b border-border">
        <span className="text-sm text-text-muted font-code">
          Modelo activo:
        </span>
        <div className="mt-1 font-code ">{activeModel?.name}</div>
      </div>

      {/* Cerrar sesión */}
      <div className="p-4 border-t border-border ">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-2 rounded cursor-pointer hover:bg-secondary-dark"
        >
          <FaSignOutAlt className="mr-2" /> Cerrar sesión
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Ajustes"
        width="1000px"
        height="600px"
      >
        <SettingsModal />
      </Modal>
    </aside>
  );
};
