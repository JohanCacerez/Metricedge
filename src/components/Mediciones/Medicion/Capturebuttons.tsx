import { CaptureImageRef } from "./CaptureImage";

interface CaptureButtonsProps {
  captureRef: React.RefObject<CaptureImageRef>;
}

export default function Capturebuttons({ captureRef }: CaptureButtonsProps) {
  const handleSave = () => {
    const measurements = captureRef.current?.getCapturedMeasurements();
    if (measurements?.length === 0) {
      alert("No hay mediciones para guardar.");
      return;
    }
    console.log("Mediciones capturadas:", measurements);
    // 👆 Aquí después vas a llamar tu función para guardar en la BD
    captureRef.current?.resetInputs();
  };
  return (
    <div className="flex flex-col h-full gap-4 justify-center">
      <button
        className="bg-primary hover:bg-primary-dark rounded-2xl text-text font-ui font-bold text-2xl cursor-pointer flex-1"
        onClick={() => captureRef.current?.resetInputs()}
      >
        Reiniciar
      </button>

      <button
        className="bg-lime-600 hover:bg-lime-700 rounded-2xl text-text font-ui font-bold text-2xl cursor-pointer flex-1"
        onClick={() => captureRef.current?.captureCurrentValue()}
      >
        Medir
      </button>

      <button
        className="bg-orange-600 hover:bg-orange-700 rounded-2xl text-text font-ui font-bold text-2xl cursor-pointer flex-1"
        onClick={() => captureRef.current?.setZeroCurrentInput()}
      >
        Establecer 0
      </button>

      <button
        className="bg-blue-600 hover:bg-blue-700 rounded-2xl text-text font-ui font-bold text-2xl cursor-pointer flex-1"
        onClick={handleSave}
      >
        Guardar
      </button>
    </div>
  );
}
