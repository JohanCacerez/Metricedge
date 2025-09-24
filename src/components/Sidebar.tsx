// src/components/Sidebar.tsx
import { FaCogs, FaRuler, FaSignOutAlt } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

interface SidebarProps {
  userName: string;
  activeModel: string;
}

export const Sidebar = ({ userName, activeModel }: SidebarProps) => {
  return (
    <aside className="h-screen w-64 bg-surface text-text font-body flex flex-col">
      {/* Usuario y ajustes */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="text-lg font-body">{userName}</div>
        <button className="text-gray-300 hover:text-white cursor-pointer">
          <FaCogs size={20} />
        </button>
      </div>

      {/* Rutas de la app */}
      <nav className="flex-1 p-4 space-y-2 font-body">
        <button className="flex items-center w-full font-body p-2 rounded cursor-pointer hover:bg-secondary-dark">
          <MdDashboard className="mr-2" /> Dashboard
        </button>
        <button className="flex items-center w-full p-2 rounded cursor-pointer hover:bg-secondary-dark">
          <FaRuler className="mr-2" /> Mediciones
        </button>
      </nav>

      {/* Modelo activo */}
      <div className="p-4 border-b border-border">
        <span className="text-sm text-text-muted font-code">
          Modelo activo:
        </span>
        <div className="mt-1 font-code ">{activeModel}</div>
      </div>

      {/* Cerrar sesión */}
      <div className="p-4 border-t border-border ">
        <button className="flex items-center w-full p-2 rounded cursor-pointer hover:bg-secondary-dark">
          <FaSignOutAlt className="mr-2" /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
};
