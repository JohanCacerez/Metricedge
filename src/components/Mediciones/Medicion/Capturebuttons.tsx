import { toast } from "sonner";

import { CaptureImageRef } from "./CaptureImage";

import { useMeasurementStore } from "../../../store/measurement";
import { useUserStore } from "../../../store/userStore";
import { useModelStore } from "../../../store/modelStore";

interface CaptureButtonsProps {
  captureRef: React.RefObject<CaptureImageRef>;
}

export default function Capturebuttons({ captureRef }: CaptureButtonsProps) {
  const { saveMeasurement } = useMeasurementStore();
  const { user } = useUserStore();
  const { activeModel } = useModelStore();

  const handleSave = async () => {
    const rawMeasurements = captureRef.current?.getCapturedMeasurements() ?? [];

    // 🔑 convertir todo a número explícitamente
    const measurements = rawMeasurements.map((m) => Number(m));

    if (measurements.length === 0) {
      toast.info("No hay mediciones para guardar.");
      return;
    }

    try {
      if (!activeModel) {
        toast.error("No hay un modelo activo seleccionado.");
        return;
      }
      if (!user) {
        toast.error("No hay un usuario autenticado.");
        return;
      }

      await saveMeasurement({
        modeloId: activeModel.id,
        userId: user.id,
        measurements, // ✅ ahora es number[]
      });
      captureRef.current?.resetInputs();
      toast.success("Mediciones guardadas con éxito.");
    } catch (error) {
      toast.error("Error al guardar las mediciones.");
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 justify-center">
      <button
        className="bg-blue-600 hover:bg-blue-700 rounded-2xl text-text font-ui font-bold text-2xl cursor-pointer flex-1"
        onClick={handleSave}
      >
        Guardar
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
        className="bg-yellow-600 hover:bg-yellow-700 rounded-2xl text-text font-ui font-bold text-2xl cursor-pointer flex-1"
        onClick={() => captureRef.current?.resetInputs()}
      >
        Reiniciar
      </button>
    </div>
  );
}
