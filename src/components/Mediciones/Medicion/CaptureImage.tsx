import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { useModelStore } from "../../../store/modelStore";
import { useSensorStore } from "../../../store/sensorStore";

const modelInputs: Record<
  string,
  { top: string; left: string; placeholder: string }[]
> = {
  "front-lh": [
    { top: "12%", left: "17%", placeholder: "F7" },
    { top: "30%", left: "60%", placeholder: "F6" },
    { top: "12%", left: "72%", placeholder: "F1" },
  ],
  "front-rh": [
    { top: "12%", left: "75%", placeholder: "F7" },
    { top: "30%", left: "33%", placeholder: "F6" },
    { top: "12%", left: "20%", placeholder: "F1" },
  ],
  "rear-lh": [
    { top: "30%", left: "50%", placeholder: "F14" },
    { top: "30%", left: "27%", placeholder: "F15" },
    { top: "30%", left: "16%", placeholder: "F1" },
    { top: "75%", left: "77%", placeholder: "F8" },
  ],
  "rear-rh": [
    { top: "30%", left: "43%", placeholder: "F14" },
    { top: "30%", left: "65%", placeholder: "F15" },
    { top: "27%", left: "75%", placeholder: "F1" },
    { top: "75%", left: "16%", placeholder: "F8" },
  ],
};

// Tolerancias por modelo y por input
const inputTolerances: Record<
  string,
  Record<string, { min: number; max: number }>
> = {
  "front-lh": {
    F7: { min: 232.1, max: 233.9 },
    F6: { min: 749.5, max: 752.5 },
    F1: { min: 1246, max: 1250 },
  },
  "front-rh": {
    F7: { min: 232.1, max: 233.9 },
    F6: { min: 749.5, max: 752.5 },
    F1: { min: 1246, max: 1250 },
  },
  "rear-lh": {
    F14: { min: 256.1, max: 257.9 },
    F15: { min: 393.5, max: 396.5 },
    F1: { min: 738, max: 742 },
    F8: { min: 491, max: 495 },
  },
  "rear-rh": {
    F14: { min: 256.1, max: 257.9 },
    F15: { min: 393.5, max: 396.5 },
    F1: { min: 738, max: 742 },
    F8: { min: 491, max: 495 },
  },
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
  const [lastValidValues, setLastValidValues] = useState<(string | number)[]>(
    inputs.map(() => "")
  );

  // Helper: valida si es un número o no
  const sanitizeReading = (
    reading: string | number,
    fallback: string | number
  ) => {
    const num = Number(reading);
    if (isNaN(num)) {
      console.warn("Lectura inválida, usando último valor válido");
      return fallback;
    }
    return num;
  };

  // Función para actualizar el valor del sensor
  const updateSensorReading = async () => {
    if (!inputs.length || activeIndex >= inputs.length) return;

    let sensor = currentSensor === 1 ? activeSensor1 : activeSensor2;
    if (
      (activeModel?.id === "rear-lh" || activeModel?.id === "rear-rh") &&
      activeIndex === 3
    ) {
      sensor = activeSensor2;
      setCurrentSensor(2);
    }

    if (!sensor || capturedMeasurements[activeIndex] !== undefined) return;

    let result: string | number;
    try {
      result = await read({
        port: sensor.puerto.toString(),
        mm: sensor.tamaño,
        device: sensor.dispositivo.toString(),
        zero: zero[activeIndex] || 0,
      });

      result = sanitizeReading(result, lastValidValues[activeIndex]);
      setLastValidValues((prev) => {
        const newVals = [...prev];
        newVals[activeIndex] = result;
        return newVals;
      });
    } catch (err) {
      console.warn("Sensor error, usando último valor válido:", err);
      result = lastValidValues[activeIndex];
    }

    setValues((prev) =>
      prev.map((v, i) => (i === activeIndex ? result.toString() : v))
    );
  };

  const setZeroCurrentInput = () => {
    const currentValue = Number(values[activeIndex]) || 0;
    setZero((prev) => {
      const newZeros = [...prev];
      newZeros[activeIndex] = currentValue;
      return newZeros;
    });
  };

  // Leer sensor cada segundo
  useEffect(() => {
    const interval = setInterval(updateSensorReading, 1000);
    return () => clearInterval(interval);
  }, [
    activeSensor1,
    activeSensor2,
    activeIndex,
    currentSensor,
    zero,
    capturedMeasurements,
    lastValidValues,
  ]);

  const captureCurrentValue = async () => {
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

    let result: string | number;
    try {
      result = await read({
        port: sensor.puerto.toString(),
        mm: sensor.tamaño,
        device: sensor.dispositivo.toString(),
        zero: zero[activeIndex] || 0,
      });

      result = sanitizeReading(result, lastValidValues[activeIndex]);
      setLastValidValues((prev) => {
        const newVals = [...prev];
        newVals[activeIndex] = result;
        return newVals;
      });
    } catch (err) {
      console.warn(
        "Sensor error al capturar, usando último valor válido:",
        err
      );
      result = lastValidValues[activeIndex];
    }

    setValues((prev) =>
      prev.map((v, i) => (i === activeIndex ? result.toString() : v))
    );
    setCapturedMeasurements((prev) => {
      const newMeasurements = [...prev];
      newMeasurements[activeIndex] = result;
      return newMeasurements;
    });
    setActiveIndex((prev) => Math.min(prev + 1, inputs.length - 1));
  };

  // Determinar color del input según tolerancia
  const getInputClass = (index: number, placeholder: string) => {
    const val = Number(values[index]);
    if (!activeModel || isNaN(val)) return "border-gray-500";
    const tolerance = inputTolerances[activeModel.id]?.[placeholder];
    if (!tolerance) return "border-gray-500";
    if (val >= tolerance.min && val <= tolerance.max) return "border-green-500";
    return "border-red-500";
  };

  useImperativeHandle(ref, () => ({
    captureCurrentValue,
    resetInputs: () => {
      setValues(inputs.map(() => ""));
      setActiveIndex(0);
      setCurrentSensor(1);
      setCapturedMeasurements([]);
      setZero(inputs.map(() => 0));
      setLastValidValues(inputs.map(() => ""));
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
          className={`absolute w-16 bg-gray-600 border rounded px-2 py-1 ${
            index === activeIndex
              ? "border-yellow-400"
              : getInputClass(index, input.placeholder)
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
