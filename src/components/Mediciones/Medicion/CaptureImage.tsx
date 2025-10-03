import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { useModelStore } from "../../../store/modelStore";
import { useSensorStore } from "../../../store/sensorStore";

const modelInputs: Record<
  string,
  { top: string; left: string; placeholder: string }[]
> = {
  "front-lh": [
    { top: "30%", left: "25%", placeholder: "Input 1" },
    { top: "30%", left: "55%", placeholder: "Input 2" },
    { top: "27%", left: "72%", placeholder: "Input 3" },
  ],
  "front-rh": [
    { top: "30%", left: "25%", placeholder: "Input 1" },
    { top: "30%", left: "55%", placeholder: "Input 2" },
    { top: "27%", left: "72%", placeholder: "Input 3" },
  ],
  "rear-lh": [
    { top: "30%", left: "25%", placeholder: "Input 1" },
    { top: "30%", left: "55%", placeholder: "Input 2" },
    { top: "27%", left: "72%", placeholder: "Input 3" },
    { top: "40%", left: "40%", placeholder: "Input 4" },
  ],
  "rear-rh": [
    { top: "30%", left: "25%", placeholder: "Input 1" },
    { top: "30%", left: "55%", placeholder: "Input 2" },
    { top: "27%", left: "72%", placeholder: "Input 3" },
    { top: "40%", left: "40%", placeholder: "Input 4" },
  ],
};

export interface CaptureImageRef {
  captureCurrentValue: () => void;
  resetInputs: () => void;
  getCapturedMeasurements: () => (string | number)[];
  setZeroCurrentInput: () => void;
}

const CaptureImage = forwardRef<CaptureImageRef>((_props, ref) => {
  const { activeModel } = useModelStore();
  const { activeSensor1, activeSensor2, read } = useSensorStore();
  const inputs = activeModel?.id ? modelInputs[activeModel.id] || [] : [];
  const [values, setValues] = useState<string[]>(inputs.map(() => ""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentSensor, setCurrentSensor] = useState(1);
  const [capturedMeasurements, setCapturedMeasurements] = useState<
    (string | number)[]
  >([]);
  const [zero, setZero] = useState<number[]>(inputs.map(() => 0));

  // Función que lee el sensor y actualiza el input activo
  const updateSensorReading = async () => {
    if (!inputs.length) return;

    // Si ya medimos todos los inputs, no hacer nada
    if (activeIndex >= inputs.length) return;

    let sensor = currentSensor === 1 ? activeSensor1 : activeSensor2;

    if (
      (activeModel?.id === "rear-lh" || activeModel?.id === "rear-rh") &&
      activeIndex === 3
    ) {
      sensor = activeSensor2;
      setCurrentSensor(2);
    }

    if (!sensor) return;

    // Solo actualizar si no hay valor capturado
    if (capturedMeasurements[activeIndex] !== undefined) return;

    const result = await read({
      port: sensor.puerto.toString(),
      mm: sensor.tamaño,
      device: sensor.dispositivo.toString(),
      zero: zero[activeIndex] || 0,
    });

    setValues((prev) =>
      prev.map((v, i) => (i === activeIndex ? result.toString() : v))
    );
  };

  const setZeroCurrentInput = () => {
    const currentValue = Number(values[activeIndex]) || 0; // toma el valor actual del input
    setZero((prev) => {
      const newZeros = [...prev];
      newZeros[activeIndex] = currentValue; // lo guardamos como cero
      console.log("Zero actualizado:", newZeros[activeIndex]);
      return newZeros;
    });
  };

  // Leer sensor cada 500 milisegundos
  useEffect(() => {
    const interval = setInterval(updateSensorReading, 500);
    return () => clearInterval(interval);
  }, [
    activeSensor1,
    activeSensor2,
    activeIndex,
    currentSensor,
    zero,
    capturedMeasurements,
  ]);

  const captureCurrentValue = async () => {
    if (activeIndex >= inputs.length) return;

    // Determinar sensor correcto
    let sensor = currentSensor === 1 ? activeSensor1 : activeSensor2;

    // Si estamos en rear y es el 4to input, usar sensor2
    if (
      (activeModel?.id === "rear-lh" || activeModel?.id === "rear-rh") &&
      activeIndex === 3
    ) {
      sensor = activeSensor2;
      setCurrentSensor(2);
    }

    if (!sensor) return;

    const result = await read({
      port: sensor.puerto.toString(),
      mm: sensor.tamaño,
      device: sensor.dispositivo.toString(),
      zero: zero[activeIndex] || 0,
    });

    // Guardar valor en el input y en las mediciones
    setValues((prev) =>
      prev.map((v, i) => (i === activeIndex ? result.toString() : v))
    );

    setCapturedMeasurements((prev) => {
      const newMeasurements = [...prev];
      newMeasurements[activeIndex] = result; // puede ser string o número
      return newMeasurements;
    });

    // Avanzar al siguiente input
    setActiveIndex((prev) => Math.min(prev + 1, inputs.length - 1));
  };

  useImperativeHandle(ref, () => ({
    captureCurrentValue,
    resetInputs: () => {
      setValues(inputs.map(() => ""));
      setActiveIndex(0);
      setCurrentSensor(1);
      setCapturedMeasurements([]);
      setZero(inputs.map(() => 0));
    },
    getCapturedMeasurements: () => capturedMeasurements,
    setZeroCurrentInput,
  }));

  return (
    <section className="w-full h-full flex items-center justify-center overflow-hidden relative">
      <img
        src={activeModel?.photo}
        alt="modelo"
        className="absolute inset-0 w-full h-full object-fill rounded-2xl"
      />
      {inputs.map((input, index) => (
        <input
          key={index}
          type="text"
          className={`absolute bg-gray-600 border rounded px-2 py-1 ${
            index === activeIndex ? "border-yellow-400" : ""
          }`}
          style={{ top: input.top, left: input.left }}
          placeholder={input.placeholder}
          value={values[index]}
          readOnly
        />
      ))}
    </section>
  );
});

export default CaptureImage;
