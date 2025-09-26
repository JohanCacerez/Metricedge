import { ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string; // Ejemplo: "600px" o "50%"
  height?: string; // Ejemplo: "400px" o "80vh"
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  width = "450px",
  height = "320px",
}: ModalProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-50">
      {/* Contenedor del modal con ancho y alto dinámicos */}
      <div
        className={`bg-bg rounded-xl shadow-lg p-6 relative flex flex-col`}
        style={{ width, height }}
      >
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-text-muted hover:text-button-delete-hover"
        >
          ✕
        </button>

        {/* Título */}
        {title && (
          <h2 className="text-xl font-title mb-4 text-text">{title}</h2>
        )}

        {/* Contenido */}
        <div className="flex-1 overflow-auto rounded">{children}</div>
      </div>
    </div>,
    document.body
  );
};
