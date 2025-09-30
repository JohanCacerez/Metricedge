import { useState } from "react";
import { DataSensor } from "../../../../types/sensors";
import { useSensorStore } from "../../../../store/sensorStore";
import { toast } from "sonner";

export const SensorConfig = () => {
  const { activeSensor1, activeSensor2, setConfigSensor1, setConfigSensor2 } =
    useSensorStore();

  // Inicializamos el estado local con los valores del store si existen
  const [config, setConfig] = useState<DataSensor>(
    activeSensor1 || { puerto: 0, tamaño: 10, dispositivo: 0 }
  );
  const [config2, setConfig2] = useState<DataSensor>(
    activeSensor2 || { puerto: 0, tamaño: 10, dispositivo: 0 }
  );

  const handleChange = (field: keyof DataSensor, value: number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleChange2 = (field: keyof DataSensor, value: number) => {
    setConfig2((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Guardamos ambos sensores en Zustand y localStorage
    setConfigSensor1(config);
    setConfigSensor2(config2);
    toast.info("Se han configurado correctamente los sensores");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4border border-border rounded-2xl p-6 shadow text-text"
    >
      <h1 className="font-title text-2xl font-bold mb-6">
        Configuracion de sensores
      </h1>
      {/* Sensor 1 */}
      <fieldset className="border border-border p-4 rounded-lg space-y-4 mb-4">
        <legend className="font-title">Sensor 1</legend>
        <div className="flex justify-around gap-4 items-center">
          <div>
            <label className="block font-body">Puerto:</label>
            <select
              value={config.puerto}
              onChange={(e) => handleChange("puerto", Number(e.target.value))}
              className="border p-1 rounded text-primary"
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-body">Dispositivo:</label>
            <select
              value={config.dispositivo}
              onChange={(e) =>
                handleChange("dispositivo", Number(e.target.value))
              }
              className="border p-1 rounded text-primary"
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-bold">
              Tamaño del sensor (mm):
            </label>
            <input
              type="number"
              value={config.tamaño}
              onChange={(e) => handleChange("tamaño", Number(e.target.value))}
              className="border p-1 rounded w-full"
            />
          </div>
        </div>
      </fieldset>

      {/* Sensor 2 */}
      <fieldset className="border border-border p-4 rounded-lg space-y-4">
        <legend className="font-title">Sensor 2</legend>
        <div className="flex justify-around gap-4 items-center">
          <div>
            <label className="block font-body">Puerto:</label>
            <select
              value={config2.puerto}
              onChange={(e) => handleChange2("puerto", Number(e.target.value))}
              className="border p-1 rounded text-primary"
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-body">Dispositivo:</label>
            <select
              value={config2.dispositivo}
              onChange={(e) =>
                handleChange2("dispositivo", Number(e.target.value))
              }
              className="border p-1 rounded text-primary"
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-bold">
              Tamaño del sensor (mm):
            </label>
            <input
              type="number"
              value={config2.tamaño}
              onChange={(e) => handleChange2("tamaño", Number(e.target.value))}
              className="border p-1 rounded w-full"
            />
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        className=" bg-primary text-white mt-4 px-4 py-2 rounded hover:bg-primary-dark self-end"
      >
        Guardar configuración
      </button>
    </form>
  );
};
