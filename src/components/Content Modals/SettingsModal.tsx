import { NavLink } from "react-router-dom";

export const SettingsModal = () => {
  return (
    <div className="flex flex-1 min-h-full">
      {/* Sidebar fijo */}
      <nav className="w-48 bg-surface border-r text-text border-border p-4 space-y-2 font-body">
        <NavLink
          to="/usuario"
          className="flex items-center w-full p-2 rounded hover:bg-secondary-dark"
        >
          Usuario
        </NavLink>
        <NavLink
          to="/panel"
          className="flex items-center w-full p-2 rounded hover:bg-secondary-dark"
        >
          Panel de control
        </NavLink>
        <NavLink
          to="/sensors"
          className="flex items-center w-full p-2 rounded hover:bg-secondary-dark"
        >
          Sensors
        </NavLink>
      </nav>

      {/* Contenido a la derecha */}
      <section className="flex-1 p-6 overflow-auto bg-surface">
        <h1 className="text-text text-xl font-bold">Hola</h1>
      </section>
    </div>
  );
};
