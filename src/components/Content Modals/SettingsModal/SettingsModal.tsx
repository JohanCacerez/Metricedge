import { useState } from "react";

interface TabContentProps {
  currentTab: string;
}

const TabContent = ({ currentTab }: TabContentProps) => {
  switch (currentTab) {
    case "usuario":
      return <div>Contenido de Usuario</div>;
    case "panel":
      return <div>Contenido de Panel de Control</div>;
    case "sensors":
      return <div>Contenido de Sensors</div>;
    default:
      return <div>Selecciona una pestaña</div>;
  }
};

export const SettingsModal = () => {
  const [currentTab, setCurrentTab] = useState<string>("usuario");

  return (
    <div className="flex flex-1 min-h-full">
      {/* Sidebar fijo */}
      <nav className="w-48 bg-surface border-r text-text border-border p-4 space-y-2 font-body">
        <button
          onClick={() => setCurrentTab("usuario")}
          className={`w-full p-2 rounded ${
            currentTab === "usuario"
              ? "bg-secondary text-white"
              : "hover:bg-secondary-dark"
          }`}
        >
          Usuario
        </button>
        <button
          onClick={() => setCurrentTab("panel")}
          className={`w-full p-2 rounded ${
            currentTab === "panel"
              ? "bg-secondary text-white"
              : "hover:bg-secondary-dark"
          }`}
        >
          Panel de control
        </button>
        <button
          onClick={() => setCurrentTab("sensors")}
          className={`w-full p-2 rounded ${
            currentTab === "sensors"
              ? "bg-secondary text-white"
              : "hover:bg-secondary-dark"
          }`}
        >
          Sensors
        </button>
      </nav>

      {/* Contenido a la derecha */}
      <section className="flex-1 p-6 overflow-auto bg-surface">
        <TabContent currentTab={currentTab} />
      </section>
    </div>
  );
};
