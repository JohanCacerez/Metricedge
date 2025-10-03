import { useState, useEffect } from "react";

import { useModelStore } from "../../../store/modelStore";
import { useSensorStore } from "../../../store/sensorStore";

// Configuración de inputs por modelo
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

export default function CaptureImage() {
  const { activeModel } = useModelStore();
  const { activeSensor1, read } = useSensorStore();

  // Busca los inputs configurados para el modelo activo
  const inputs = activeModel?.id ? modelInputs[activeModel.id] || [] : [];

  const [values, setValues] = useState<string[]>(inputs.map(() => ""));

  // Función para leer el sensor 1 y actualizar el primer input
  const updateSensorReading = async () => {
    if (activeSensor1) {
      const result = await read({
        port: activeSensor1.puerto.toString(),
        mm: activeSensor1.tamaño,
        device: activeSensor1.dispositivo.toString(),
        zero: 0,
      });
      setValues((prev) => [result.toString(), ...prev.slice(1)]);
    }
  };

  // Ejemplo: leer el sensor cada 1 segundo
  useEffect(() => {
    const interval = setInterval(updateSensorReading, 1000);
    return () => clearInterval(interval);
  }, [activeSensor1]);

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
          className="absolute bg-gray-600 border rounded px-2 py-1"
          style={{ top: input.top, left: input.left }}
          placeholder={input.placeholder}
          value={values[index]}
          {...(index === 0
            ? { readOnly: true }
            : {
                onChange: (e) => {
                  const newVal = e.target.value;
                  setValues((prev) =>
                    prev.map((v, i) => (i === index ? newVal : v))
                  );
                },
              })}
        />
      ))}
    </section>
  );
}
